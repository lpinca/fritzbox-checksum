# fritzbox-checksum

[![Version npm][npm-fritzbox-checksum-badge]][npm-fritzbox-checksum]

CLI utility to calculate and optionally update the checksum of the FRITZ!Box
configuration file.

## Install

```
npm install -g fritzbox-checksum
```

## Usage

```
usage: fritzbox-checksum [-h] [-v] [-o FILE] [--print-config] [FILE]

Positional arguments:
  FILE                  The configuration file. If omitted, read standard
                        input.

Optional arguments:
  -h, --help            Show this help message and exit.
  -v, --version         Show program's version number and exit.
  -o FILE, --output FILE
                        Write to file instead of stdout.
  --print-config        Print the whole configuration updating the checksum
                        with the calculated one.

Examples:
  fritzbox-checksum config.export
  fritzbox-checksum --print-config config.export
  cat config.export | fritzbox-checksum --print-config
```

## License

[MIT](LICENSE)

[npm-fritzbox-checksum-badge]:
  https://img.shields.io/npm/v/fritzbox-checksum.svg
[npm-fritzbox-checksum]: https://www.npmjs.com/package/fritzbox-checksum
