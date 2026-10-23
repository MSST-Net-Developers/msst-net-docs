---
title: "Room Relay"
description: "This chapter covers how to assign a relay to a room, and how room relays work."
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

## What Is a Room Relay

By default, each member of a room uses their own preferred relay (usually the official relay closest to them).

When **creating a room**, the owner can specify a relay as the **room relay**: from then on, all traffic in the room that needs a relay goes through that relay instead.

Room relays are useful when:

- Members are in the same region and want to share one relay that's close to everyone
- You want to use your own **self-hosted relay** for more stable or lower-latency forwarding

---

## Which Relays Can Be Specified

| Type | How to specify | Notes |
|---|---|---|
| None (default) | — | Each member uses their own relay |
| Official relay | Pick from the official relay list | No password needed |
| Self-hosted relay | Paste the **connection string** shown when the relay starts | May require the relay access password |

A self-hosted relay's connection string looks like this:

```text
msst-relay://relay.example.com:7000#<relay public key>
```

A trailing `?pw=1` on the connection string means the relay has an access password set.

For how to deploy a self-hosted relay, see: [Self-Hosted Relay](/en/connect/selfhost/relay)

---

## Creating a Room with a Room Relay

1. In the controller, click **Create Room** and enter a room name
2. Under **Room Relay**, choose:
   - **None**
   - **Official: &lt;address&gt;**
   - **Self-hosted relay…**, then paste the connection string
3. If the self-hosted relay has an access password, fill in **Relay Access Password**
4. If the relay requires rooms to have a password (self-hosted relays require this by default), check **Set Room Password** and fill it in
5. Click **Create**

The room relay can only be specified when creating the room and **cannot be changed afterwards**.

### Who Needs Which Password

| | Owner creating the room | Other members joining |
|---|---|---|
| Room password (if any) | Required | Required |
| Relay access password (if any) | Required | **Not needed** |

The relay access password authorizes "this room may use this relay", so only the owner needs to know it; other members only need the room password.

### Common Reasons Room Creation Fails

| Message | Cause |
|---|---|
| Invalid relay | The connection string is malformed, or the public key is wrong |
| Relay offline | The relay isn't currently registered with the coordinator |
| Relay version not supported | The relay doesn't support the required protocol feature (authenticated registration), so it can't be used as a room relay |
| Relay password required / Wrong relay password | The relay has an access password set |
| Room password required | The relay requires rooms that use it to have a room password |
| Already in a room | A device can only be in one room at a time; leave the current room first |

### Address Requirement

A room relay must be at a **public unicast address**. Clients refuse a room relay that resolves to a loopback, private (`10.0.0.0/8`, `192.168.0.0/16`, …), CGNAT (`100.64.0.0/10`), link-local or IPv6 unique-local address; members then use their own preferred relays.

This keeps a room's creator from using the room relay to make every member send traffic into their own LAN or to their own host.

---

## Member Notice

In rooms that use a self-hosted relay, every member sees a "This room uses a self-hosted relay" notice along with the relay address in the room UI. Members can't opt out of the room relay, but they can choose not to join the room.

A self-hosted relay can see members' device IDs, public addresses and traffic timing; it **cannot see or forge** communications encrypted with WireGuard. Since 3.1.6 game discovery travels inside the encrypted tunnel as well, so a self-hosted relay can neither see discovery content (such as a Minecraft server's MOTD) nor send discovery as a room member.

---

## Availability and Automatic Fallback

Each member's client independently determines whether the room relay is available:

| State | Meaning |
|---|---|
| Probing | Just joined the room; checking whether the relay is reachable |
| OK | The relay is reachable and room traffic goes through it |
| Unavailable | The relay isn't responding; room traffic falls back to each member's preferred relay |

- 3 consecutive unanswered pings (about 15 seconds) mark it unavailable, and the client falls back immediately
- After becoming unavailable, it keeps probing and only switches back to the room relay after 30 consecutive seconds of normal responses, to avoid flapping

So even if the room relay fails, the room keeps working.

### Path Selection

Data sent to room members picks a path in this order:

1. A direct connection with the peer exists: send directly
2. Both the peer and this device can use the room relay: send via the room relay
3. Otherwise: send to the peer's preferred relay (or to this device's preferred relay if the peer's isn't an official one)

Traffic to non-members is unaffected by the room relay. After leaving the room, the client stops using the room relay.

---

## Game Discovery

Since 3.1.6, game discovery data is no longer distributed by relays: it is sent to each member separately inside the encrypted tunnel, along the path selection above (possibly through the room relay). So game discovery keeps working while the room relay is in fallback.

See: [Room Mode](/en/connect/spaces/room_space#game-discovery)

---

## Related

- [Room Mode](/en/connect/spaces/room_space)
- [Self-Hosted Relay](/en/connect/selfhost/relay)
- [Connections](/en/connect/basics/connections)
