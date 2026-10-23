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

Since 3.1.8 the client reconnects right after switching networks (between Wi-Fi and a phone hotspot, for example); if the switch takes no more than about a minute, the device stays in the room and the other members don't see it leave and rejoin. See [Connections](/en/connect/basics/connections#network-changes).

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
- Use game discovery (see below)

When a member runs client 3.1.5 or older, its member card shows **This member's version is too old for game discovery** (everything else is unaffected).

Right-click a member card (long-press on mobile) to:

- **Add Firewall Rule**: quickly create a rule for that member's device
- **Add Room-Level Rule**: create a rule that applies to all room members

---

## Game Discovery

Room Mode forwards games' **LAN discovery broadcasts** to the other room members, so the room behaves like a local network: a game's "LAN" option finds game servers running on other devices in the room without typing an IP.

Discovery data forwarded:

| Type | Destination | Port | Typical use |
|---|---|---|---|
| Minecraft Java Edition LAN worlds | Multicast `224.0.2.60` | 4445 | Minecraft LAN lobby search |
| mDNS | Multicast `224.0.0.251` | 5353 | LAN service discovery |
| IPv4 broadcast | `172.22.255.255` or `255.255.255.255` | Any | Minecraft Bedrock Edition, Rusted Warfare and other games that discover by broadcast |

On Linux and macOS, broadcasts this device sends on its physical LAN (to `255.255.255.255`, or to the network's broadcast address, e.g. `172.20.10.15` on an iPhone hotspot) are captured too, rewritten into MSST-Net's broadcast and forwarded; after a network switch the capture follows the new network (since 3.1.8). On Windows only discovery traffic sent to the MSST-Net virtual adapter is forwarded. Only UDP packets are forwarded.

### How It Travels

Since 3.1.6, each discovery packet is sent **inside the WireGuard tunnel to each room member separately**, over that member's current path (direct or relayed):

- The sender is authenticated end to end by the encrypted session; relays see only ciphertext and cannot impersonate room members
- The receiver accepts discovery data only from **members of this room**, and rebuilds the packet with the sender's own virtual address, so the source can't be forged
- At most 10 packets per second per sender and 100 per second from all senders together; discovery this device sends is likewise limited to 10 per second and de-duplicated within 3 seconds

### Version Compatibility

- There is **no game discovery** between 3.1.6 and devices running 3.1.5 or older. Up to 3.1.5 game discovery was distributed by relays, which could impersonate room members; 3.1.6 does not fall back to that for compatibility
- Incompatible members are marked on their member cards, and this device sends them no discovery data
- Whether a device supports the new way is read from the capability marker `feature:wgdisc1` in the endpoint list it reports

> **Notes**:
> - Game discovery is only supported on **desktop (Windows / Linux / macOS)**; it is not supported on mobile (Android).
> - Being able to discover a service doesn't mean you're allowed to access it; access is still subject to firewall rules.
> - Discovery data reaches every UDP program on this device that receives broadcasts — that is how broadcast discovery works; it only comes from members of the same room and is rate-limited as above.

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

After leaving:

- The device returns to plain Network Mode (unauthenticated users are no longer connected to any device), and game discovery stops
- Connections allowed by **room-level rules**, and connections with guest devices that existed only because you shared the room, are **cut immediately**; further access is judged by Network Mode rules

When another member leaves the room, connections from that member that were allowed only because of the room are cut the same way.

---

## Room Lifecycle

- A room is automatically dissolved about 1 minute after **all members have left**
- Members' clients send a room keepalive to the coordinator every minute; a room with no keepalive for more than 2 minutes (for example, all members' devices went to sleep) is also dissolved
- Once a room is dissolved, its room number becomes invalid and can no longer be joined
- When a device wakes up, its client learns that the room is gone at its next keepalive or coordinator reconnect, **leaves the room automatically**, and the controller returns to the home page

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
