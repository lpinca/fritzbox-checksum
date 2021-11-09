#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const { ArgumentParser, RawDescriptionHelpFormatter } = require('argparse');

const Transformer = require('./transformer');
const { name, version } = require('./package');

const parser = new ArgumentParser({
  epilog: [
    'examples:',
    `  ${name} backup.export`,
    `  ${name} --print-config backup.export`,
    `  cat backup.export | ${name} --print-config`
  ].join('\n'),
  formatter_class: RawDescriptionHelpFormatter,
  prog: name
});

parser.add_argument('-o', '--output', {
  help: 'write to file instead of stdout',
  metavar: 'FILE'
});

parser.add_argument('--print-config', {
  action: 'store_true',
  help:
    'print the whole configuration updating the checksum with the calculated ' +
    'one'
});

parser.add_argument('-v', '--version', { action: 'version', version });

parser.add_argument('FILE', {
  help: 'the backup file (default: stdin)',
  nargs: '?'
});

const args = parser.parse_args();
const cwd = process.cwd();
const source = args.FILE
  ? fs.createReadStream(path.resolve(cwd, args.FILE))
  : process.stdin;
const destination = args.output
  ? fs.createWriteStream(path.resolve(cwd, args.output))
  : process.stdout;

const transformer = new Transformer();

if (!args.print_config) {
  transformer.on('checksum', function (checksum) {
    destination.write(checksum + '\n');
  });
  transformer.resume();
} else {
  transformer.pipe(destination);
}

source.pipe(transformer);
