---
title: "Self-Hosted Relay"
description: "This chapter covers how to deploy your own MSST-Net relay and use it in rooms."
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

## Overview

Anyone can deploy a **self-hosted relay** for rooms used by themselves and their friends.

Self-hosted relays and official relays run the same program; the differences are:

| | Official relay | Self-hosted relay |
|---|---|---|
| Operator | MSST-Net | Anyone |
| Publicly listed | Yes; every device can pick it automatically | No |
| How it's used | Chosen automatically, or pinned in settings | The room owner pastes its **connection string** when creating a room to set it as the room relay |
| Who it serves | All devices | Only rooms that specified it |
| Authenticates to the coordinator with | Pre-shared key | Relay private key (challenge-response) |

For how rooms use a self-hosted relay, see: [Room Relay](/en/connect/spaces/room_relay)

---

## Prerequisites

- A server with a **public address** (a public IP, or a domain resolving to a public IP)
- An open **UDP** port (`7000` in the examples below)
- The relay program `msstnetRelay31x`

> The relay address cannot be an internal address: private addresses, loopback addresses, link-local addresses, IPv6 unique local addresses and carrier-grade NAT addresses (`100.64.0.0/10`) are all rejected.

---

## Configuration

On first run, if the configuration file doesn't exist, the program creates a default one automatically (permissions 0600):

```bash
./msstnetRelay31x -config config.yaml
```

Change it to self-hosted mode:

```yaml
node:
  addr: relay.example.com:7000      # Public address clients use to reach this relay; written into the connection string
relay:
  bind: "[::]:7000"
  mode: self_hosted
  register_auth: required           # Must be required in self-hosted mode
  password: ""                      # Optional: relay access password
  require_room_password: true       # On by default: only serve rooms that have a room password
discovery:
  auth_key_file: relay_discovery.key
control:
  server_url: https://coord.msst-net.msst2031.cn   # Coordinator address; must be https
  # relay_secret must not be set in self-hosted mode
```

The relay refuses to start in self-hosted mode if:

- `register_auth` is not `required`
- `control.relay_secret` is set (official relay secrets should never be on third-party machines)
- `server_url` is not an `https` address
- `node.addr` is not a public `host:port`

### Relay Access Password

When `relay.password` is set, the room owner must provide this password when creating a room to specify this relay; other members don't need it when joining.

- The password is never logged and never leaves the machine: the relay only submits an Argon2id verifier of the password to the coordinator
- When a password is set, keep the configuration file's permissions at `0600`, otherwise the relay issues a warning
- Changing the password takes effect after restarting the relay; rooms that already exist are unaffected

### Requiring a Room Password

`relay.require_room_password` is on by default: the coordinator refuses to create rooms that specify this relay but have no room password.

This prevents "anyone who gets the room number can enter the room and use your relay". If you really need to serve rooms without passwords, you can turn it off explicitly.

---

## Connection String

The relay prints its **connection string** at startup, and you can also view it at any time:

```bash
./msstnetRelay31x -config config.yaml -print-link
```

Connection string format:

```text
msst-relay://<node.addr>#<relay public key>[?pw=1]
```

- When a relay access password is set, it ends with `?pw=1`, which tells the client to ask for the password
- The connection string contains the relay's public key: even if someone deploys another relay at the same address, they can't impersonate it without the matching private key

Send the connection string to the room owner. When creating a room, the owner chooses **Self-hosted relay…** and pastes the connection string.

::: warning Keep the key file safe
`discovery.auth_key_file` (default `relay_discovery.key`) holds the relay's private key and is this relay's identity. If it doesn't exist on first run, it is created automatically.

Back it up together with the configuration file; changing the key changes the connection string, which then has to be redistributed.
:::

---

## Running

```bash
./msstnetRelay31x -config config.yaml
```

After starting, the relay automatically registers with the coordinator and sends a heartbeat every 10 seconds:

- Until registration succeeds, the relay forwards as usual, but room owners can't specify it yet
- When the coordinator restarts or a heartbeat fails, the relay re-registers automatically (with a backoff of 5 seconds to 5 minutes)
- When registration fails, the log shows the error code returned by the coordinator, such as `relay_unsupported` or `key_proof_invalid`

The relay's runtime status is output periodically as stats logs (one line every 60 seconds by default); there is no management API.

---

## Forwarding Rules for Self-Hosted Relays

- Only data from members who **have completed authenticated registration with this relay** is forwarded, so outsiders can't use it as an open relay
- Game discovery distribution is only provided for rooms that specified this relay
- Anyone can ping it (rate-limited); clients check whether the relay is reachable before using it

---

## Privacy and Security

The operator of a self-hosted relay **can see**:

- Room members' device IDs and public addresses
- Traffic volume and timing
- The content of game discovery data (such as a Minecraft server's MOTD)

They **cannot**:

- Read or tamper with communications encrypted with WireGuard
- Send data while impersonating a room member

A malicious relay can at most drop or delay packets. In that case, members' clients determine that the room relay is unavailable and automatically fall back to their own preferred relays, so the room keeps working.

---

## Resource Limits

The main default limits (all adjustable in `config.yaml`):

| Option | Default | Description |
|---|---|---|
| `relay.max_sessions` | 65536 | Maximum number of devices registered at once |
| `relay.session_ttl` | 120s | How long a device registration lasts without keepalives |
| `discovery.sender_rate` | 10/s | Game discovery send rate per device |
| `discovery.max_fanout` | 256 | Maximum number of members each discovery packet is delivered to |
| `log.stats_interval` | 60s | Stats log interval; 0 disables it |

---

## Related

- [Room Relay](/en/connect/spaces/room_relay)
- [Architecture](/en/connect/basics/architecture)
