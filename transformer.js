'use strict';

const assert = require('assert');
const { StringDecoder } = require('string_decoder');
const { Transform } = require('stream');

const CRC32 = require('./crc32');

const NO_SECTION = 0;
const CONFIGURATION_EXPORT = 1;
const CFGFILE = 2;
const B64FILE = 3;
const BINFILE = 4;

const START_OF_EXPORT_REGEX = /^\*{4} .+ CONFIGURATION EXPORT$/;
const VARIABLE_DEFINITION_REGEX = /^(.+)=(.+)$/;
const START_OF_CFGFILE_REGEX = /^\*{4} CFGFILE:(.+)$/;
const EOF = '// EOF';
const START_OF_BXXFILE_REGEX = /^\*{4} B(64|IN)FILE:(.+)$/;
const END_OF_FILE = '**** END OF FILE ****';
const END_OF_EXPORT_REGEX = /^\*{4} END OF EXPORT ([A-Z0-9]{8}) \*{4}$/;

const kCrc = Symbol('kCrc');
const kDecoded = Symbol('kDecoded');
const kDecoder = Symbol('kDecoder');
const kEofSeen = Symbol('kEofSeen');
const kSection = Symbol('kSection');

/**
 * Class representing a transform stream to calculate and update the checksum of
 * the FRITZ!Box configuration file.
 *
 * @extends Transform
 */
class Transformer extends Transform {
  /**
   * Create a new `Transformer`.
   */
  constructor() {
    super();
    this[kCrc] = new CRC32();
    this[kDecoded] = '';
    this[kDecoder] = new StringDecoder();
    this[kEofSeen] = false;
    this[kSection] = NO_SECTION;
  }

  /**
   * Implements `Transform.prototype._transform()`.
   *
   * @param {Buffer} chunk The chunk of data to transform
   * @param {String} encoding The character encoding of `chunk`
   * @param {Function} callback The callback
   * @private
   */
  _transform(chunk, encoding, callback) {
    this[kDecoded] += this[kDecoder].write(chunk);

    const lines = this[kDecoded].split(/\r?\n/);

    this[kDecoded] = lines.pop();

    for (const line of lines) {
      this.push(this.handleLine(line));
    }

    callback();
  }

  /**
   * Implements `Transform.prototype._flush()`.
   *
   * @param {Function} callback The callback
   * @private
   */
  _flush(callback) {
    this[kDecoded] += this[kDecoder].end();

    if (this[kDecoded]) {
      this.push(this.handleLine(this[kDecoded]));
    }

    callback();
  }

  /**
   * Handle a line of the FRITZ!Box configuration file.
   *
   * @param {String} A line of the configuration file
   * @return {String} The (possibly updated) line
   * @public
   */
  handleLine(line) {
    if (this[kSection] === NO_SECTION) {
      if (START_OF_EXPORT_REGEX.test(line)) {
        this[kSection] = CONFIGURATION_EXPORT;
      }
    } else if (this[kSection] === CONFIGURATION_EXPORT) {
      let result;

      if ((result = VARIABLE_DEFINITION_REGEX.exec(line))) {
        this[kCrc].update(Buffer.from(result[1] + result[2] + '\0'));
      } else if ((result = START_OF_CFGFILE_REGEX.exec(line))) {
        this[kSection] = CFGFILE;
        this[kCrc].update(Buffer.from(result[1] + '\0'));
      } else if ((result = START_OF_BXXFILE_REGEX.exec(line))) {
        this[kSection] = result[1] === '64' ? B64FILE : BINFILE;
        this[kCrc].update(Buffer.from(result[2] + '\0'));
      } else if ((result = END_OF_EXPORT_REGEX.exec(line))) {
        const crc = this[kCrc].getValue().toString(16).toUpperCase();

        line = line.replace(result[1], crc);
        this.emit('checksum', crc);
      }
    } else if (this[kSection] === CFGFILE) {
      if (line === END_OF_FILE) {
        this[kEofSeen] = false;
        this[kSection] = CONFIGURATION_EXPORT;
      } else if (!this[kEofSeen]) {
        if (line === EOF) {
          this[kEofSeen] = true;
          this[kCrc].update(Buffer.from(line + '\n'));
        } else {
          this[kCrc].update(Buffer.from(line.replace(/\\\\/g, '\\') + '\n'));
        }
      } else {
        assert.strictEqual(line, '');
      }
    } else if (this[kSection] === B64FILE || this[kSection] === BINFILE) {
      if (line === END_OF_FILE) {
        this[kSection] = CONFIGURATION_EXPORT;
      } else {
        const encoding = this[kSection] === B64FILE ? 'base64' : 'hex';

        this[kCrc].update(Buffer.from(line, encoding));
      }
    }

    return line + '\n';
  }
}

module.exports = Transformer;
