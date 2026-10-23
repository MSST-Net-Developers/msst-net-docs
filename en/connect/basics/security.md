---
title: "Security Model"
description: "This chapter covers whom MSST-Net trusts and whom it doesn't, and how the client protects itself against malicious relays and malicious devices."
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

## Overview

MSST-Net's basic principle: **the confidentiality and integrity of data depend only on the keys of the two communicating devices**, not on any server in the network.

| Party | Can | Cannot |
|---|---|---|
| Coordinator | Distribute device public keys, the official relay list and room membership | See or forward user data; give a known device a different key (clients check) |
| Relay (official or room relay) | Forward, drop or delay packets; see device IDs, addresses, traffic volume and timing | Decrypt or alter data; send game discovery as a room member; inject data into this device |
| Other devices in the network | Use this device's services as far as the firewall allows | Bypass the firewall; use this device to reach the other networks it is connected to; impersonate other devices |
| Other users of this machine | View the core's state (read-only) | Change network state (requires the administrator role) |

---

## Encryption

- **All** data between devices is encrypted with WireGuard, direct or relayed; there is no plaintext mode
- Game discovery also travels inside the encrypted tunnel, sent to each room member separately
- Forged WireGuard messages fail verification and change no session state

See: [Connections](/en/connect/basics/connections)

---

## Identity and Public Keys

- The device ID is derived from the device's public key; registering requires proving possession of the private key (key proof), and the coordinator pins the key first registered
- When the client receives another device's public key, it checks again that the key matches the device ID; an unauthenticated device's user ID must also be derived from its key
- So even a faulty coordinator cannot make one device pose as another known device, and a guest cannot claim an authenticated user's ID to match user-level firewall rules

See: [Authentication](/en/connect/basics/authentication), [Identifiers](/en/connect/basics/identifiers)

---

## Against Malicious Devices

Data from other devices (including strangers in a room) goes through these checks:

| Check | Purpose |
|---|---|
| The source must be the peer's own virtual IP | Firewall decisions by source device are backed by the peer's key |
| The destination must be this device's virtual IP | A peer cannot use this device to reach its LAN or other devices, even with IP forwarding on |
| The peer's virtual addresses must be inside MSST-Net's ranges and not duplicate this device's or another device's | A peer cannot pose as an Internet host or take over another device's traffic |
| Firewall rules (default deny) | Only ports allowed by a rule or an authorization can be reached |
| ICMP restrictions | Only ping and its replies, and error messages about packets this device sent to that peer; redirects, neighbor discovery and the like are dropped |
| Game discovery restrictions | Only UDP broadcasts (any port, to MSST-Net's broadcast address) and the two discovery multicast groups, from members of the same room; rate-limited per sender, and rebuilt with the sender's own address |
| Revocation | Deleting or disabling a rule, or leaving a room, cuts the connections it had allowed (a rule that simply expires doesn't) |

What a peer announces through the coordinator isn't taken at face value either:

- Loopback, multicast, broadcast and link-local addresses among its direct candidates are ignored, and at most 16 are used
- A relay it announces is used only if it is in the official relay list
- This device answers direct probes only from known devices

---

## Against Malicious Relays

A relay can see traffic metadata and can drop or delay packets (affecting availability), but it cannot:

- Decrypt or alter data, or send data as any device
- Send game discovery as a room member (up to 3.1.5 game discovery was distributed by relays, which could impersonate room members; since 3.1.6 it is end to end)
- Register another device's ID (official relays require authenticated registration by default)

The room relay is chosen by the room's creator and may be anyone's server, so in addition:

- A room relay must be a **public unicast address** — never loopback, private, CGNAT, link-local and the like — otherwise the room's creator could make every member send traffic into their own LAN
- If the room relay is unavailable, members fall back to their own preferred relays

See: [Room Relay](/en/connect/spaces/room_relay), [Self-Hosted Relay](/en/connect/selfhost/relay)

---

## Local Security

- The core runs privileged and the controller as a normal user; opening the IPC socket does not grant control: only the administrator role (members of `msst-net` / `MSST-Net Administrators` and the like) can change state, other logged-in users can only view it
- Authentication credentials are never sent to the controller or written to logs
- The device key `private.key` is readable by its owner only
- On Linux the core turns off broadcast forwarding on the virtual adapter, so room members' broadcasts aren't forwarded back into it by the kernel

See: [Architecture](/en/connect/basics/architecture)

---

## Recommendations for Operators

When running a coordinator or relay:

| Component | Setting | Notes |
|---|---|---|
| Coordinator | `device_key_proof: required` | Registering devices must prove they hold their key (default for new deployments) |
| Coordinator | `persistence.driver: sqlite` | Key pins survive restarts (default for new deployments; the database file is owner-only) |
| Relay | `relay.register_auth: required` | Refuse unauthenticated registration (default for new deployments; needs the coordinator's address) |

Coordinators and relays write the defaults of their version to `config.yaml` on first start, so existing deployments need these settings changed by hand.

---

## Known Limitations

- Relays see traffic metadata (device IDs, addresses, sizes, timing) and can disrupt traffic that passes through them
- The coordinator is the root of trust: if it is compromised, it can affect the official relay list, room membership, and the keys of device IDs **never registered before**
- Device IDs are 32 bits: finding a key that matches a **never-registered** device ID takes about 2^32 attempts; registered device IDs are protected by key pinning
- There is no game discovery with devices running 3.1.5 or older (no fallback to the insecure old protocol)

---

## Related

- [Architecture](/en/connect/basics/architecture)
- [Connections](/en/connect/basics/connections)
- [Firewall Rules](/en/connect/acl/rules)
- [Room Relay](/en/connect/spaces/room_relay)
