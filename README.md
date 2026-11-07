# dsh-static-token

English | [中文](README.zh.md)

A DeepSeek Harness (DSH) plugin to configure a **persistent, static launch token** for the Web GUI, preventing session expiration and authentication issues behind reverse proxies or across remote devices.

---

## The Problem

By default, DSH generates an ephemeral, in-memory launch token every time the service starts. On headless, reverse-proxied, or containerized deployments (such as Kubernetes with Traefik/Authentik), restarting the process invalidates the current token. Accessing the dashboard from a secondary device (e.g., a phone) requires retrieving a new token from the host logs.

## The Solution

`dsh-static-token` hooks into the `connection` service and overrides the generated launch token with a fixed token defined via an environment variable or profile configuration. 

---

## Features

- **Static Launch Token:** Keep the same token across service restarts and host reboots.
- **Environment Variable Priority:** Reads `DSH_WEB_TOKEN` from the process environment first, with fallback to profile plugin configuration.
- **Seamless Reverse Proxy Integration:** Simplifies setting up bookmarks or forward-auth setups without constantly tracking server logs.
- **Zero Overhead:** Pure ESM, no external runtime dependencies, minimal memory footprint.

---

## Installation

### Via DSH CLI

```bash
dsh plugin --profile web add dsh-static-token
```

### From Local Source

```bash
git clone https://github.com/mdalboni/dsh-static-token.git
dsh plugin --profile web add link:./dsh-static-token
```

---

## Configuration

You can supply your static token in one of two ways:

### 1. Environment Variable (Recommended for Systemd / Containers)

Export `DSH_WEB_TOKEN` in your environment or service definition:

```bash
export DSH_WEB_TOKEN="your-custom-secure-token-here"
```

In a **systemd service** (e.g., `/etc/systemd/system/dsh.service`):

```ini
[Service]
Environment="DSH_WEB_TOKEN=your-custom-secure-token-here"
```

### 2. Plugin Configuration

Configure the token directly in your DSH profile configuration:

```yaml
# cordis.patch.yml or profile configuration
dsh-static-token:
  token: "your-custom-secure-token-here"
```

---

## Usage

Once configured and restarted, authenticate any new device or browser by visiting:

```
https://your-dsh-domain.com/?token=your-custom-secure-token-here
```

DSH will set its standard 30-day signed session cookie and redirect to the clean URL.

---

## Testing

Run the included test suite using Node.js:

```bash
node test.js
```

---

## License

MIT © Maxwell Dalboni
