# fritzbox-checksum

[![Version npm][npm-fritzbox-checksum-badge]][npm-fritzbox-checksum]
[![CI][ci-fritzbox-checksum-badge]][ci-fritzbox-checksum]
[![Coverage][coverage-fritzbox-checksum-badge]][coverage-fritzbox-checksum]

CLI utility to calculate and optionally update the checksum of the FRITZ!Box
backup file.

## Install

```
npm install -g fritzbox-checksum
```

## Usage

```
usage: fritzbox-checksum [-h] [-o FILE] [--print-config] [-v] [FILE]

positional arguments:
  FILE                  the backup file (default: stdin)

optional arguments:
  -h, --help            show this help message and exit
  -o FILE, --output FILE
                        write to file instead of stdout
  --print-config        print the whole configuration updating the checksum with
                        the calculated one
  -v, --version         show program's version number and exit

examples:
  fritzbox-checksum backup.export
  fritzbox-checksum --print-config backup.export
  cat backup.export | fritzbox-checksum --print-config
```

## License

[MIT](LICENSE)

[npm-fritzbox-checksum-badge]:
  https://img.shields.io/npm/v/fritzbox-checksum.svg?logo=npm
[npm-fritzbox-checksum]: https://www.npmjs.com/package/fritzbox-checksum
[ci-fritzbox-checksum-badge]:
  https://img.shields.io/github/actions/workflow/status/lpinca/fritzbox-checksum/ci.yml?branch=master&label=CI&logo=github
[ci-fritzbox-checksum]:
  https://github.com/lpinca/fritzbox-checksum/actions?query=workflow%3ACI
[coverage-fritzbox-checksum-badge]:
  https://img.shields.io/coveralls/lpinca/fritzbox-checksum/master.svg?logo=coveralls
[coverage-fritzbox-checksum]:
  https://coveralls.io/r/lpinca/fritzbox-checksum?branch=master
