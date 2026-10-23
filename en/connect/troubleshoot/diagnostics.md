---
title: "Diagnostics"
description: "This chapter covers the diagnostics and debugging tools in the controller, and how to use them to track down connection problems."
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

## Where to Find It

The diagnostic tools are in the controller under **Settings → Diagnostics & Debugging**.

All diagnostic information comes directly from the client core and reflects its real state.

---

## Connection Status

The top of the page shows three basic statuses:

| Item | Meaning |
|---|---|
| Controller ↔ Client Core | Whether the controller is connected to the local core |
| Coordinator | Whether the core is connected to the coordinator |
| Virtual network adapter | Whether the virtual network adapter is ready |

It also shows the IPC protocol versions of the controller and core, the total number of disconnects, and the most recent error.

### Common Status Combinations

| Symptom | Possible cause |
|---|---|
| Controller can't connect to the core | The core isn't running, or the current user lacks access permission (see [Controller](/en/connect/install/controller#connecting-to-the-client-core)) |
| Coordinator not connected | A local network problem, a misconfigured coordinator address, or the coordinator is temporarily unavailable |
| Virtual network adapter not ready | The core lacks administrator / root privileges; on Windows, `wintun.dll` is missing |

---

## Re-register

Click **Re-register** and the core immediately resubmits the device information (device name, mnemonic, public key, etc.) to the coordinator.

Useful when you've changed the device name or mnemonic and want it synced right away.

---

## Viewing Logs

Click **View Logs** to see the client core's recent logs:

- Filter by level
- **Refresh** or **Clear** the log buffer
- **Export** logs to make reporting problems easier

> Logs never contain private keys, access tokens or passwords.

---

## Advanced Options

### Path Selection

| Option | Description |
|---|---|
| Disable P2P direct connections | Always forward traffic through relays; existing direct paths drop back to relayed at once |
| Lock current paths | Prevent any path switching |
| Relay preference | Pick the best automatically, or pin an official relay (official relays only) |

### Relay Registration

Shows how this device is registered with the current relay:

- **Authenticated registration (sreg1)**: uses signed registration, so only the holder of the device's private key can change it
- **Legacy registration (unauthenticated)**: used when the relay doesn't support authenticated registration

It also shows the number of registration packets sent and when the **relay path was last verified** — meaning a round trip through this device's preferred relay has been confirmed to work.

If the current room specifies a room relay, the room relay's resolved address and registration count are shown as well.

### Game Discovery (End to End over WireGuard)

Shows game discovery statistics:

| Item | Meaning |
|---|---|
| Sent | Discovery messages sent to room members (each broadcast × each member) |
| Received | Discovery packets injected into this device |
| Not sent (member's version too old) | Broadcasts not sent to a member because it runs client 3.1.5 or older |
| Dropped | Counted per reason, see below |

| Drop reason | Meaning |
|---|---|
| Sender not a room member | The sender isn't in the room this device is in |
| Not a game discovery broadcast | The content doesn't follow the game discovery rules (only UDP broadcasts and the two discovery multicast groups) |
| Over the rate limit | One sender exceeded 10 per second, or all senders together exceeded 100 per second |

> With a core of 3.1.5 or older, the controller doesn't show this section.

### Path View (Read-Only)

Lists the current path and encryption state for each peer:

- **Selected**: the path in use (relay or direct address)
- **Encryption**: WireGuard session state (not established / handshaking / encrypted / failed / no public key) and handshake time
- The number of consecutive failed direct-probing rounds, and when the next probe will happen

### Network Transport

| Setting | Description |
|---|---|
| MTU | 1280–1500, automatic (1280) by default; takes effect after restarting the core |
| DNS configuration mode (Linux only) | Prefer split DNS, or DNS interception only |
| Bypass other VPNs' full tunnels (Linux only) | On by default, see [Client Configuration](/en/connect/install/configuration#network-settings) |
| Block other VPNs over MSST-Net (Linux only) | On by default, see [Client Configuration](/en/connect/install/configuration#network-settings) |

Linux-only options are not shown in the mobile controller.

### Traffic Counters

Shows data sent, received and dropped per peer. Reset automatically when the path switches.

### NAT Traversal

- **Current endpoints**: the direct-connection candidate addresses this device most recently reported
- **Endpoint history**: the last 10 reported endpoints
- **Keepalive interval**: 5–30 seconds, 25 seconds by default; applies to both relayed and direct connections
- **Force Refresh Endpoints**: re-detect and report endpoints immediately

---

## Other Diagnostic Tools

### Ping Peer

Sends 10 probes (200 ms apart, 2-second timeout) to the specified device, and reports the number sent, received and lost, plus the average round-trip time. You can **Select from Peer List** or enter the target device ID directly.

Since 3.1.5 the probes take **the path actually used** to talk to that device, named in the result's **Path** line:

| Path | How it probes |
|---|---|
| P2P direct | Direct probe packets to the direct address in use |
| Relayed (inside the WireGuard tunnel) | Probe packets inside the encrypted tunnel via the relays, answered by the peer's core; without an encrypted session a handshake comes first, so the first result may include it |

The peer's client core answers the probes itself, so the peer's Ping (ICMP) toggle doesn't matter:

- All timed out: the path to the peer isn't working (compare with the encryption state in the path view)
- Higher latency through a relay is normal; to find out why there is no direct path, check the direct probing state in the path view

> Cores up to 3.1.4 always probed the peer's first direct candidate, which timed out for every relayed peer; with such a core the controller doesn't show the Path line.

---

## Troubleshooting Approach

When you can't reach a peer's service, we recommend checking in this order:

1. **Local status**: are all three connection statuses normal?
2. **Is the peer reachable**: check whether the peer's encryption state in the path view is "Encrypted", or test the current path with **Ping Peer**
3. **Peer firewall**: ask the peer to check under **Defense → Access Log** whether your access was denied, and why
4. **The service itself**: confirm the peer's service is listening, and not only on `127.0.0.1`

---

## Related

- [FAQ](/en/connect/faq)
- [Connections](/en/connect/basics/connections)
- [Access Log](/en/connect/acl/access_log)
