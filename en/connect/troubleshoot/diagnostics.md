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
| Disable P2P direct connections | Always forward traffic through relays |
| Lock current paths | Prevent any path switching |
| Relay preference | Pick the best automatically, or pin an official relay |

### Relay Registration

Shows how this device is registered with the current relay:

- **Authenticated registration (sreg1)**: uses signed registration, so only the holder of the device's private key can change it
- **Legacy registration (unauthenticated)**: used when the relay doesn't support authenticated registration

It also shows the number of registration packets sent and when the **relay path was last verified** — meaning a round trip through this device's preferred relay has been confirmed to work.

If the current room specifies a room relay, the room relay's resolved address and registration count are shown as well.

### Game Discovery

Shows game discovery statistics: the number of discovery packets received, the number dropped for each reason, and the list of relays discovery data is sent to.

| Drop reason | Meaning |
|---|---|
| Sender not verified | The relay didn't verify the sender's identity, so the client rejected it |
| Duplicate via another relay | The same discovery packet arrived via multiple relays; it is injected only once |
| Replay | An expired or duplicate discovery packet |

If it shows "The current relay doesn't provide a public key", that relay doesn't support secure game discovery, and game discovery can't work through it.

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

Sends 10 probes (200 ms apart, 2-second timeout) to the first **direct-connection candidate address** reported by the specified device, and reports the number sent, received and lost, plus the average round-trip time. You can **Select from Peer List** or enter the target device ID directly.

This tool checks **whether a direct connection to the peer is possible**; it doesn't go through a relay and isn't affected by the peer's Ping (ICMP) toggle:

- All timed out: the peer hasn't reported a direct address, or the two sides can't communicate directly (they can still communicate via relay)
- Responses received: the direct address is reachable; compare with the path view to see why it hasn't been upgraded to direct yet

---

## Troubleshooting Approach

When you can't reach a peer's service, we recommend checking in this order:

1. **Local status**: are all three connection statuses normal?
2. **Is the peer reachable**: check whether the peer's encryption state in the path view is "Encrypted"; if you need to investigate direct connectivity, test with **Ping Peer**
3. **Peer firewall**: ask the peer to check under **Defense → Access Log** whether your access was denied, and why
4. **The service itself**: confirm the peer's service is listening, and not only on `127.0.0.1`

---

## Related

- [FAQ](/en/connect/faq)
- [Connections](/en/connect/basics/connections)
- [Access Log](/en/connect/acl/access_log)
