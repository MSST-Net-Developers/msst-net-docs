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
| Client Controller | Every connected device (or via a browser) | Graphical interface; sends requests to the core and shows its state |
| Coordinator | MSST-Net servers | Device registration, address allocation, rooms, ezPlay hostnames, access authentication |
| Relay | MSST-Net servers, or self-hosted | Forwards encrypted data when a direct connection isn't possible |
| MSST Unified Authentication Platform | MSST servers | Accounts and identity authentication |

```text
  Controller ──IPC──► Client Core ──WebSocket / HTTPS──► Coordinator ──► MSST Unified Auth Platform
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
- Resolving `*.msst.net` domains locally
- Forwarding games' LAN discovery broadcasts within a room

The core keeps running even when the controller is closed, so network connectivity is unaffected.

Local ports used by the core:

| Port | Purpose |
|---|---|
| UDP 21031 | Data channel (direct and relayed) |
| UDP 21032 | Game discovery |
| UDP 127.0.0.1:21053 (127.0.0.1:53 on Windows) | Local DNS resolution |
| TCP 9100 | Prometheus metrics |

---

## Client Controller

The controller is an **unprivileged** graphical program that talks to the core over local IPC:

- Linux / macOS: Unix domain socket
- Windows: named pipe `\\.\pipe\msst-net-ipc`

The controller only displays the state reported by the core and passes the user's actions on to the core; it **never modifies any network state directly**.

When the controller is reopened or reconnects, it first reads the full state from the core and then receives subsequent change notifications, so it never shows stale information just because it was closed for a while.

See: [Controller](/en/connect/install/controller)

---

## Coordinator

The coordinator is MSST-Net's control plane. It is responsible for:

- Device onboarding, registration and online status
- Deriving virtual IP addresses from device IDs and resolving address conflicts
- Assigning ezPlay hostnames and providing `*.msst.net` resolution data
- Creating and joining rooms, syncing members and verifying room passwords
- Integrating with the MSST Unified Authentication Platform (OIDC device authorization flow) and issuing guest credentials
- Registering relays and announcing available official relays to clients
- Managing custom `.msst.net` namespaces

The client core keeps a persistent WebSocket connection to the coordinator and uses HTTPS APIs for operations such as registration and room creation.

The coordinator **never forwards any user data**. If the coordinator is temporarily unavailable, existing connections keep working, but you cannot join new rooms or discover newly online devices.

Default coordinator address:

```text
https://coord.msst-net.msst2031.cn
```

---

## Relay

A relay does exactly one thing: it **forwards already-encrypted packets unchanged** between devices.

- The relay cannot see the content of communications (data is end-to-end encrypted with WireGuard)
- The relay can see device IDs, public addresses, traffic volume and timing
- Game discovery data is also distributed through the relay, which delivers it only to verified members of the same room

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

## Related

- [Authentication](/en/connect/basics/authentication)
- [Connections](/en/connect/basics/connections)
- [Controller](/en/connect/install/controller)
