---
title: "Client Configuration"
description: "This chapter covers the MSST-Net client core's configuration file, command-line options and data directory."
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

## Overview

Client core settings fall into two categories:

| Type | Stored in | How to change |
|---|---|---|
| Startup configuration | `core.toml` | Edit the file, or use command-line options or environment variables; takes effect after restarting the core |
| Network settings | `net_settings.json` in the data directory | Change them in the controller under **Settings → Diagnostics & Debugging → Advanced Options** |

Most users never need to change the startup configuration.

---

## Configuration File `core.toml`

The configuration file is created automatically on first start. Default locations:

| Platform | Path |
|---|---|
| Linux | `~/.config/msst-net/core.toml` |
| macOS | `~/Library/Application Support/msst-net/core.toml` |
| Windows | `%APPDATA%\msst-net\core.toml` |

> When running as root (for example as a system service), `~` refers to the root user's home directory.

Available options:

| Option | Default | Description |
|---|---|---|
| `coordinator_url` | `https://coord.msst-net.msst2031.cn` | Coordinator address |
| `udp_port` | `21031` | UDP port for the data channel; the core allows it in the system firewall (see [System Firewall](/en/connect/install/client#system-firewall)) |
| `tun_name` | `msst0` | Virtual network adapter name |
| `tun_mtu` | `1280` | Virtual network adapter MTU (the MTU in network settings takes precedence) |
| `metrics_port` | `9100` | Prometheus metrics port |
| `ipc_socket` | Automatic | IPC socket path |
| `log_level` | `info` | Log level: `trace` / `debug` / `info` / `warn` / `error` |
| `data_dir` | Automatic | Data directory (see below) |
| `preferred_relay` | None | Preferred relay address (the preferred relay in network settings takes precedence) |

Example:

```toml
coordinator_url = "https://coord.msst-net.msst2031.cn"
udp_port = 21031
tun_name = "msst0"
tun_mtu = 1280
log_level = "info"
```

---

## Command-Line Options

```text
msst-net-core [OPTIONS]

  -c, --config <PATH>        Configuration file path
      --coordinator <URL>    Coordinator address
      --udp-port <PORT>      UDP port for the data channel
      --metrics-port <PORT>  Prometheus metrics port
  -l, --log-level <LEVEL>    Log level
  -f, --foreground           Run in the foreground
  -d, --daemon               Run in the background
  -h, --help                 Show help
  -V, --version              Show version
```

Command-line options override settings of the same name in the configuration file.

---

## Environment Variables

| Variable | Description |
|---|---|
| `MSST_COORD_URL` | Coordinator address (takes precedence over the configuration file and command line) |
| `MSST_UDP_PORT` | UDP port for the data channel |
| `MSST_METRICS_PORT` | Prometheus metrics port |
| `MSST_IPC_SOCKET` | IPC socket path |
| `RUST_LOG` | Log filter (takes precedence over the log level setting) |

---

## Network Settings

The following settings are stored in `net_settings.json` in the data directory. We recommend changing them through the controller:

| Setting | Default | Description |
|---|---|---|
| Disable P2P direct connections | Off | Always forward via relay |
| Lock current paths | Off | Freeze the paths to all peers |
| Relay preference | Automatic | Pin an **official** relay; takes effect after reconnecting to the coordinator |
| MTU | Automatic (1280) | 1280–1500; takes effect after restarting the core |
| Relay keepalive interval | 25 seconds | 5–30 seconds; applies to relay registration only — direct paths are checked every second (up to 3.1.7 it applied to direct paths too) |
| DNS configuration mode (Linux only) | Prefer split DNS | See [MSST-Net ezPlay](/en/connect/extras/ezplay#local-name-resolution) |
| Bypass other VPNs' full tunnels (Linux only) | On | MSST-Net's own traffic (peers, relays, coordinator) uses the physical network, not another VPN such as a Tailscale exit node; turn it off if relays or the coordinator are reachable only through the other VPN. Applies immediately |
| Block other VPNs over MSST-Net (Linux only) | On | Tailscale and the like see MSST-Net addresses as a direct path and build a tunnel inside a tunnel; when on, they use their other paths. Applies immediately |

Linux-only options are not shown in the mobile controller.

`preferred_relay` in `core.toml` likewise accepts only official relays; an address that isn't in the official relay list is ignored and a relay is chosen automatically.

---

## Data Directory

The data directory holds persistent data such as device identity, keys and rules. Default locations:

| Platform | Path |
|---|---|
| Linux | `~/.local/share/msst-net/` |
| macOS | `~/Library/Application Support/msst-net/` |
| Windows | `%APPDATA%\msst-net\` |
| Android | App-private directory |

### Upgrading from 3.0.x

If `data_dir` is not set explicitly and the 3.0.x data directory already contains `identity.json`, the core keeps using the old directory to preserve the device ID, user ID and virtual IP:

- Regular deployment: `~/MSST-Net/`
- Container deployment (`CORE_MODE=container`): `/var/lib/msst/`

On the first start of 3.1, if the 3.0.x `config.yaml` set a custom coordinator address, it is also written into the new `core.toml` automatically.

### Directory Contents

| File | Description |
|---|---|
| `private.key` | Device private key (**never share it**) |
| `identity.json` | User / device ID, mnemonic, display name, ezPlay hostname, authentication credentials |
| `firewall_rules.json` | Firewall rules |
| `permission_groups.json` | Permission groups |
| `ping_settings.json` | Ping toggle |
| `net_settings.json` | Network settings |
| `contacts.json` | Recently contacted devices (used for interactive authorization) |
| `peer_cache.json` | Peer information cache |

> The device ID is derived from `private.key`. If the device ID in `identity.json` does not match the private key, the core re-derives the device ID from the private key.

---

## Related

- [System Service](/en/connect/install/service)
- [Diagnostics](/en/connect/troubleshoot/diagnostics)
