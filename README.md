# dsh-static-token

Configurable static launch token for DeepSeek Harness Web GUI.

## Features

- Override in-memory launch token via environment variable `DSH_WEB_TOKEN`.
- Configurable static token via plugin options.
- Automates authentication for specified trusted hosts.

## Installation

Add to your `dsh` profile:

```json
{
  "name": "dsh-static-token",
  "source": "link:./packages/dsh-static-token",
  "enabled": true
}
```

## License

MIT
