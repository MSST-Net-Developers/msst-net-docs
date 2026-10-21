---
title: "FAQ"
description: "This chapter covers frequently asked questions about MSST-Net."
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

## Installation and Startup

### After installing the client, the controller can't detect the core?

Check the following:

1. Make sure the client core is running
2. If you configured a system service, check its status:
   ```bash
   sudo systemctl status msst-net
   ```
3. On Linux / macOS, if the core runs as root, make sure your account has been added to the `msst-net` group (you need to log in again after adding it); otherwise the controller can only connect read-only, or is refused
4. If the core uses a non-default IPC path, set the same `MSST_IPC_PATH` environment variable for the controller
5. Check the core's logs for error messages

See: [Controller](/en/connect/install/controller#connecting-to-the-client-core)

---

### The controller shows "read-only" and I can't change any settings?

The client core only granted the current system user **viewer** permissions. Add the user to the `msst-net` group:

```bash
sudo groupadd -f msst-net
sudo usermod -aG msst-net $USER
```

After logging in again you'll have admin permissions; there's no need to restart the core.

---

### No device ID was generated after the client started?

The device ID is generated automatically on first start and saved in `identity.json` in the data directory (on Linux the default is `~/.local/share/msst-net/`; devices upgraded from 3.0.x keep using `~/MSST-Net/`).

If the file doesn't exist, the core creates it automatically at startup. If it still isn't generated, check whether the core has permission to write to that directory.

See: [Client Configuration](/en/connect/install/configuration#data-directory)

---

### Can 3.1 clients communicate with 3.0.x clients?

No. Starting with 3.1, all data between devices is encrypted with WireGuard, which is incompatible with 3.0.x. Make sure every device that needs to talk to each other is upgraded to 3.1.

When upgrading, the device ID, virtual IP and firewall rules are kept automatically.

---

## Connection Problems

### Why can't I connect to a peer device?

Check in this order:

1. **Make sure both devices are online**: check the peer device's online status in the controller
2. **Check identity restrictions**: if either side isn't authenticated, both must be in the same room to communicate
3. **Check the encrypted session**: under **Settings → Diagnostics & Debugging → Path View**, check whether the peer's encryption state is "Encrypted"
4. **Check firewall rules**: ask the peer to check under **Defense → Access Log** whether your access was denied

See: [Diagnostics](/en/connect/troubleshoot/diagnostics)

---

### Why isn't a direct connection established, so traffic always goes through the relay?

A direct connection requires:

- The peer's direct-connection candidate addresses have been obtained
- 5 consecutive probe replies are received from a candidate address
- The direct path's round-trip latency is no higher than the relay path's

If the network environment (such as strict NAT or symmetric NAT) can't be traversed, a direct connection may never be established and traffic will always be forwarded through a relay. This is normal and doesn't affect regular use.

After consecutive failed probes, the system gradually lengthens the probing interval (up to 10 minutes); the path view shows the number of failed rounds and when the next probe will happen.

Also, if **Disable P2P direct connections** is turned on, no direct connection will be established.

---

### What can I do about high latency?

1. Check the current path mode: if it's Direct, high latency is probably a problem with the network itself
2. If it's relay mode, pin a closer relay under **Settings → Diagnostics & Debugging → Advanced Options** (**Relay Preference**)
3. When room members are concentrated in one region, the room owner can specify a suitable **room relay** when creating the room
4. Check your local network quality and look for ISP or Wi-Fi problems

---

## Firewall and Authorization

### Why did an authorization request pop up when a peer connected?

When a device tries to access a port on this device and no firewall rule matches, the system triggers an **interactive authorization** request.

This is a normal security mechanism. You can choose:

- **Allow**: allow temporarily; expires after 10 minutes
- **Always Allow**: allow permanently; a rule is created automatically
- **Deny** / **Always Deny**: deny temporarily or permanently

See: [Interactive Authorization](/en/connect/acl/interactive_auth)

---

### The other side approved the authorization, so why did my first connection still fail?

While waiting for authorization, TCP connections are reset immediately so programs don't hang for a long time. Once the other side approves, just **connect again**.

UDP data, on the other hand, is buffered while waiting and delivered automatically once approved.

---

### Why didn't an authorization request pop up, and the peer's connection just failed?

When not in a room, interactive authorization is only triggered for devices from **specific sources**: your account's other devices, devices contacted within the last 7 days, and devices referenced in device-level rules. Connection attempts from other unknown devices are **silently dropped**.

In addition, no more prompts are shown when too many requests are pending at once, and the WebUI controller doesn't show authorization requests at all.

To allow an unknown device, create a firewall rule manually first, or get into the same room as the other side.

---

### Pinging a peer gets no response?

ICMP ping (the `ping` command) is denied by default.

To allow ping, ask the peer to turn on the **Ping (ICMP)** toggle on the controller's **Defense** page.

---

### I changed a permission group, but the rules didn't change?

This is expected. A permission group is expanded into its member list when a rule is created, so changing the group later doesn't change rules that already exist. Recreate the rules using the updated group.

See: [Permission Groups](/en/connect/acl/groups)

---

## Identifiers and Hostnames

### How do I change a device's display name?

On the controller's **Settings** page you can change:

- The device name (display name, shown to other members in a room)
- The device mnemonic (used for rule references and the ezPlay hostname)

When the mnemonic changes, the ezPlay hostname is updated accordingly.

---

### Can authenticated users change their user mnemonic?

Once you've completed access authentication, the user mnemonic and user display name come from the authenticated account and are managed by the coordinator; changing them locally **has no effect**.

---

### ezPlay hostname resolution fails?

Check the following:

1. Make sure you're using the full `.ezplay.msst.net` suffix (such as `archlinux.abjust.ezplay.msst.net`)
2. Make sure the client core is running (`*.msst.net` is resolved locally by the core)
3. Make sure the target device is online and on the same network as this device (the Network or a room)
4. On Linux, if the system doesn't use systemd-resolved, try changing the **DNS Configuration Mode** to "DNS interception only"

---

## Room Mode

### Creating or joining a room says "Already in a room"?

A device can only be in one room at a time. Leave the current room first, then create or join a new one.

---

### Is there a member limit for rooms created by unauthenticated users?

No. Since 3.1, no room has a member limit.

---

### The game's LAN multiplayer option can't find the room?

1. Make sure both devices are in the same MSST-Net room
2. LAN discovery is only supported on **desktop (Windows / Linux / macOS)**; Android is not supported
3. Make sure the game uses a protocol supported by discovery (Minecraft Java LAN broadcast, mDNS, etc.)
4. Under **Settings → Diagnostics & Debugging → Game Discovery**, check whether any discovery packets are being dropped
5. Some games may require entering an IP or ezPlay hostname manually instead of automatic discovery

---

### Is the virtual IP still valid after leaving a room?

Yes. A device's virtual IP is a fixed address deterministically derived from its device ID; it has nothing to do with whether the device is in a room and is always valid.

Leaving a room only stops LAN discovery and doesn't affect the virtual IP itself. However, unauthenticated users can no longer communicate with any device after leaving a room.

---

## Data and Privacy

### Where is device data stored?

Client data is stored by default in:

- **Linux**: `~/.local/share/msst-net/`
- **macOS**: `~/Library/Application Support/msst-net/`
- **Windows**: `%APPDATA%\msst-net\`
- **Devices upgraded from 3.0.x**: keep using `~/MSST-Net/` (`/var/lib/msst/` for container deployments)

This directory contains device identity information, keys, firewall rules, permission groups, network settings and more.

---

### Can the private key file be migrated?

Yes. Copy `private.key` and `identity.json` from the data directory to the new device's data directory and restart the core to restore the device identity (the device ID and virtual IP stay the same). To keep firewall rules, copy `firewall_rules.json` and `permission_groups.json` as well.

> **Note**: keep the private key file safe and never share it. A leaked private key lets others impersonate your device. Don't use the same private key on two devices at the same time.

---

### Can relays see my communications?

No. All data between devices is end-to-end encrypted with WireGuard. Relays (including self-hosted relays) can only see device IDs, public addresses and traffic timing, plus the content of game discovery.

See: [Connections](/en/connect/basics/connections#data-encryption)
