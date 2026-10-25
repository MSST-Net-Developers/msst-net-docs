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

The MSST-Net 3.1 graphical controllers share the same interface, and there is also a command-line controller (since 3.1.8), for four editions depending on how they run:

| Type | Platform | How it connects to the core | Remote management |
|---|---|---|---|
| Desktop | Windows / Linux / macOS | Local IPC | No |
| Mobile | Android | Built-in core | No |
| WebUI | Servers / headless devices | Local IPC, served to the browser over HTTPS | Yes |
| Command line (`msst-net-cli`) | Windows / Linux / macOS | Local IPC, run in a terminal | No (works over SSH) |

### Feature Differences

| Feature | Desktop | Mobile | WebUI | Command line |
|---|---|---|---|---|
| Rule wizard and permission group management | Yes | No (rules can be added from authorization requests, access logs and room members) | Yes | Yes (`rules`, `groups` commands) |
| Editing permanent rules | Everything | Note and enabled state only | Everything | Everything (`rules edit`) |
| Update reminder | Notice at the top + About page | Checks the app itself only | Notice at the top + About page | `check-update` command |
| Add rules for room members | Yes (right-click) | Yes (long-press) | Yes | Yes (`rules add --device`, `--room-members`) |
| Interactive authorization | Dialog + system notification | Dialog + notification with action buttons | **No** | **No** |
| Access password and IP allowlist | — | — | Required | — |
| VPN service control | — | Yes | — | — |
| Per-app proxy | — | Yes | — | — |
| Linux-only network options (DNS mode, other-VPN switches) | Yes | Hidden (the built-in Android core doesn't use them) | Yes | Yes |

---

## Navigation

The graphical controllers have the following pages:

| Page | Contents |
|---|---|
| Home | Core status, access authentication, create / join room, current room members, this device's identifiers and ezPlay hostname |
| Defense | Firewall rules, Ping toggle, permission group management, access log |
| Domains | Custom `.net.msst2031.cn` namespaces and DNS records (authentication required) |
| Settings | Device name and mnemonic, diagnostics & debugging, advanced network options |
| About | Version and protocol information, update check result |

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

## CLI

The command-line controller `msst-net-cli` offers the WebUI's features as terminal commands on the device running the core. It suits devices without a graphical interface that don't need browser-based remote management (it also works over SSH). It is run directly by a regular user and is not a service; its permissions are the same as the desktop edition's (see [Access Permissions](#access-permissions) below).

With the client installer, choose the **command line** controller (`--controller cli`) and run `msst-net-cli` directly; you can also download `msst-net-controller-cli-<os>-<arch>` from the controller's releases, rename it to `msst-net-cli`, and use it by hand.

```bash
msst-net-cli --help          # all commands
msst-net-cli status          # connection status, this device's identity, the room
msst-net-cli watch           # keep showing state changes (Ctrl-C to quit)
msst-net-cli room create game-night --password    # create a room with a password (typed in the terminal, not echoed)
msst-net-cli room join space-1a2b3c4d             # join a room (asks for the password if one is needed)
msst-net-cli rules add --device pc.alice --service minecraft-java   # add a rule
msst-net-cli settings set keepalive 15            # change a network setting
```

| Command | Purpose |
|---|---|
| `status` / `watch` | Overview / keep showing state changes |
| `nodes` | Known nodes and their paths |
| `room` | Rooms: `show`, `create`, `join`, `leave` |
| `rules` | Firewall rules: `list`, `add`, `edit`, `enable`, `disable`, `comment`, `delete`, `clear` |
| `groups` | Permission groups |
| `services` | Service templates for rules |
| `access` | Access log, and `allow-once`, `allow`, `deny`, `revoke` based on it |
| `identity` | Show or change the device name and mnemonic |
| `login` | Access authentication: shows the URL and code to complete in a browser |
| `reregister` | Re-register this device with the coordinator |
| `settings` | Network settings: `show`, `set` |
| `relays`, `paths`, `traffic`, `endpoints`, `diag-ping`, `logs` | Diagnostics (see [Diagnostics](/en/connect/troubleshoot/diagnostics#cli-diagnostics)) |
| `dns` | Custom DNS namespaces and records |
| `check-update` | Check whether newer core and controller releases exist (only the controller when the core isn't running) |
| `raw` | Send any IPC request (for diagnostics) |

Notes:

- Each command first connects to the core and syncs its state (`--timeout`, 10 seconds by default), runs, and exits; `--json` prints the core's raw data
- Rules, permission groups, DNS records and access log entries can be referred to by a unique prefix of their ID
- Deleting, clearing, and rules covering all ports ask for confirmation; `--yes` skips it. Without a terminal (in a script, for example), such operations are refused unless `--yes` is given
- Room passwords and relay access passwords given as a bare `--password` / `--relay-password` are typed in the terminal without echo and don't end up in the shell history
- Like the WebUI, it **doesn't handle interactive authorization**: access requests must be handled in the desktop or mobile edition, or they time out after 60 seconds
- Times are shown in the system time zone
- Exit status: `0` success, `1` the operation failed, `2` invalid input or confirmation needed, `3` the core is unreachable or incompatible

> When the core runs in Docker and the command-line controller on the host, the core in the container accepts connections from root only, so use `sudo msst-net-cli`.

---

## Connecting to the Client Core

The desktop, WebUI and command-line editions connect to the client core over local IPC:

| Platform | Default IPC path |
|---|---|
| Linux | `$XDG_RUNTIME_DIR/msst-net/ipc.sock`, then `/run/msst-net/ipc.sock` |
| macOS | `$TMPDIR/msst-net/ipc.sock`, then `/var/run/msst-net/ipc.sock` |
| Windows | `\\.\pipe\msst-net-ipc` |

You can specify a different path with the `MSST_IPC_PATH` environment variable.

### Access Permissions

The client core is a privileged process, so being able to open the IPC socket does not by itself let you operate the core. The core checks the system user on the other end of the connection and grants one of the following roles:

| Role | Granted to | Permissions |
|---|---|---|
| Admin | The user running the core, root / LocalSystem, the user who started the core via `sudo`, members of the local `msst-net` group (`MSST-Net Administrators` on Windows), elevated programs (Windows) | All operations |
| Viewer | Other users with a local login session | View status only |
| — | Everyone else | Connection refused |

The client installer creates these groups and adds the installing user (on Windows, the user signed in at the desktop).

When the core runs as root / a system service, add your everyday account to the admin group to get admin permissions. Linux / macOS:

```bash
sudo groupadd -f msst-net
sudo usermod -aG msst-net $USER
```

Windows (Command Prompt run as administrator):

```bat
net localgroup "MSST-Net Administrators" <username> /add
```

Group membership is checked on every connection: just **reopen the controller** — no need to restart the core or to log in again.

> Up to 3.1.9 the Windows core only saw the group memberships of the logon session, so you had to sign out of Windows and back in after adding the group.

When connected with the viewer role, the controller shows a read-only notice and modifications are unavailable.

### Version Compatibility

When connecting, the controller negotiates the IPC protocol version with the core and shows both protocol versions on the **About** page. If the core is older and lacks certain features, the controller disables those features and explains why.

---

## Update Reminder

From 3.1.10 the controller checks for newer versions:

- About 10 seconds after it starts, then once a day (hourly after a failure)
- It asks GitHub and Gitee in parallel for the latest **stable** releases of the core and the controller and uses whichever answers first; only the version numbers in the release manifests are read
- It compares them with the running core (which reports its version from 3.1.10) and the controller; an older core that doesn't report its version is not compared

When a newer version exists, the desktop controller and the WebUI show a notice at the top, such as "New version: Core 3.1.10 → 3.1.11", with links to download the client installer; the **About** page shows the result too. The controller never updates itself: download the latest client installer, run it as administrator (Linux / macOS: `sudo`) and choose **Upgrade**.

- After you close the notice it stays hidden until the controller restarts or an even newer release appears
- The **mobile** app has the core built in, so it only checks its own version; the notice links to the APKs — install the one for your device's architecture (most phones: `aarch64`) over the old app
- The **command-line** controller doesn't check by itself; run `msst-net-cli check-update`
- To turn checks off, set the environment variable `MSST_UPDATE_CHECK=0` for the controller

---

## Which Controller to Choose

Regular desktop users:

Use the **Desktop** edition.

Server users:

Use the **WebUI** edition if you want to manage the device from a browser; if you only manage it in a local terminal or over SSH, the **command-line** edition works too.

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
