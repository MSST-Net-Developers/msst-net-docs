---
title: "WebUI Remote Management"
description: "This chapter covers how to deploy the WebUI controller and manage an MSST-Net client remotely from a browser."
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

## When to Use It

The WebUI controller (`msst-net-webui`) is suited for:

- Servers without a desktop environment
- Devices you want to view and manage remotely from another computer

The WebUI runs on the same device as the client core, connects to the core over local IPC, and then serves the same interface as the desktop edition to the browser over HTTPS.

---

## First Start

```bash
msst-net-webui
```

On first start you must set an **access password** (at least 6 characters). The password is obtained in this order:

1. The file pointed to by the `PASSWORD_FILE` environment variable (default `/run/secrets/admin_password`)
2. The `ADMIN_PASSWORD` environment variable
3. If neither is set, you are prompted to enter and confirm it in the terminal

The password is stored as an Argon2 hash and is not asked for on later starts.

Once it is running, open in your browser:

```text
https://<device-address>:18080
```

The WebUI generates a new self-signed certificate on every start, so the browser will warn that the certificate is untrusted the first time; confirm to continue.

---

## Configuration Files

WebUI configuration is stored in `~/.config/msst-net-webui/` (`%APPDATA%\msst-net-webui\` on Windows; set `MSST_WEBUI_CONFIG_DIR` to use another directory, e.g. a volume in a container):

| File | Description |
|---|---|
| `config.toml` | Listening port and IP allowlist |
| `passwd` | Hash of the access password |

Default contents of `config.toml`:

```toml
port = 18080
allowed_cidrs = [
    "127.0.0.0/8",
    "::1/128",
    "10.0.0.0/8",
    "172.16.0.0/12",
    "192.168.0.0/16",
    "fc00::/7",
]
```

> If `config.toml` exists but cannot be parsed, the WebUI refuses to start instead of falling back to the defaults, so the allowlist is never loosened by accident.

> MSST-Net's own virtual networks (`172.22.0.0/16`, `fd22:2222:2222:2222::/64`) are **not allowed** to reach the WebUI by default, even though the default allowlist's `172.16.0.0/12` and `fc00::/7` cover them. To allow other devices in MSST-Net, add an entry inside the virtual network explicitly (for example one device's `172.22.x.y/32`).

### Environment Variables

| Variable | Description |
|---|---|
| `WEBUI_BIND` | Override the listening address (default `0.0.0.0:<port>`) |
| `MSST_WEBUI_CONFIG_DIR` | Configuration directory |
| `MSST_IPC_PATH` | Specify the client core's IPC socket path |
| `PASSWORD_FILE` / `ADMIN_PASSWORD` | Source of the access password on first start |

---

## Security

- **Access password**: every page and API requires logging in first; failed logins are answered with a delay to slow down brute-force attempts. A login session lasts 24 hours; after the WebUI restarts you log in again
- **IP allowlist**: every request is checked to make sure its source address is within `allowed_cidrs`
- **HTTPS**: all traffic is encrypted
- Cross-site WebSocket connections are rejected

The IP allowlist can also be changed in the WebUI under **Settings → Remote Management**.

> If you remove the address range the current browser is using, this browser will no longer be able to reach the WebUI.

---

## Feature Differences

Compared with the desktop edition, the WebUI edition:

- **Does not support interactive authorization**: access requests must be handled on the device itself, otherwise they time out after 60 seconds
- Supports the rule wizard and permission group management
- Supports rooms, domain management and diagnostic tools

---

## Read-Only Mode

If the system user running the WebUI only has **viewer** permissions on the client core, the WebUI shows a read-only notice and all modifications are unavailable.

For how to grant admin permissions, see: [Controller](/en/connect/install/controller#connecting-to-the-client-core)

---

## Related

- [Controller](/en/connect/install/controller)
- [System Service](/en/connect/install/service)
