---
title: "Architecture"
description: "This chapter covers the components of MSST-Net and how they work together."
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

## Overview

MSST-Net consists of the following components:

| Component | Runs on | Responsibilities |
|---|---|---|
| Client Core | Every connected device | Virtual network adapter, encryption, path selection, firewall, DNS, game discovery |
| Client Controller | Every connected device (or via a browser) | Graphical or command-line interface; sends requests to the core and shows its state |
| Coordinator | MSST-Net servers | Device registration, address allocation, rooms, ezPlay hostnames, access authentication |
| Relay | MSST-Net servers, or self-hosted | Forwards encrypted data when a direct connection isn't possible |
| MSST Identity and Access System (MSST-IAS) | MSST servers | Accounts and identity authentication |

```text
  Controller ──IPC──► Client Core ──WebSocket / HTTPS──► Coordinator ──► MSST-IAS
                     │
                     ├──UDP (direct)──────────────────► Peer device
                     └──UDP (relayed)──► Relay ───────► Peer device
```

---

## Client Core

The client core is a **privileged process** running on every device, and is the single source of truth for this device's network state.

It is responsible for:

- Creating the virtual network adapter (named `msst0` by default) and configuring virtual addresses
- Encrypting all data exchanged with peers using WireGuard
- Choosing the connection path (direct or relayed)
- Enforcing firewall rules and interactive authorization
- Resolving `*.net.msst2031.cn` domains locally
- Forwarding games' LAN discovery broadcasts end to end between room members

The core keeps running even when the controller is closed, so network connectivity is unaffected. The core also notices network changes on this device itself (switching between Wi-Fi and a phone hotspot, for example) and immediately reconnects to the coordinator, registers again with its relay and reports new endpoints; see [Connections](/en/connect/basics/connections#network-changes).

Local ports used by the core:

| Port | Purpose |
|---|---|
| UDP 21031 | Data channel (direct and relayed); game discovery uses it too |
| UDP 127.0.0.1:21053 (127.0.0.1:53 on Windows) | Local DNS resolution |
| TCP 127.0.0.1:9100 | Prometheus metrics (local only) |

> Up to 3.1.5, game discovery also used UDP 21032. Since 3.1.6 it travels inside the encrypted tunnel and that port is no longer used.

---

## Client Controller

The controller is an **unprivileged** program (the desktop, mobile and WebUI editions, and the command-line `msst-net-cli`) that talks to the core over local IPC:

- Linux: Unix domain socket `/run/msst-net/ipc.sock` (`/var/run/msst-net/ipc.sock` on macOS)
- Windows: named pipe `\\.\pipe\msst-net-ipc`
- Android: the core is embedded in the app and talks over an app-private socket

The controller only displays the state reported by the core and passes the user's actions on to the core; it **never modifies any network state directly**.

### Access rights

Being able to open the socket does not mean being able to operate the core. The core decides each connection's rights from its operating-system identity (provided by the OS, it cannot be forged):

| Role | Allowed | Who |
|---|---|---|
| Administrator | Query state and perform every operation (rooms, rules, settings, …) | root / LocalSystem, the core's own user, the user who started the core with `sudo`, members of the local group **`msst-net`** (Linux / macOS) or **`MSST-Net Administrators`** (Windows), and elevated programs (Windows) |
| Read-only | Query state and receive events; no changes | Other users logged in to the machine |

A read-only connection shows a read-only interface in the controller. The installer creates these groups and adds the installing user; after joining a group, reconnecting is enough — the core doesn't need a restart.

When the controller is reopened or reconnects, it first reads the full state from the core and then receives subsequent change notifications, so it never shows stale information just because it was closed for a while.

See: [Controller](/en/connect/install/controller)

---

## Coordinator

The coordinator is MSST-Net's control plane. It is responsible for:

- Device onboarding, registration and online status
- Deriving virtual IP addresses from device IDs and resolving address conflicts
- Assigning ezPlay hostnames and providing `*.net.msst2031.cn` resolution data
- Creating and joining rooms, syncing members and verifying room passwords
- Integrating with the MSST-IAS (OIDC device authorization flow) and issuing guest credentials
- Registering relays and announcing available official relays (and their public keys) to clients
- Managing custom `.net.msst2031.cn` namespaces
- Verifying that a registering device holds its key (**key proof**) and pinning each device ID's public key

Device keys, users, rooms and other data are kept in a local SQLite database by default, so they survive restarts.

The client core keeps a persistent WebSocket connection to the coordinator and uses HTTPS APIs for operations such as registration and room creation.

The coordinator **never forwards any user data**. If the coordinator is temporarily unavailable, existing connections keep working, but you cannot join new rooms or discover newly online devices.

Default coordinator address:

```text
https://coord.msst-net.msst2031.cn
```

---

## Relay

A relay does exactly one thing: it **forwards already-encrypted packets unchanged** between devices.

- The relay cannot see the content of communications (data is end-to-end encrypted with WireGuard); game discovery travels inside the encrypted tunnel as well
- The relay can see device IDs, public addresses, traffic volume and timing
- Devices sign their registration with their private key (**authenticated registration**), so nobody else can claim a device ID and divert its traffic

There are two kinds of relays:

| Type | Description |
|---|---|
| Official relay | Operated by MSST-Net and listed in the relay list published by the coordinator; every device can pick one automatically |
| Self-hosted relay | Deployed by anyone and not publicly listed; can only be specified as a **room relay** by the room owner via a connection string when creating a room |

See:

- [Connections](/en/connect/basics/connections)
- [Room Relay](/en/connect/spaces/room_relay)
- [Self-Hosted Relay](/en/connect/selfhost/relay)

---

## Trust boundaries

| Component | Trusted to | Not trusted to |
|---|---|---|
| Coordinator | Distribute device public keys, the official relay list and room membership | See or forward user data |
| Official / room relay | Forward packets | Confidentiality, integrity or sender identity (all guaranteed end to end) |
| Other devices | — | Anything: their data is checked cryptographically, by address and by the firewall |

The client checks what the coordinator hands out: a peer's public key must match its device ID, its virtual addresses must be inside MSST-Net's ranges, and the relay it announces must be an official one.

See: [Security Model](/en/connect/basics/security)

---

## Related

- [Authentication](/en/connect/basics/authentication)
- [Connections](/en/connect/basics/connections)
- [Security Model](/en/connect/basics/security)
- [Controller](/en/connect/install/controller)
