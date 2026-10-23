---
title: "Network Mode"
description: "This chapter covers how MSST-Net's Network Mode works."
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

## What Is Network Mode

**Network Mode** is MSST-Net's basic access mode, suited for devices that stay connected to the same network long-term.

In Network Mode, the device joins MSST-Net's unified virtual network and gets a fixed virtual IP address. Other authenticated devices on the network can reach this device via that virtual IP or its ezPlay hostname, and access control is handled entirely by firewall rules and interactive authorization.

For **authenticated users**, Network Mode is the default state once the client starts; no further action is needed to join it.

> Network Mode **requires access authentication**. Unauthenticated users can only use Room Mode.
>
> See: [Authentication](/en/connect/basics/authentication)

---

## When to Use It

Network Mode is suited for:

- Devices that stay connected long-term and need to provide services continuously (such as home servers)
- Accessing services shared by other devices on the network
- Making a device a permanent part of the unified virtual network

---

## Virtual Addresses

After joining the Network, this device gets a fixed set of virtual addresses:

- **Virtual IPv4**: `172.22.x.y` (deterministically derived from the device ID)
- **Virtual IPv6**: `fd22:2222:2222:2222::xxxx:xxxx` (deterministically derived from the device ID)

The device also gets an **ezPlay hostname** (such as `archlinux.abjust.ezplay.net.msst2031.cn`) that can be used directly to reach it.

See:

- [Connections](/en/connect/basics/connections)
- [MSST-Net ezPlay](/en/connect/extras/ezplay)

---

## Access Control

In Network Mode, access control relies entirely on firewall rules and interactive authorization. Inbound access that matches no rule is **denied by default**.

- Inbound connections from other devices on the network require a matching allow rule or approval through interactive authorization
- Connections from your account's other devices, from devices you've communicated with (or shared a room with) in the last 7 days, and from devices explicitly referenced in device-level rules trigger **interactive authorization** when no rule matches
- Connections from other unknown devices are **silently dropped**
- Unauthenticated devices cannot reach this device outside a room

See:

- [Firewall Rules](/en/connect/acl/rules)
- [Interactive Authorization](/en/connect/acl/interactive_auth)

---

## Relationship with Room Mode

Network Mode and Room Mode **can be used at the same time**.

After joining a room, the device enters Room Mode but keeps its Network virtual addresses and firewall rules. After leaving the room, it automatically returns to plain Network Mode.

Main differences between the two modes:

| Aspect | Network Mode | Room Mode |
|---|---|---|
| Authentication required | Yes | No |
| Reachable peers | All authenticated devices on the network | Current room members only |
| Access control | Firewall rules + interactive authorization | Firewall rules (including room-level rules) + interactive authorization |
| Game discovery | Not supported | Supported (multicast / broadcast forwarded through the encrypted tunnel) |
| Best for | Long-term, stable access | Ad-hoc networks, playing together |

See:

[Room Mode](/en/connect/spaces/room_space)

---

## Next Steps

- [Firewall Rules](/en/connect/acl/rules) — configure access control
- [Interactive Authorization](/en/connect/acl/interactive_auth) — learn about dynamic authorization
- [Room Mode](/en/connect/spaces/room_space) — ad-hoc networking and playing together
