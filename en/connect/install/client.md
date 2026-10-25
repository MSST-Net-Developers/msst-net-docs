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

- Installs the client core and sets it up as a system service
- Installs the client controller
- Installs platform dependencies
- Initializes the runtime environment
- Creates the admin group and adds your account (Linux / macOS: `msst-net`; Windows: `MSST-Net Administrators`), so the controller has admin permissions
- Allows the core's UDP port in the system firewall (from 3.1.5; see [System Firewall](#system-firewall) below)
- Upgrades, repairs, rolls back and uninstalls

Download:

[Download the MSST-Net Client Installer](https://github.com/MSST-Net-Developers/msst-net-installer-31x/releases)

Run it as root on Linux / macOS, or as administrator on Windows; without arguments it starts an interactive wizard. You choose a controller during installation:

| Choice | Description |
|---|---|
| Desktop (`--controller desktop`) | Graphical interface, for desktop users |
| WebUI (`--controller webui`) | Runs as a service and is managed from a browser; on Linux it can also be deployed with Docker (`--docker`) |
| Command line (`--controller cli`) | Installs `msst-net-cli` for use in a terminal (since 3.1.4) |
| Core only (`--controller none`) | No controller |

With the command line choice, `msst-net-cli` is on the command path (`/usr/local/bin/msst-net-cli` on Linux / macOS; on Windows the installation's `bin` directory is added to the system `PATH`). On Linux the core can also run in Docker alone, with the command-line controller on the host (`--controller cli --docker`); then use `sudo msst-net-cli`.

> Controllers from 3.1.8 on need **installer 3.1.4 or newer**; older installers refuse to install them, so download the new installer first.

On Windows the installer adds **the user signed in at the desktop** to the admin group (from 3.1.5) — even when a standard user typed another administrator's password to elevate it. To add a different account, pass `--admin-user <username>`.

From 3.1.10 the desktop controller and the WebUI show a notice at the top when a newer version exists; download the latest installer as it suggests and choose **Upgrade**. See [Controller](/en/connect/install/controller#update-reminder).

### System Firewall

A system firewall drops UDP packets the peer sends first, so direct connections — especially LAN and IPv6 ones — can't be established and traffic stays on a relay. From 3.1.5 the installer therefore allows the core's inbound UDP port (`udp_port` in `core.toml`, 21031 by default) when it installs, upgrades, repairs or rolls back, and removes the rule when it uninstalls:

| Platform | Rule |
|---|---|
| Windows | Windows Firewall rule `MSST-Net-Core-UDP`: inbound, allow the UDP port, for the core program only, in all network profiles (domain, private, public) |
| Linux | Only while **firewalld** or **ufw** runs: firewalld gets a service `msst-net` added to the default zone; ufw gets the rule `allow 21031/udp` (comment `MSST-Net Core`) |
| macOS | The application firewall allows incoming connections for the core program |

The client core (from 3.1.10) also checks this rule every time it starts and recreates it when it is missing or stale (another port, or a new program path after an upgrade), so a manually installed core, or one installed with an older installer, is allowed too.

- Only the core's data-channel port is opened: it carries nothing but authenticated, encrypted data, and access to this device's services is still controlled by [firewall rules](/en/connect/acl/rules)
- Linux hosts with hand-written nftables / iptables rules are left alone; allow inbound UDP 21031 yourself
- firewalld only gets the default zone; if your network interface is in another zone, add the service `msst-net` there
- After changing `udp_port`, restart the core and the rule follows

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

- Client core: `msst-net-core-<os>-<arch>` (`.exe` on Windows)
- A client controller, any one of:
  - Desktop: `msst-net-controller-desktop-…` (`.deb` / `.rpm` / `.tar.gz` on Linux, `.msi` on Windows, `.dmg` on macOS)
  - WebUI: `msst-net-controller-webui-<os>-<arch>`
  - Command line: `msst-net-controller-cli-<os>-<arch>`

`<os>` is `linux`, `windows` or `macos`, and `<arch>` is `x86_64` or `aarch64`; Windows builds end in `.exe`. After downloading, you can rename them to `msst-net-webui` / `msst-net-cli` (the client installer installs them under these names). Up to 3.1.7, the WebUI file was named `msst-net-webui-<os>-<arch>`.

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

While firewalld or ufw runs, the core's UDP port is allowed automatically; with hand-written nftables / iptables rules, allow it yourself. See [System Firewall](#system-firewall) above.

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

## Upgrading to 3.1.10

- Fully interoperable with other 3.1 clients; nothing to do
- Rule editing, group-linked rules and name lookup need **both** the core and the controller on 3.1.10; with only the controller upgraded they aren't available and the interface is as in 3.1.9
- Rules created from a permission group with 3.1.9 or earlier aren't linked to it automatically; to make one follow the group, edit it and pick the group again
- We recommend also updating to **installer 3.1.5**: it allows the core's UDP port in the system firewall and, on Windows, adds the desktop user to the admin group (installer 3.1.4 can install 3.1.10 too; the core adds the firewall rule itself when it starts)
- On Windows, if your account is in `MSST-Net Administrators` but the controller still says read-only, upgrade the core and reopen the controller — no need to sign out
- See [Release Notes](/en/connect/changelog#_3-1-10)

---

## Upgrading to 3.1.9

- Nothing to do, and fully interoperable with other 3.1 clients; the fixes are all in the core, so upgrading only the core is enough (the IPC protocol is unchanged, so the 3.1.8 controller keeps working)
- The fixes take effect on **this device**: each member judges the room relay's availability on its own, and the relay recovery after a network switch happens on the device that switches
- See [Release Notes](/en/connect/changelog#_3-1-9)

---

## Upgrading to 3.1.8

- Nothing to do: fully interoperable with 3.1 clients up to 3.1.7
- The faster recovery after switching networks mostly takes effect on **the device that switches**, so upgrade devices that switch networks often (laptops, phones) first
- The **keepalive interval** now applies to relay registration only (labeled **Relay Keepalive Interval** in the controller), and direct paths are checked every second; if you set a long keepalive interval for direct paths before, there's nothing to adjust
- Installing the 3.1.8 controller with the client installer needs installer 3.1.4 or newer
- See [Release Notes](/en/connect/changelog#_3-1-8)

---

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
