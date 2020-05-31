#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const { ArgumentParser, RawDescriptionHelpFormatter } = require('argparse');

const Transformer = require('./transformer');
const { name, version } = require('./package');

const parser = new ArgumentParser({
  epilog: [
    'Examples:',
    `  ${name} backup.export`,
    `  ${name} --print-config backup.export`,
    `  cat backup.export | ${name} --print-config`
  ].join('\n'),
  formatterClass: RawDescriptionHelpFormatter,
  prog: name,
  version
});

parser.addArgument(['-o', '--output'], {
  help: 'Write to file instead of standard output.',
  metavar: 'FILE'
});

parser.addArgument('--print-config', {
  action: 'storeTrue',
  help:
    'Print the whole configuration updating the checksum with the calculated ' +
    'one.'
});

parser.addArgument('FILE', {
  help: 'The backup file. If omitted, read standard input.',
  nargs: '?'
});

const args = parser.parseArgs();
const cwd = process.cwd();
const source = args.FILE
  ? fs.createReadStream(path.resolve(process.cwd(), args.FILE))
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
