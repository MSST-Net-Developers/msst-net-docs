---
title: "Connections"
description: "This chapter covers how connections work in MSST-Net."
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

## Virtual Network Addresses

MSST-Net assigns each connected device a fixed set of virtual IP addresses for device-to-device communication.

Virtual address ranges:

- IPv4: `172.22.0.0/16`
- IPv6: `fd22:2222:2222:2222::/64`

Each device's virtual IPs are deterministically derived from its device ID, so they stay the same across sessions.

If the derived IPv4 address happens to be taken by another device already, the coordinator assigns a different IPv4 address to the later device. That address is saved as well and stays the same from then on.

---

## Data Encryption

MSST-Net encrypts **all** data transferred between devices with the **WireGuard** protocol, whether connected directly or forwarded by a relay.

- There is no plaintext mode, and no setting to turn encryption off
- A peer that cannot complete the WireGuard handshake cannot exchange any data
- Relays can only see the device IDs in packet headers, packet sizes and timing — never the content

### Keys

Each device generates a unique Curve25519 key pair on first start (stored in `private.key` in the data directory). This key is both:

- The device's identity key: the device ID is derived from the public key
- The device's WireGuard static key

The public key is submitted to the coordinator at device registration and bound to the device ID; afterwards, no other key can be used to impersonate the same device ID.

### Encrypted Sessions

An encrypted session with a peer is **established on demand**: the handshake starts only when this device first sends data to the peer (or receives a handshake from it). Data sent before the handshake completes is queued and sent encrypted as soon as the session is up.

| Session state | Meaning |
|---|---|
| Not established | Not yet communicated with the peer, or the session was reclaimed after being idle for a long time |
| Handshaking | Handshake with the peer in progress |
| Encrypted | Session is available; data is encrypted and exchanged normally |
| Failed | The last handshake got no response within 15 seconds |
| No public key | The peer's public key hasn't been obtained yet, so communication isn't possible |

Sessions are reclaimed after being idle for a while and re-handshake automatically the next time you communicate — no action needed.

Encrypted sessions are independent of the connection path: switching from relayed to direct (or vice versa) does **not** interrupt the encrypted session.

### Source Binding

Decrypted packets must carry the peer's own virtual IP as the source address, otherwise they are dropped. This means any firewall decision based on the source device is backed by the peer's key.

---

## Relay Selection

Each device picks one **preferred relay**, which it uses to:

- Receive data that other devices send via relay (other devices send data destined for this device to this device's preferred relay)
- Send data when a direct connection isn't possible

### Automatic Selection

By default, the core fetches the list of official relays from the coordinator, measures round-trip latency to each relay 5 times, and picks the one with the lowest latency.

If a relay supports both IPv4 and IPv6, IPv4 is preferred as long as its latency is no more than 1.2× that of IPv6.

### Manual Selection

You can pin a specific relay in the controller under **Settings → Diagnostics & Debugging → Advanced Options → Relay Preference**. If the pinned relay doesn't respond, another relay is still chosen automatically. This setting takes effect after reconnecting to the coordinator.

### Relay Registration and Keepalive

After choosing a relay, the core registers this device's address with the relay and sends keepalive packets periodically:

- Relays that support authenticated registration (`sreg1`) use signed registration packets, so only the holder of the device's private key can change the registration
- The keepalive interval defaults to **25 seconds** and can be set to 5–30 seconds in settings

---

## Connection Paths

MSST-Net automatically picks the best connection path, routing traffic between devices over the lowest-latency channel.

There are three path modes:

| Mode | Description |
|---|---|
| Relay | Data is forwarded through a relay |
| Probing | A direct path is being probed; data is still forwarded through the relay |
| Direct | A peer-to-peer direct connection is established; data bypasses the relay |

---

## Relay Mode

**Relay mode** is the initial state of every connection.

In this mode, packets are sent to **the peer's preferred relay** (or to this device's preferred relay if the peer hasn't reported one), which forwards them to the peer, unaffected by NAT or firewalls.

Relay mode is the most reliable way to connect, but has higher latency than a direct connection.

---

## Probing Mode

Once the system obtains the peer's direct-connection candidate addresses, it enters **probing mode** and tries to establish a peer-to-peer direct connection.

During probing, data is still forwarded through the relay, so normal communication is unaffected.

While probing, the core measures two latencies at once:

- **Direct latency**: probe packets are sent to each of the peer's candidate addresses (IPv6 addresses first)
- **Relay path latency**: a probe packet is sent inside the encrypted tunnel every 2 seconds to measure the real round-trip latency through the relay, which serves as the baseline the direct path has to beat

### Conditions for Upgrading to Direct

Probing is upgraded to a direct connection only when both of the following are met:

1. **Consecutive successful responses**: 5 consecutive probe replies are received from a candidate address
2. **Latency advantage**: the direct path's round-trip latency is no higher than the relay path's

For LAN candidate addresses (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), condition 2 is satisfied automatically (LAN addresses are always preferred).

### Probing Backoff

If every candidate address fails in a round of probing, the system returns to relay mode and probes again after **30 seconds**; each further failed round doubles the wait, up to **10 minutes**.

The controller's path view shows how many consecutive rounds of direct probing have failed and when the next probe will happen.

---

## Direct Mode

In **direct mode**, packets travel directly between the two devices without passing through a relay, for lower latency and better performance.

Once a direct connection is established, the system keeps monitoring its quality and automatically downgrades to relay mode in these cases:

| Downgrade reason | Behavior |
|---|---|
| 3 consecutive keepalive replies missed | Downgrade immediately (not subject to the hold period) |
| 3 consecutive round trips exceeding 3× the baseline | Downgrade after the hold period ends |
| Packet loss over 20% across the last 20 keepalives | Downgrade after the hold period ends |

While connected directly, the system also probes the peer's other candidate addresses every 5 seconds; if a candidate's latency is no more than half that of the current address, it switches to that address.

After a downgrade, the system keeps probing and upgrades to direct again once the conditions are met.

---

## Hold Period

After every path switch (both upgrades and downgrades), the system enters a **30-second hold period**.

During the hold period:

- It won't upgrade to direct or switch direct addresses
- It won't downgrade due to latency spikes or packet loss
- However, downgrades caused by consecutive missed keepalive replies are not subject to this restriction

The hold period exists to prevent the path from flapping when the network is unstable.

---

## Path Control

You can manually intervene in path selection in the controller under **Settings → Diagnostics & Debugging → Advanced Options → Path Selection**:

| Option | Effect |
|---|---|
| Disable P2P direct connections | Always forward traffic through relays, and don't report direct-connection candidate addresses to peers |
| Lock current paths | Freeze the current path to every peer; no more switching between relayed and direct |

---

## Connection Negotiation

When two devices need to connect, the coordinator notifies each side of the other's endpoint information and public key, triggering direct probing.

A device's endpoint information is detected and reported automatically by the client, including:

- This device's LAN IPv4 address
- The public IPv4 address after NAT mapping (detected via STUN)
- This device's public IPv6 address
- This device's preferred relay (and any room relay in use)

Endpoints are re-detected after a relay is chosen, every 5 minutes, and whenever a room relay's availability changes. You can also trigger it manually by clicking **Force Refresh Endpoints** under **NAT Traversal** in the controller.

---

## IPv6 Support

MSST-Net prefers IPv6 for direct probing.

If the local network doesn't support IPv6 routing, the system automatically falls back to IPv4.

In dual-stack IPv4/IPv6 environments, IPv6 candidate addresses are probed first.

---

## Related

- [Architecture](/en/connect/basics/architecture)
- [Room Relay](/en/connect/spaces/room_relay)
- [Diagnostics](/en/connect/troubleshoot/diagnostics)
