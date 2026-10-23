---
title: "Release Notes"
description: "This chapter lists the user-visible changes in each MSST-Net release since 3.1.4, and what to watch out for when upgrading."
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

## 3.1.8

### Faster recovery after switching networks

- Desktop cores notice network changes themselves (switching between Wi-Fi and a phone hotspot, for example): once the new addresses are stable (about 2–4 seconds), they reconnect to the coordinator, register again with the relay from the new address, re-detect and report endpoints, and let every path that isn't direct probe for a direct connection again at once
- A coordinator connection that receives nothing for 75 seconds counts as lost and is re-established (before, this could take until a TCP timeout — about 27 minutes in one test — during which the device was removed from its room and members got no game discovery from it)
- A network switch that takes no more than about a minute no longer **removes the device from its room**; the other members don't see it leave and rejoin
- On Android the system reports network changes; the coordinator is only reconnected when this device's addresses actually changed, not for the callback at startup or a second network coming and going
- When automatic relay selection fails 3 times in a row, it keeps retrying in the background (from 30 seconds, doubling up to 5 minutes) instead of waiting for the next coordinator reconnect (for example when the network isn't up yet at boot)
- See [Connections](/en/connect/basics/connections#network-changes)

### Switching between direct and relayed

- Direct paths are checked **every second**, so a dead direct path drops back to relayed within about 5 seconds. The **keepalive interval** setting now applies to relay registration only; before, it also set the probe interval of direct paths, so with it set (5–30 seconds) a dead direct path could take about a minute to be downgraded
- New downgrade reason: when probe replies still arrive but the encrypted data this device sends gets no response at all for 20 seconds (an MTU black hole, for example), the path drops back to relayed at once and that direct address isn't used for 1 minute (doubling on repeats, up to 10 minutes; cleared when the network changes)
- During the 30-second hold period after a downgrade, a punch request from the coordinator no longer upgrades the path straight back to direct, avoiding flapping
- Round-trip times are measured from this device's own send times, so a peer can't fake them
- Relay paths with round trips over 2 seconds are measured too; candidate addresses that are merely reordered no longer reset the probing backoff
- See [Connections](/en/connect/basics/connections#direct-mode)

### Game discovery

- On Linux and macOS, capturing the broadcasts this device sends on its physical LAN follows the current network: it works after switching networks, and when the core starts before the network is up (before, only the addresses at startup were recognized, so after a switch every broadcast this device sent was dropped)
- Subnet broadcasts are recognized by each network's actual broadcast address, e.g. `172.20.10.15` on an iPhone hotspot (`172.20.10.0/28`); ordinary addresses that happen to end in `.255` are no longer taken for broadcasts
- See [Room Mode](/en/connect/spaces/room_space#game-discovery)

### Controller

- Member cards and the path view show **why the path last changed**, e.g. "relayed (direct path not responding)" — also after the controller reconnects
- **Keepalive Interval** is now labeled **Relay Keepalive Interval**, noting that it doesn't affect the liveness checks of direct paths
- New **command-line controller** `msst-net-cli`: the WebUI's features in a terminal on the device running the core; see [Controller](/en/connect/install/controller#cli)
- Rules whose source is `*` read "all devices / all users"
- Fixed: every **Endpoint History** time showed as 1970

### Client installer 3.1.4

- A new controller choice, **command line** (`--controller cli`), after which `msst-net-cli` can be run directly; the core can also run in Docker alone, with the command-line controller on the host (use `sudo msst-net-cli`)
- **The 3.1.8 controller needs installer 3.1.4 or newer**; older installers refuse to install it, so update the installer first
- See [Installing the Client](/en/connect/install/client#using-the-client-installer-recommended)

### Servers

- Coordinators and relays write their log to `coordinator.log` / `relay.log` in the working directory as well as the terminal (owner-only), rotated by size: 50 MB per file and 5 old files by default. This takes effect without changing existing configs
- See [Self-Hosted Relay](/en/connect/selfhost/relay#running)

---

## 3.1.7

### Internal domain is now net.msst2031.cn

- The internal domain suffix changes from `.msst.net` to `.net.msst2031.cn`, since `msst2031.cn` is held by MSST and `msst.net` isn't
- ezPlay hostnames: `<device>.<user>.ezplay.net.msst2031.cn`; official services: `*.srv.net.msst2031.cn`; custom namespaces: `<namespace>.net.msst2031.cn`
- The old suffix **no longer resolves** and is no longer sent to the local resolver; the core removes the `msst.net` split-DNS rules older versions left (macOS, Windows)
- These names resolve only on devices running the client core; public DNS doesn't have them
- Once the coordinator is upgraded, clients running 3.1.6 or older can no longer resolve any MSST-Net hostname (virtual IPs work as usual)
- See [MSST-Net ezPlay](/en/connect/extras/ezplay)

### Custom domains

- New reserved names (`srv`, `ezplay` and others) can't be applied for as namespaces; namespaces with these names registered earlier no longer resolve
- Record subdomains, content and TTL are validated; each namespace holds at most 100 records
- Adding or editing a record checks that the namespace is yours and approved; official services, ezPlay hostnames and other users' records can't be changed
- See [Custom Domains](/en/connect/extras/custom_domains#only-your-own-namespace)

---

## 3.1.6

### Game discovery is end to end

- Game discovery data is now sent **to each room member separately inside the WireGuard tunnel**, no longer distributed by relays, and UDP 21032 is no longer used
- Relays (including self-hosted room relays) can't see discovery content, nor send discovery as a room member
- Only UDP broadcasts (any port, to MSST-Net's broadcast address) and the two multicast groups of Minecraft Java Edition (`224.0.2.60:4445`) and mDNS (`224.0.0.251:5353`) are forwarded
- Receivers accept discovery only from members of their room, rebuild each packet with the sender's own address, and rate-limit it (10 per second per sender, 100 per second in total)
- **There is no game discovery with devices running 3.1.5 or older**; member cards mark members with an older version
- See [Room Mode](/en/connect/spaces/room_space#game-discovery)

### Security hardening

- Packets from a peer must be addressed to this device's virtual address: a peer can't use this device to reach its LAN or other devices (even with IP forwarding on)
- A peer's public key must match its device ID; its virtual addresses must be inside MSST-Net's ranges and unique
- ICMP from peers: only ping and its replies, and error messages about packets this device sent to them
- Only official relays announced by peers are used; **Relay Preference** accepts official relays only
- Room relays must be at public unicast addresses
- Direct probes are answered only for known devices; loopback, multicast and similar addresses among a peer's direct candidates are filtered, at most 16 are used
- On Linux, broadcast forwarding is turned off on the virtual adapter
- See [Security Model](/en/connect/basics/security)

### Controller

- Member cards show game discovery compatibility
- The diagnostics page's game discovery statistics use the new counters (sent, received, not sent, drop reasons)

---

## 3.1.5

- With **Disable P2P direct connections** on, existing direct paths drop back to relayed at once, and this device stops answering peers' direct probes
- **Revoking a permission takes effect at once**: deleting, disabling or clearing rules, leaving a room or the other member leaving cuts the established connections they allowed; a rule that expires doesn't
- When the coordinator reclaims a room (for example, all members asleep for more than 2 minutes), the client **leaves the room automatically** and the controller returns to the home page
- **Ping Peer** probes the path actually used (direct, or the encrypted tunnel via relays) and names it in the result
- Devices you're talking to are no longer dropped after 2 hours; a peer's first handshake that arrives before this device has its key is held and answered as soon as the key arrives, avoiding a ~5-second wait on first contact
- The mobile controller no longer shows Linux-only network options

---

## 3.1.4

- New network setting **Block other VPNs over MSST-Net** (Linux only, on by default): keeps Tailscale and the like from treating MSST-Net addresses as a direct path and building a tunnel inside a tunnel
- Fix: flushing a routing table that doesn't exist is no longer an error

---

## Server Defaults

For those running a coordinator or relay:

| Component | Setting | New default | Notes |
|---|---|---|---|
| Coordinator | `device_key_proof` | `required` | Registering devices must prove they hold their key |
| Coordinator | `persistence.driver` | `sqlite` (`coordinator.db`) | Device key pins survive restarts; the database file is owner-only |
| Relay | `relay.register_auth` | `required` | Refuse unauthenticated registration; needs `control.server_url` |
| Coordinator, relay | `log.file` | `coordinator.log` / `relay.log` | The log also goes to a file (since 3.1.8); set it empty for terminal output only |

Coordinators and relays write the defaults of their version to `config.yaml` on first start, so **existing deployments must be changed by hand** (except `log.file`: when a config lacks it, the default applies). See [Security Model](/en/connect/basics/security#recommendations-for-operators).

---

## Related

- [Installing the Client](/en/connect/install/client)
- [Security Model](/en/connect/basics/security)
- [FAQ](/en/connect/faq)
