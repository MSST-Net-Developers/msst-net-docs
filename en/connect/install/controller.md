---
title: "Controller"
description: "This chapter covers the types of MSST-Net client controllers and when to use each."
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

## What the Controller Does

The client controller is used to manage the **MSST-Net client core**.

Its main functions include:

- Viewing this device's status and its connection to the core
- Creating, joining and leaving rooms
- Managing firewall rules, permission groups and access logs
- Handling interactive authorization requests
- Performing access authentication
- Changing the device name and mnemonic
- Managing custom domains
- Viewing logs and diagnostics

The controller itself **does not handle networking**, and never makes any network or authorization decisions on its own: every state it shows comes from the client core. Closing the controller does not affect network connectivity.

---

## Controller Types

All MSST-Net 3.1 controllers share the same interface and come in three editions depending on how they run:

| Type | Platform | How it connects to the core | Remote management |
|---|---|---|---|
| Desktop | Windows / Linux / macOS | Local IPC | No |
| Mobile | Android | Built-in core | No |
| WebUI | Servers / headless devices | Local IPC, served to the browser over HTTPS | Yes |

### Feature Differences

| Feature | Desktop | Mobile | WebUI |
|---|---|---|---|
| Rule wizard and permission group management | Yes | No (rules can be added from authorization requests, access logs and room members) | Yes |
| Add rules for room members | Yes (right-click) | Yes (long-press) | Yes |
| Interactive authorization | Dialog + system notification | Dialog + notification with action buttons | **No** |
| Access password and IP allowlist | — | — | Required |
| VPN service control | — | Yes | — |
| Per-app proxy | — | Yes | — |

---

## Navigation

The controller has the following pages:

| Page | Contents |
|---|---|
| Home | Core status, access authentication, create / join room, current room members, this device's identifiers and ezPlay hostname |
| Defense | Firewall rules, Ping toggle, permission group management, access log |
| Domains | Custom `.msst.net` namespaces and DNS records (authentication required) |
| Settings | Device name and mnemonic, diagnostics & debugging, advanced network options |
| About | Version and protocol information |

---

## Desktop

The desktop edition is for devices with a desktop environment (Windows / Linux / macOS). The client core must be installed and run separately.

Features:

- Native graphical interface with system tray support
- Interactive authorization requests are announced via system notifications (Linux uses native desktop notifications)

Recommended for regular desktop users.

---

## Mobile

The mobile edition is for Android devices.

Features:

- Native mobile interface designed for small screens such as phones
- **Built-in client core**; no separate core component needed
- Connects through the system VPN service; the home page can start, pause, resume or stop the VPN service
- Supports "Always-on VPN" and "Block connections without VPN"
- Supports **per-app proxy**: under **Settings → Per-App Proxy**, choose apps that should bypass MSST-Net
- Receives access request notifications even when the controller UI is not open

> When upgrading from 3.0.x, the device identity is kept in the app's own data directory, so the device ID and virtual IP stay the same after the upgrade.

---

## WebUI

The WebUI edition is for devices without a desktop environment, or that need to be managed remotely, and is accessed through a browser.

See: [WebUI Remote Management](/en/connect/install/webui)

---

## Connecting to the Client Core

The desktop and WebUI editions connect to the client core over local IPC:

| Platform | Default IPC path |
|---|---|
| Linux | `$XDG_RUNTIME_DIR/msst-net/ipc.sock`, then `/run/msst-net/ipc.sock` |
| macOS | `$TMPDIR/msst-net/ipc.sock`, then `/var/run/msst-net/ipc.sock` |
| Windows | `\\.\pipe\msst-net-ipc` |

You can specify a different path with the `MSST_IPC_PATH` environment variable.

### Access Permissions (Linux / macOS)

The client core is a privileged process, so being able to open the IPC socket does not by itself let you operate the core. The core checks the system user on the other end of the connection and grants one of the following roles:

| Role | Granted to | Permissions |
|---|---|---|
| Admin | The user running the core, root, the user who started the core via `sudo`, members of the local `msst-net` group | All operations |
| Viewer | Other users with a local login session | View status only |
| — | Everyone else | Connection refused |

When the core runs as a system service under root, add your everyday account to the `msst-net` group to get admin permissions:

```bash
sudo groupadd -f msst-net
sudo usermod -aG msst-net $USER
```

Group membership is checked on every connection, so **there is no need to restart the core**; however, you must log in again before the new group membership applies to that user's processes.

When connected with the viewer role, the controller shows a read-only notice and modifications are unavailable.

### Version Compatibility

When connecting, the controller negotiates the IPC protocol version with the core and shows both protocol versions on the **About** page. If the core is older and lacks certain features, the controller disables those features and explains why.

---

## Which Controller to Choose

Regular desktop users:

Use the **Desktop** edition.

Server users:

Use the **WebUI** edition.

Mobile users:

Use the **Mobile** edition.

---

## Next Steps

After choosing a controller, continue with:

- Installing the client
- Completing access authentication

See:

- [Installing the Client](/en/connect/install/client)
- [Authentication](/en/connect/basics/authentication)
- [Getting Started](/en/connect/start)
