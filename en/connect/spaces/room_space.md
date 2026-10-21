---
title: "Room Mode"
description: "This chapter covers how MSST-Net's Room Mode works."
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

## What Is Room Mode

**Room Mode** is MSST-Net's ad-hoc networking feature, suited for short-term uses such as group collaboration and multiplayer gaming.

In Room Mode, devices in the same room can discover each other, communicate directly, and use LAN discovery protocols (such as in-game lobby search).

Room Mode is available to both authenticated and unauthenticated users.

---

## When to Use It

Room Mode is suited for:

- Multiplayer gaming (such as Minecraft LAN worlds, Rusted Warfare, etc.)
- Temporary file sharing or collaboration
- Ad-hoc networking without long-term exposure on the network

---

## One Room at a Time

A device can only be **in one room at a time**.

Creating or joining another room while already in one shows an "Already in a room" message; leave the current room first.

---

## Creating a Room

Any device connected to MSST-Net can create a room.

In the client controller:

1. Open the controller and click **Create Room** on the home page
2. Enter a room name
3. Optional: check **Set Room Password** and enter a password (leave empty for no password protection)
4. Optional: choose a **Room Relay** (see [Room Relay](/en/connect/spaces/room_relay))
5. Click **Create**; the system generates a unique **room number** (format: `space-{8 hex digits}`)

Once created, you can **Copy Room Number** from the current-room bar at the top and share it with people who need to join.

---

## Joining a Room

Once you have a room number:

1. Open the client controller and click **Join Room** on the home page
2. Enter the room number
3. If the room has a password, the controller prompts you for the password provided by the owner
4. Once joined, you can see the other members of the room

When joining a room, the client automatically detects and reports this device's network endpoints, which are used to establish peer-to-peer connections with room members.

If the client's connection to the coordinator drops and then reconnects, it automatically rejoins the same room without asking for the password again.

---

## Room Password

You can set an optional password when creating a room to restrict who can join.

- The password is set by the owner at creation time and cannot be changed afterwards
- The plaintext password **never leaves your device**: the client computes a verifier locally using Argon2id with a per-room random salt, and only sends that
- The coordinator only stores a hash of the verifier, so even if its data leaked, it couldn't be used directly to join the room
- Each device or IP can try at most 10 wrong passwords per minute; beyond that it is temporarily rate-limited
- People who know the room number but not the password cannot join

---

## Unauthenticated Users

Users who haven't completed MSST unified authentication can still use Room Mode, but **only Room Mode**: they cannot join the Network and can only communicate with members of the same room.

Since version 3.1, rooms have **no member limit**, including rooms created by unauthenticated users (3.0.x limited them to 5 people).

See: [Authentication](/en/connect/basics/authentication)

---

## Room Members

After joining a room, the controller home page shows all online members of the current room, including device name, owning user, ezPlay hostname and current connection path.

Room members can:

- Communicate directly via virtual IPs
- Reach each other via ezPlay hostnames (use **Copy Hostname** on a member card)
- Use LAN discovery (see below)

Right-click a member card (long-press on mobile) to:

- **Add Firewall Rule**: quickly create a rule for that member's device
- **Add Room-Level Rule**: create a rule that applies to all room members

---

## LAN Discovery

Room Mode provides a **LAN discovery proxy** that makes the room behave like a local network.

Supported discovery protocols:

| Protocol | Purpose |
|---|---|
| Minecraft Java LAN (multicast `224.0.2.60`) | Minecraft multiplayer lobby search |
| mDNS (multicast `224.0.0.251`) | LAN service discovery |
| IPv4 broadcast (`x.x.x.255`) | Generic broadcast discovery |

A game's "LAN multiplayer" option can automatically find game servers running on other devices in the room, without entering an IP manually.

Discovery data is distributed through relays and authenticated: only members of this room can send it, and clients only accept discovery data whose sender has been verified by the relay. Members using different relays can still discover each other.

> **Note**:
> - LAN discovery is only supported on **desktop (Windows / Linux / macOS)**; it is not supported on mobile (Android).
> - Being able to discover a service doesn't mean you're allowed to access it; access is still subject to firewall rules.

---

## Access Control

Firewall rules still apply in Room Mode.

The differences from Network Mode are:

- While in a room, any known device can trigger an interactive authorization notification when no rule matches
- You can use **room-level rules** to allow (or deny) all room members at once

See:

- [Firewall Rules](/en/connect/acl/rules)
- [Interactive Authorization](/en/connect/acl/interactive_auth)

---

## Leaving a Room

When you're done playing, click **Leave Room** in the controller.

After leaving, the device returns to plain Network Mode (unauthenticated users are no longer connected to any device), and LAN discovery stops.

---

## Room Lifecycle

- A room is automatically dissolved about 1 minute after **all members have left**
- Members' clients periodically send room keepalives to the coordinator; a room with no keepalive for more than 2 minutes is also dissolved
- Once a room is dissolved, its room number becomes invalid and can no longer be joined

---

## Notes

- Room numbers (format: `space-{8 hex digits}`) are public; without a password, anyone who knows the room number can join
- To control access, set a room password or configure firewall rules
- A device can only be in one room at a time

---

## Related

- [Room Relay](/en/connect/spaces/room_relay) — assign a relay to a room
- [Network Mode](/en/connect/spaces/network_space) — the basic mode for long-term, stable access
- [Firewall Rules](/en/connect/acl/rules) — control access between room members
- [MSST-Net ezPlay](/en/connect/extras/ezplay) — reach devices in the room by hostname
