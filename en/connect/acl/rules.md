---
title: "Firewall Rules"
description: "This chapter covers MSST-Net's firewall rules."
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

## What Are Firewall Rules

**Firewall rules** control which devices can access which ports and services on this device.

Each rule specifies:

- **Source (principal)**: who can (or cannot) access
- **Target (protocol and port)**: which traffic is allowed or denied
- **Action**: allow or deny

MSST-Net uses a **default-deny** policy: inbound access that matches no rule is always denied (and may trigger interactive authorization depending on the situation).

Rules are stored and enforced by the client core; the controller only creates, displays and manages them.

---

## Managing Rules

On the controller's **Defense** page you can:

- **New Rule**: pick a source, target and action step by step in a wizard
- **Enable / Disable a rule**: disabled rules stay in the list but don't take part in matching
- **Edit**: change the rule's note
- **Duplicate as New Rule**: use an existing rule as a template for a new one
- **Delete** a rule, or **Clear** all rules

The current version only supports changing a rule's **note** and **enabled state**. To change the source, port or action, use "Duplicate as New Rule" and then delete the old rule.

> On **mobile** (Android), rules can't be created manually through the wizard, but they can be added:
> - When handling an interactive authorization request
> - From an entry in the access log
> - By long-pressing a room member card

---

## Connection Tracking

The MSST-Net firewall performs **stateful connection tracking**.

When this device initiates an outbound connection, the system automatically records the connection state. Return packets from the peer are allowed automatically, with no extra rules needed.

This means:

- Return traffic for connections you initiate doesn't need its own rule
- Rules only control inbound connections **initiated by the peer**

Once a rule lets an inbound connection in, this device's replies are tracked too, so later packets needn't be matched against the rules every time. The core remembers which rule allowed the connection, so **revoking a permission takes effect at once**:

| Action | Established connections |
|---|---|
| Deleting, disabling or clearing rules | Cut immediately; the peer's next packet is judged by the rules again |
| Leaving a room, or the other member leaving | Connections allowed only by a room-level rule (or by sharing the room) are cut immediately |
| A rule expiring | **Not cut** (for example, a game started after an "Allow" authorization can go on) |
| Another rule still allows it | Unaffected |

---

## Rule Priority

When multiple rules match the same packet, the system takes the first matching rule in this priority order:

1. **Device-level deny** (highest priority)
2. **Device-level allow**
3. **User-level deny**
4. **User-level allow**
5. **Room-level deny**
6. **Room-level allow**
7. **Default deny** (when no rule matches)

**Device-level rules** take precedence over user-level rules, and user-level rules over room-level rules; within the same level, deny takes precedence over allow; among multiple rules with the same level and action, the one created first wins.

---

## Source (Principal)

A rule's **source (principal)** specifies which devices, users or room members the rule applies to.

### Source Types

| Type | Description |
|---|---|
| Device | The rule applies only to the specified devices |
| User | The rule applies to all devices of that user |
| Room | The rule applies to all members currently in the same room as this device |

All sources in a single rule must be of the same type.

### How to Specify a Source

In the rule wizard, you can:

- **Use a named permission group**: pick from groups you've created (recommended); see [Permission Groups](/en/connect/acl/groups)
- **Specify sources manually**: enter device or user mnemonics or IDs
- **For Room Mode**: match all current room members without specifying individual members

### Source Identifiers

When specifying sources manually, you can use the following identifiers:

| Identifier | Example | Description |
|---|---|---|
| Device ID | `device-a7f29b3e` | Matches the specified device exactly |
| User ID | `user-1a2b3c4d` | Matches all devices of that user |
| Device mnemonic | `archlinux` | Matches the device with that name under the current user |
| Combined mnemonic | `archlinux.abjust` | Matches the specified device under the specified user |
| User mnemonic | `abjust` | Matches all devices of the specified user |
| Wildcard | `*` | Matches all devices or all users |

**Mnemonics are resolved to fixed IDs when the rule is created**: the client core looks up the ID for a mnemonic locally first and then with the coordinator, and the rule stores the ID. Therefore:

- If the other party later changes their mnemonic, the rule still points to the original device or user
- A mnemonic that can't be resolved causes rule creation to fail
- The rule list still shows the mnemonic entered at creation time, for easier recognition

**Room-level rules** don't need specific IDs; the system matches current room members dynamically when a packet arrives.

For details on identifiers, see:

[Identifiers](/en/connect/basics/identifiers)

---

## Protocols and Ports

A rule's target can be specified in one of the following ways:

| Method | Description |
|---|---|
| Service (simple) | Pick from a list of common services |
| Protocol/port (advanced) | Specify the protocol and port manually |
| All protocols and ports (not recommended) | Matches every port on this device |

> When you choose "All protocols and ports" or all ports of a protocol, the controller shows a security warning: if the action is "allow", the rule's sources will be able to reach **every** listening service on this device, including remote desktop, file sharing, databases, debugging interfaces and more. We recommend choosing only the services or ports you actually need.

### Protocols

Supported protocols:

| Value | Description |
|---|---|
| `tcp` | Matches TCP traffic only |
| `udp` | Matches UDP traffic only |
| `tcp+udp` | Matches both TCP and UDP (stored as two protocol/port groups) |

### Ports

Ports can be specified as:

| Format | Example | Description |
|---|---|---|
| Single port | `25565` | Matches only that port |
| Port range | `8000-9000` | Matches all ports in the range |
| Wildcard | `*` | Matches all ports (1–65535) |

A single rule can contain multiple services or multiple protocol/port groups.

---

## Common Services

MSST-Net has built-in protocol and port presets for common services to make rule setup quick:

### Games

| Service | Protocol / port |
|---|---|
| Minecraft (Java Edition) | tcp/25565 |
| Minecraft (Bedrock Edition) | udp/19132 |
| Rusted Warfare | tcp/5123 |
| MSST Card Battle | tcp/9178 |
| Terraria | tcp/7777 |
| Factorio | udp/34197 |

### Web Services

| Service | Protocol / port |
|---|---|
| HTTP | tcp/80 |
| HTTPS | tcp/443 |
| HTTP/3 (QUIC) | udp/443 |

### File Services

| Service | Protocol / port |
|---|---|
| FTP | tcp/21 |
| FTPS | tcp/990 |
| NFS | tcp/2049 |
| SMB/CIFS | tcp/445 |

### Databases

| Service | Protocol / port |
|---|---|
| MySQL | tcp/3306 |
| PostgreSQL | tcp/5432 |
| MongoDB | tcp/27017 |
| Redis | tcp/6379 |
| MSSQL | tcp/1433 |
| Oracle DB | tcp/1521 |

### Remote Access

| Service | Protocol / port |
|---|---|
| SSH | tcp/22 |
| RDP | tcp/3389 |
| RDP (UDP) | udp/3389 |
| VNC | tcp/5900 |

### Other

| Service | Protocol / port |
|---|---|
| SMTP | tcp/25 |
| DNS | udp/53, tcp/53 |

---

## Action

Each rule's action is one of:

| Action | Description |
|---|---|
| Allow (`allow`) | Let traffic matching this rule through |
| Deny (`deny`) | Block traffic matching this rule |

---

## Direction

The current version only enforces **inbound** rules, that is, it controls traffic initiated by the peer to access this device. All rules created by the controller are inbound rules.

---

## Expiry

Rules can have an **expiry time**, after which they expire automatically and are removed from the list. Connections established before the expiry are not cut by it; new connections need a new authorization.

Without an expiry time, a rule is valid permanently.

Expiry is commonly used for temporary authorization: when you choose "Allow" or "Deny" (rather than "Always") in interactive authorization, the system creates a rule that expires after 10 minutes.

---

## Ping (ICMP)

ICMP echo requests (`ping`) aren't controlled by regular rules; instead, they're controlled by the **Ping (ICMP)** toggle on the **Defense** page, which is **off** by default.

When it's on, devices on the network can ping this device's virtual IP.

Other ICMP messages don't go through the rules either, but only the kinds a peer can legitimately send are accepted:

- Echo replies when this device pings the peer
- Error messages about **a packet this device sent to that device** (port unreachable, fragmentation needed, time exceeded, …)

Redirects, router and neighbor discovery, timestamps and the like, and error messages about this device's other connections, are dropped. The same applies to ICMPv6.

---

## Rule Matching Flow

When an inbound packet arrives, the system processes it in this order:

0. A decrypted packet must come from the peer's own virtual IP and be addressed to this device's virtual IP, otherwise it is dropped (ICMP is handled as above)
1. Check whether it's a return packet for a tracked connection → if so, allow it
2. Check the unauthenticated restriction: if either side is unauthenticated and the two aren't in the same room → deny
3. Walk all enabled, unexpired rules in priority order and find the first match
4. If a matching rule is found, allow or deny according to its action
5. If no rule matches, either trigger **interactive authorization** or silently drop, depending on the source

Every decision is recorded in the access log.

See:

- [Interactive Authorization](/en/connect/acl/interactive_auth)
- [Access Log](/en/connect/acl/access_log)

---

## Related

- [Permission Groups](/en/connect/acl/groups) — combine multiple devices or users into reusable permission groups
- [Interactive Authorization](/en/connect/acl/interactive_auth) — dynamic authorization when no rule matches
- [Access Log](/en/connect/acl/access_log) — see the decision for every access
