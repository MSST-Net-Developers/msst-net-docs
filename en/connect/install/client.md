---
title: "Installing the Client"
description: "This chapter covers how to install the MSST-Net client and its platform requirements."
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

## Client Components

The MSST-Net client consists of:

- **Client Core**: handles network connections and protocol processing; must run with administrator / root privileges.
- **Client Controller**: handles client configuration and management; runs with normal user privileges.

For how the two divide the work, see: [Architecture](/en/connect/basics/architecture)

Installation may differ between platforms.

---

## Installation Methods

MSST-Net can be installed in the following ways:

- Using the client installer (recommended)
- Manual installation

---

## Using the Client Installer (Recommended)

On desktop systems (Windows / Linux / macOS), we recommend the **MSST-Net Client Installer**.

The installer automatically:

- Installs the client core
- Installs the client controller
- Installs platform dependencies
- Initializes the runtime environment

Download:

[Download the MSST-Net Client Installer](https://github.com/MSST-Net-Developers/msst-net-installer-31x/releases)

---

## Manual Installation

If you prefer to install the client manually, download the client components:

[Download the MSST-Net Client Core](https://github.com/MSST-Net-Developers/msst-net-core-31x/releases)

[Download the MSST-Net Client Controller](https://github.com/MSST-Net-Developers/msst-net-controller-31x/releases)

---

## Desktop Installation

Desktop systems include:

- Windows
- Linux
- macOS

The following components are required:

- Client core (usually prefixed with `msst-net-client-core`)
- Client controller (usually prefixed with `msst-net-client-controller`)

For choosing a controller edition, see:

[Controller](/en/connect/install/controller)

---

## Mobile Installation

Mobile systems (Android) use the **mobile** controller.

The mobile controller has the client core built in, so no separate core component is needed. The first time you start MSST-Net, the system will ask for permission to set up a VPN connection; please allow it.

Only the controller needs to be installed.

For details on the controller, see:

[Controller](/en/connect/install/controller)

---

## Platform Notes

### Windows

When installing the client core manually on Windows, you also need **wintun**.

Place the `.dll` file provided by wintun in the same directory as the client core.

Download:

[Download wintun](https://www.wintun.net/)

---

### Linux

Linux usually needs no extra dependencies.

The client core requires root privileges (to create the virtual network adapter and configure routes and DNS). If the system uses systemd-resolved, the core configures split DNS for `*.net.msst2031.cn` through it; otherwise it intercepts DNS queries with iptables.

When running the core as root, add your everyday account to the `msst-net` group so the controller gets management permissions. See [Controller](/en/connect/install/controller#connecting-to-the-client-core).

To run it in the background, we recommend setting up a system service.

See:

[System Service](/en/connect/install/service)

---

### macOS

macOS usually needs no extra dependencies.

The client core requires root privileges. At runtime it creates `/etc/resolver/net.msst2031.cn` so that `*.net.msst2031.cn` domains are resolved by MSST-Net.

To run it in the background, we recommend setting up a system service.

See:

[System Service](/en/connect/install/service)

---

## Verifying the Installation

After installation, we recommend checking that:

- The client core starts normally
- The client controller opens normally
- The controller detects the client core
- A device ID has been generated (the controller's **Settings** page shows the device ID and user ID)
- In the controller's **Settings → Diagnostics & Debugging**, the coordinator shows as connected and the virtual network adapter shows as ready

If all of the above pass, the client is installed successfully.

---

## Upgrading from 3.0.x

- 3.1 clients and 3.0.x clients **cannot communicate with each other** (starting with 3.1, all data is encrypted with WireGuard). Make sure every device that needs to talk to each other has been upgraded
- The core automatically reuses the 3.0.x data directory, so device ID, user ID, virtual IP and firewall rules stay the same
- See [Client Configuration](/en/connect/install/configuration#upgrading-from-3-0-x)

## Upgrading to 3.1.7

- The internal domain suffix changes from `.msst.net` to `.net.msst2031.cn` (`msst.net` isn't held by MSST): ezPlay hostnames become `<device>.<user>.ezplay.net.msst2031.cn`, custom namespaces `<namespace>.net.msst2031.cn`
- The old suffix **no longer resolves**; old hostnames written into games, scripts or bookmarks must be changed to the new suffix by hand
- Once the coordinator is upgraded, clients running 3.1.6 or older can no longer resolve any MSST-Net hostname (virtual IPs are unaffected), so upgrade all devices in your network
- See [MSST-Net ezPlay](/en/connect/extras/ezplay) and [Custom Domains](/en/connect/extras/custom_domains)

---

## Upgrading to 3.1.6

- Game discovery is now sent to each room member through the encrypted tunnel, no longer distributed by relays, and UDP 21032 is no longer used
- There is **no game discovery** between 3.1.6 and devices running 3.1.5 or older (everything else still works); the room's member list marks members with an older version. Upgrade the devices that play together
- See [Room Mode](/en/connect/spaces/room_space#game-discovery)

---

## Next Steps

After installing the client, we recommend:

- Setting up a system service (optional)
- Completing access authentication

See:

- [System Service](/en/connect/install/service)
- [Authentication](/en/connect/basics/authentication)
- [Getting Started](/en/connect/start)
