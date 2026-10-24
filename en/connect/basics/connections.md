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

The public key is submitted to the coordinator at device registration and bound to the device ID; the device must prove it holds the private key when registering, and afterwards no other key can be used to impersonate the same device ID.

When the client receives another device's public key from the coordinator, it checks again that the key matches the device ID. Even a faulty coordinator cannot give a known device a different key.

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

If a peer's first handshake arrives before this device has its public key (for example, when the two haven't talked for a long time), the core holds the handshake, fetches the key from the coordinator and answers right away, instead of waiting for the peer's retransmission 5 seconds later.

Devices you are talking to stay in this device's device list; only devices with no communication for 2 hours or more, not in a shared room and not referenced by any rule are dropped, and fetched again when needed.

Encrypted sessions are independent of the connection path: switching from relayed to direct (or vice versa) does **not** interrupt the encrypted session.

### Address Binding

A decrypted packet must carry **the peer's own virtual IP as its source** and **this device's virtual IP as its destination**, otherwise it is dropped:

- Source binding means any firewall decision based on the source device is backed by the peer's key
- Destination binding means a peer cannot use this device to reach the other networks it is connected to (such as its LAN) — even with IP forwarding enabled

The peer's virtual addresses are checked too: they must be inside MSST-Net's address ranges and must not duplicate this device's or another device's.

---

## Relay Selection

Each device picks one **preferred relay**, which it uses to:

- Receive data that other devices send via relay (other devices send data destined for this device to this device's preferred relay)
- Send data when a direct connection isn't possible

### Automatic Selection

By default, the core fetches the list of official relays from the coordinator, measures round-trip latency to each relay 5 times, and picks the one with the lowest latency.

If a relay supports both IPv4 and IPv6, IPv4 is preferred as long as its latency is no more than 1.2× that of IPv6.

### Manual Selection

You can pin a specific relay in the controller under **Settings → Diagnostics & Debugging → Advanced Options → Relay Preference**. This setting takes effect after reconnecting to the coordinator.

- Only **official relays** (those in the coordinator's relay list) can be pinned; any other address is refused
- An official relay pinned by IP address is used under its listed name, so other devices recognize it
- If the pinned relay doesn't respond, another relay is still chosen automatically

If automatic selection fails 3 times in a row (for example at boot, before the network is up), the core keeps retrying in the background, starting at 30 seconds and doubling each time up to 5 minutes, until a relay is chosen or the coordinator connection is re-established.

### Relay Registration and Keepalive

After choosing a relay, the core registers this device's address with the relay and sends keepalive packets periodically:

- Relays that support authenticated registration (`sreg1`) use signed registration packets, so only the holder of the device's private key can change the registration
- The keepalive interval defaults to **25 seconds** and can be set to 5–30 seconds in settings (**Relay Keepalive Interval**). It applies to relay registration only, not to the liveness checks of direct paths
- When this device's network changes, it registers again from the new address right away, and the relay forwards to the new address from then on (see [Network Changes](#network-changes))

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

In this mode, packets are sent to **the peer's preferred relay**, which forwards them to the peer, unaffected by NAT or firewalls. When both devices are in the same room and use its room relay, packets go to the room relay instead.

A relay reported by the peer is used only if it is in the **official relay list**; if the peer reports none, or one that isn't official, packets go to this device's preferred relay. This way other devices can't make this device send data to, or periodically probe, an arbitrary server — and with "Disable P2P direct connections" on, your public address isn't revealed to a server a peer picked.

Relay mode is the most reliable way to connect, but has higher latency than a direct connection.

---

## Probing Mode

Once the system obtains the peer's direct-connection candidate addresses, it enters **probing mode** and tries to establish a peer-to-peer direct connection.

During probing, data is still forwarded through the relay, so normal communication is unaffected.

While probing, the core measures two latencies at once:

- **Direct latency**: probe packets are sent to each of the peer's candidate addresses (IPv6 addresses first)
- **Relay path latency**: a probe packet is sent inside the encrypted tunnel every 2 seconds to measure the real round-trip latency through the relay, which serves as the baseline the direct path has to beat; a probe is only given up after 10 seconds without a reply, so slower relay paths are measured too

All latencies are measured from the send time this device recorded, so a peer can't fake them in its replies.

### Conditions for Upgrading to Direct

Probing is upgraded to a direct connection only when both of the following are met:

1. **Consecutive successful responses**: 5 consecutive probe replies are received from a candidate address
2. **Latency advantage**: the direct path's round-trip latency is no higher than the relay path's

For LAN candidate addresses (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), condition 2 is satisfied automatically (LAN addresses are always preferred).

### Probing Backoff

If every candidate address fails in a round of probing, the system returns to relay mode and probes again after **30 seconds**; each further failed round doubles the wait, up to **10 minutes**.

New candidate addresses from the peer, a punch request from the coordinator, or a network change on this device trigger probing at once, regardless of the backoff; candidates that are merely reordered don't count as new.

The controller's path view shows how many consecutive rounds of direct probing have failed and when the next probe will happen.

---

## Direct Mode

In **direct mode**, packets travel directly between the two devices without passing through a relay, for lower latency and better performance.

Once a direct connection is established, the system sends a liveness probe to the current direct address every second, keeps monitoring the connection's quality, and automatically downgrades to relay mode in these cases:

| Downgrade reason | Behavior |
|---|---|
| 3 consecutive liveness probe replies missed (about 5 seconds) | Downgrade immediately (not subject to the hold period) |
| Probe replies arrive, but the encrypted data (or handshakes) this device sends gets no response at all for 20 seconds | Downgrade immediately (not subject to the hold period), and stop using this direct address for a while |
| 3 consecutive round trips exceeding 3× the baseline | Downgrade after the hold period ends |
| Packet loss over 20% across the last 20 liveness probes | Downgrade after the hold period ends |

The second case means the path lets the small probe packets through but drops regular data (an MTU black hole, for example). Since probing still succeeds there, the system won't upgrade to that address again for **1 minute**, so the connection doesn't keep dropping; if it happens again the wait doubles, up to **10 minutes**. A network change on this device clears these records. This check is skipped while "Lock current paths" is on.

While connected directly, the system also probes the peer's other candidate addresses every 5 seconds; if a candidate's latency is no more than half that of the current address, it switches to that address.

After a downgrade, the system keeps probing and upgrades to direct again once the conditions are met.

Up to 3.1.7, the liveness probe interval of direct paths followed the keepalive setting: with it set to 5–30 seconds, a dead direct path could take about a minute to be downgraded.

---

## Hold Period

After every path switch (both upgrades and downgrades), the system enters a **30-second hold period**.

During the hold period:

- It won't upgrade to direct or switch direct addresses
- It won't downgrade due to latency spikes or packet loss
- However, downgrades caused by missed liveness probe replies, or by encrypted data getting no response, are not subject to this restriction

During the hold period after a downgrade, a punch request from the coordinator doesn't upgrade the path back to direct right away either (up to 3.1.7 it did); a network change on this device clears the hold period.

The hold period exists to prevent the path from flapping when the network is unstable.

---

## Change Reasons

Every path change records its reason, which the controller shows on member cards (e.g. "中转（直连无响应）", relayed — direct path not responding) and in the path view:

| Reason | Meaning |
|---|---|
| Probing direct candidates | The peer's candidate addresses are known; probing starts |
| Punch request from the coordinator | The coordinator asked for hole punching; probing starts |
| Direct probing succeeded | The upgrade conditions are met; switched to direct |
| Switched to a better direct endpoint | A clearly better direct address was found |
| Direct path not responding | Liveness probe replies stopped arriving |
| Too much loss on the direct path | Packet loss above 20% |
| Direct latency stays high | Round trips stayed above 3× the baseline |
| Direct path answers pings but drops data | Probes work, but encrypted data gets no response |
| No direct candidate responded | A whole probing round failed; backing off |
| P2P disabled | "Disable P2P direct connections" is on |

---

## Network Changes

When a device switches networks (for example between Wi-Fi and a phone hotspot), its addresses change and everything bound to the old ones stops working: the coordinator connection, the relay registration, the endpoints reported to peers, and any established direct paths. Since 3.1.8 the core handles this itself:

| Platform | How changes are noticed |
|---|---|
| Windows / Linux / macOS | The addresses of the physical network interfaces are checked every 2 seconds; once new addresses are the same on two checks in a row (about 2–4 seconds), the network counts as switched. Having no address for a moment mid-switch, or returning to the previous addresses, doesn't count |
| Android | The system reports network changes; reconnecting and re-registering only happen when this device's addresses actually changed |

Once a network change is noticed, the core immediately:

1. Reconnects to the coordinator (retrying at once if it was waiting to reconnect)
2. Resolves the host names of the relay (and the room relay) again and registers from the new address. The new network may lack the address family they resolved to, e.g. after moving from a phone hotspot to a Wi-Fi without IPv6 (since 3.1.9)
3. Re-detects and reports its endpoints, so peers start probing the new direct addresses
4. Clears the hold periods and probing backoff of paths that aren't direct, and every paused direct address, then probes again at once (direct paths keep their liveness checks and drop back to relayed within about 5 seconds if dead)
5. Clears the local DNS cache

In addition, when nothing at all (not even a reply to its heartbeat) arrives on the coordinator connection for **75 seconds**, the connection counts as lost and is re-established at once.

As long as a network switch takes no more than about a minute, the device stays in its room. After a longer outage the coordinator removes the device from the room; the client rejoins automatically once it is back, and in between the other members get no game discovery from it.

> Clients up to 3.1.7 don't notice network changes: the coordinator connection is only re-established after a TCP timeout (possibly tens of minutes), and new endpoints only go out with the next periodic report (up to 5 minutes), during which the device is removed from its room.

---

## Path Control

You can manually intervene in path selection in the controller under **Settings → Diagnostics & Debugging → Advanced Options → Path Selection**:

| Option | Effect |
|---|---|
| Disable P2P direct connections | Always forward traffic through relays: existing direct paths drop back to relayed at once; no direct-connection candidate addresses are reported to peers, and peers' direct probes go unanswered, so their side of a direct path drops back too |
| Lock current paths | Freeze the current path to every peer; no more switching between relayed and direct |

With both on, "Disable P2P direct connections" wins: direct paths still drop back to relayed.

---

## Connection Negotiation

When two devices need to connect, the coordinator notifies each side of the other's endpoint information and public key, triggering direct probing.

A device's endpoint information is detected and reported automatically by the client, including:

- This device's LAN IPv4 address
- The public IPv4 address after NAT mapping (detected via STUN)
- This device's public IPv6 address
- This device's preferred relay (and any room relay in use)

Endpoints are re-detected after a relay is chosen, every 5 minutes, when this device's network changes, when "Disable P2P direct connections" is toggled, and whenever a room relay's availability changes. You can also trigger it manually by clicking **Force Refresh Endpoints** under **NAT Traversal** in the controller.

The endpoint list also carries a capability marker, `feature:wgdisc1` (game discovery through the encrypted tunnel). It is not an address, and older clients ignore it.

Candidate addresses reported by peers are filtered: loopback, unspecified, multicast, broadcast and link-local addresses are ignored, and at most 16 candidates are used per device. Direct probes are answered only for **known devices**: probes from unknown sources get no reply, so someone scanning ports can't learn this device's ID.

---

## IPv6 Support

MSST-Net prefers IPv6 for direct probing.

If the local network doesn't support IPv6 routing, the system automatically falls back to IPv4: peers' IPv6 candidates aren't probed and relays are reached over IPv4 only; IPv6 is used again once the network supports it (since 3.1.9).

In dual-stack IPv4/IPv6 environments, IPv6 candidate addresses are probed first.

---

## Related

- [Architecture](/en/connect/basics/architecture)
- [Room Relay](/en/connect/spaces/room_relay)
- [Diagnostics](/en/connect/troubleshoot/diagnostics)
