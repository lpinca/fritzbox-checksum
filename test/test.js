'use strict';

const fs = require('fs');
const path = require('path');
const test = require('tape');
const { fork } = require('child_process');

test('calculates the checksum of the FRITZ!Box backup file', function (t) {
  const source = fs.createReadStream(
    path.join(
      __dirname,
      'fixtures',
      'FRITZ.Box 7490 113.07.12i_01.01.70_0106.export'
    )
  );

  const chunks = [];
  const subprocess = fork(path.join(__dirname, '..', 'cli.js'), {
    stdio: 'pipe'
  });

  subprocess.stdout.on('data', function (chunk) {
    chunks.push(chunk);
  });

  subprocess.on('close', function (code) {
    t.equal(code, 0);
    t.deepEqual(Buffer.concat(chunks), Buffer.from('099C13BE\n'));
    t.end();
  });

  source.pipe(subprocess.stdin);
});

test('honors the --print-config argument', function (t) {
  const inputChunks = [];
  const outputChunks = [];

  const source = fs.createReadStream(
    path.join(
      __dirname,
      'fixtures',
      'FRITZ.Box 7490 113.07.12i_01.01.70_0106.export'
    )
  );

  const subprocess = fork(
    path.join(__dirname, '..', 'cli.js'),
    ['--print-config'],
    {
      stdio: 'pipe'
    }
  );

  subprocess.stdout.on('data', function (chunk) {
    outputChunks.push(chunk);
  });

  subprocess.on('close', function (code) {
    t.equal(code, 0);
    t.deepEqual(Buffer.concat(inputChunks), Buffer.concat(outputChunks));
    t.end();
  });

  source.on('data', function (chunk) {
    inputChunks.push(chunk);
  });

  source.pipe(subprocess.stdin);
});
