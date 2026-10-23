---
title: "Release Notes"
description: "This chapter lists the user-visible changes in each MSST-Net release since 3.1.4, and what to watch out for when upgrading."
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

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

Coordinators and relays write the defaults of their version to `config.yaml` on first start, so **existing deployments must be changed by hand**. See [Security Model](/en/connect/basics/security#recommendations-for-operators).

---

## Related

- [Installing the Client](/en/connect/install/client)
- [Security Model](/en/connect/basics/security)
- [FAQ](/en/connect/faq)
