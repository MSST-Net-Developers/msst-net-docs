---
title: "Release Notes"
description: "This chapter lists the user-visible changes in each MSST-Net release since 3.1.4, and what to watch out for when upgrading."
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

## 3.1.10

The core and the controller are released as 3.1.10, the client installer as 3.1.5. The IPC protocol moves to 0.5 (additions only): the 3.1.9 controller keeps working, but rule editing, group-linked rules and the other new features need both the core and the controller on 3.1.10.

### Firewall rules

- **Permanent rules can be edited in full**: source (permission group, manual sources, room members), services or ports, action and note, keeping the rule's ID; connections the rule had admitted are re-checked against the edited rule. The wizard starts with the rule's current content
- **Temporary rules** (rules with an expiry, such as those created by "Allow / Deny" in interactive authorization) can only be viewed and deleted; the list marks them "Temporary" and no longer shows an enable switch
- The new-rule wizard ends with a **Confirm** step summarizing source, services or ports, action and note; an allow rule covering all ports is flagged once more
- When you add a manual source and click "Add", the client core recognizes the device or user and shows its name (such as "Bob's PC (pc.bob)"); identifiers it can't recognize can't be added
- When a rule's ports are exactly those of some common services, the list, the details and the edit wizard show the service names (such as "Minecraft (MCJE)")
- On mobile (Android) only a rule's note and enabled state can still be changed
- New in the command-line controller: `msst-net-cli rules edit`, which replaces only what you give; `rules list` marks temporary rules
- See [Firewall Rules](/en/connect/acl/rules#managing-rules)

### Permission groups

- A rule created with a permission group is **linked** to it: when the group's members change, the rule follows automatically (before, a rule copied the members once)
- A group still used by rules can't be deleted; permission group management lists the rules that use it
- Added members are recognized by the core and shown with their names too; they are saved by their fixed IDs, so later mnemonic changes don't affect the group. Members recorded as mnemonics by 3.0.x are migrated automatically after the core starts
- Rules created with 3.1.9 or earlier aren't linked automatically; to make one follow its group, edit it and pick the group again
- See [Permission Groups](/en/connect/acl/groups#using-permission-groups-in-rules)

### System firewall and direct connections

- A system firewall drops UDP packets the peer sends first, so direct connections — especially LAN and IPv6 ones — couldn't be established. From 3.1.5 the installer allows the core's UDP port (21031 by default) in the system firewall and removes it on uninstall; the core also checks the rule every time it starts and recreates it when it is missing or stale
- Windows gets the rule `MSST-Net-Core-UDP` (all network profiles); Linux is handled only while firewalld or ufw runs, and hand-written nftables / iptables rules are left alone; on macOS the application firewall allows the core program
- See [Installing the Client](/en/connect/install/client#system-firewall)

### Windows permissions

- Fixed: on Windows, accounts in the `MSST-Net Administrators` group were still told the controller is **read-only**. The core only saw the group memberships of the logon session, so the change took effect only after signing out of Windows and back in; now reopening the controller is enough
- Installer 3.1.5 adds **the user signed in at the desktop** to the admin group on Windows. Before, when a standard user typed another administrator's password to elevate, that administrator's account was added instead
- While the installer checks that the core has started, the core's log no longer shows warnings such as `failed to send version handshake: The pipe is being closed. (os error 232)`
- See [Controller](/en/connect/install/controller#access-permissions)

### Update reminder

- The desktop controller and the WebUI check the latest stable releases of the core and the controller on GitHub / Gitee once a day and show a notice at the top, with links to the client installer, when a newer version exists; the **About** page shows the result
- The Android app checks its own version only, and the notice links to the APKs
- New in the command-line controller: `msst-net-cli check-update`
- Set the environment variable `MSST_UPDATE_CHECK=0` to turn checks off
- See [Controller](/en/connect/install/controller#update-reminder)

---

## 3.1.9

All fixes in this release are in the core. The controller is released as 3.1.9 too, without functional changes; the IPC protocol is unchanged, so the 3.1.8 controller and the 3.1.4 installer keep working.

### Room relay

- Fixed: when the room relay was the same server as this device's preferred relay (or a member's relay), the room showed **room relay unavailable** about 10 seconds after joining, every time, and room traffic kept going through each member's preferred relay. For example, the room relay was the official `us1` and this device had also selected `us1` automatically. The relay was pinged only once, and its reply was credited to the preferred relay only
- A single lost ping no longer counts as two unanswered ones: an unanswered ping used to expire only after 6 seconds, blocking the next ping 5 seconds later, so the room relay was marked unavailable more easily
- The room relay's host name is resolved again after a network change
- See [Room Relay](/en/connect/spaces/room_relay#availability-and-automatic-fallback)

### Falling back to relayed after a network change

- Fixed: after moving from a network with IPv6 (a phone hotspot, for example) to one without (some home Wi-Fi networks), the client kept sending data and registrations to the relay's IPv6 address, all of which failed (`Network is unreachable`). Dead direct paths did drop back to relayed, but the relay path didn't work either until the next relay selection; meanwhile the encrypted session could be down for minutes
- On a network change, the host names of all relays are resolved again; without an IPv6 route, a previously resolved IPv6 address is no longer kept
- While this device has no IPv6 route, peers' IPv6 direct candidates aren't probed (every probe to them used to fail at once); they're probed again once IPv6 is back
- See [Connections](/en/connect/basics/connections#network-changes)

---

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
