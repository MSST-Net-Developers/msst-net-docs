---
title: "MSST-Net ezPlay"
description: "This chapter covers MSST-Net ezPlay hostnames."
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

## What Is an ezPlay Hostname

An **ezPlay hostname** is a human-readable hostname that MSST-Net assigns to every connected device, replacing hard-to-remember IP addresses on the virtual network.

With an ezPlay hostname, you can reach devices on the network directly using a name like `archlinux.abjust.ezplay.msst.net`, just like typing a domain into your browser.

---

## Hostname Format

ezPlay hostnames have the format:

```text
{device mnemonic}.{user mnemonic}.ezplay.msst.net
```

For example:

```text
archlinux.abjust.ezplay.msst.net
```

Where:

- `archlinux` is the device mnemonic
- `abjust` is the user mnemonic
- `.ezplay.msst.net` is the fixed suffix

If the device or user hasn't set a mnemonic yet, the corresponding ID is used instead.

> The short `.ezplay` suffix from the 3.0.x documentation is no longer used; use the full `.ezplay.msst.net` suffix.

---

## Hostname Assignment

ezPlay hostnames are assigned by the coordinator.

When the client first connects to the coordinator, or after a mnemonic is updated, the coordinator checks the proposed hostname for uniqueness:

- If the hostname is free, it is assigned directly
- If the hostname is already taken by another device, the coordinator automatically appends a number (such as `archlinux-1.abjust.ezplay.msst.net`)

Once assigned, the hostname is stored locally on the device and shown on the controller home page, where it can be copied with one click.

---

## How to Use It

### Reaching Other Devices

Within the same MSST-Net network (both in the Network or in the same room), you can use ezPlay hostnames directly in programs or on the command line:

```bash
ping archlinux.abjust.ezplay.msst.net
ssh user@archlinux.abjust.ezplay.msst.net
```

> `ping` requires the peer to turn on Ping (ICMP) on its Defense page; see [Firewall Rules](/en/connect/acl/rules#ping-icmp).

### In Games

In games that let you enter an IP or hostname manually, you can enter the ezPlay hostname as the server address. For example, in Minecraft's multiplayer screen:

```text
archlinux.abjust.ezplay.msst.net:25565
```

In a room, you can also use **Copy Hostname** on a member card.

---

## Local Name Resolution

The client core has a built-in DNS resolver that only takes over queries for `*.msst.net`; other domains are still resolved by the system's existing DNS:

| Platform | How it takes over |
|---|---|
| Windows | An NRPT rule sends `.msst.net` to `127.0.0.1:53` |
| macOS | Creates `/etc/resolver/msst.net`, pointing to `127.0.0.1:21053` |
| Linux | Prefers configuring split DNS for the virtual adapter via systemd-resolved; falls back to intercepting DNS queries with iptables |
| Android | The VPN service sets MSST-Net's virtual DNS as the system DNS |

When resolving `*.msst.net`:

- Known peer devices are resolved locally, without network access
- Unknown names are then looked up with the coordinator
- The result is the device's virtual IPv4 address (`172.22.x.y`) and virtual IPv6 address (`fd22:2222:2222:2222::xxxx:xxxx`)
- Successful results are cached for 30 seconds, not-found results for 10 seconds

### Linux DNS Configuration Mode

In the controller under **Settings → Diagnostics & Debugging → Advanced Options → DNS Configuration Mode**, you can choose:

| Mode | Description |
|---|---|
| Prefer split DNS (default) | Configure via systemd-resolved first, automatically switching to DNS interception if unavailable |
| DNS interception only | Only use iptables DNS interception rules, skipping systemd-resolved |

---

## Changing the Hostname

The ezPlay hostname depends on the device mnemonic and user mnemonic. When a mnemonic changes, the hostname is updated accordingly.

The device mnemonic can be changed on the controller's **Settings** page. An authenticated user's user mnemonic comes from the account and can't be changed locally.

---

## Notes

- ezPlay hostnames only work within the MSST-Net virtual network and can't be resolved directly from the public internet
- Hostnames are case-insensitive (all-lowercase is recommended)
- After changing a mnemonic, the old hostname may be taken by another device

---

## Related

- [Custom Domains](/en/connect/extras/custom_domains) — register your own namespace under `.msst.net`
- [Identifiers](/en/connect/basics/identifiers) — learn about mnemonics and IDs
- [Connections](/en/connect/basics/connections) — learn how virtual IP addresses are assigned
