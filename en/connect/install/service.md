---
title: "System Service"
description: "This chapter covers how to configure the MSST-Net client core as a system service."
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

## What Is a System Service

A system service is a mechanism for running programs in the background.

Once the **MSST-Net client core** is configured as a system service, it keeps running in the background and can start automatically at boot.

---

## Why a System Service Is Recommended

We recommend running the client core as a system service mainly because it:

- Starts automatically at boot
- Keeps running in the background regardless of whether the controller is open
- Improves stability
- Supports automatic recovery

We recommend it for any device that stays connected to MSST-Net long-term.

The client core needs to create a virtual network adapter and configure routes and system DNS, so it should run with **administrator / root privileges**.

> In the examples below, the client core executable is written as `msst-net-core`. File names in release packages may carry a platform suffix (usually prefixed with `msst-net-client-core`); replace it with your actual file name and install path.

---

## Windows

If you used the client installer, the system service is usually configured automatically.

To configure it manually, run the following in an **administrator** terminal (replace the path with your actual install location; the space after `=` is required):

```powershell
sc.exe create msst-net binPath= "C:\Program Files\MSST-Net\msst-net-core.exe" start= auto
sc.exe start msst-net
```

- The service name must be `msst-net`
- Make sure `wintun.dll` is in the same directory as the client core
- If you double-click the client core directly, it runs in console foreground mode (press Ctrl+C to stop), which is handy for debugging

When running under the Local System account, the configuration and data directory is `C:\Windows\System32\config\systemprofile\AppData\Roaming\msst-net\`.

To stop and remove the service:

```powershell
sc.exe stop msst-net
sc.exe delete msst-net
```

---

## Linux (systemd)

On Linux, we recommend managing the client core with **systemd**.

### Create the Service File

Service file path:

```text
/etc/systemd/system/msst-net.service
```

Example service file (adjust to your actual install path):

```ini
[Unit]
Description=MSST-Net Client Core
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
ExecStart=/usr/local/bin/msst-net-core --foreground
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

> When running as root, the IPC socket is at `/run/msst-net/ipc.sock`, and the controller can find it automatically.
>
> Running as a regular user is not recommended: system services running as a regular user have no `XDG_RUNTIME_DIR`, so the IPC socket ends up under `/tmp/msst-net-<uid>/`, where the controller won't find it by default; system DNS configuration also requires root.

### Grant Your Everyday Account Admin Permissions

When the service runs as root, desktop users only have **viewer** permissions by default. Add your everyday account to the `msst-net` group to manage the core from the controller:

```bash
sudo groupadd -f msst-net
sudo usermod -aG msst-net $USER
```

This takes effect after you log in again; there is no need to restart the core.

See: [Controller](/en/connect/install/controller#connecting-to-the-client-core)

### Reload the systemd Configuration

```bash
sudo systemctl daemon-reload
```

### Enable the Service (Start at Boot)

```bash
sudo systemctl enable msst-net
```

### Start the Service

```bash
sudo systemctl start msst-net
```

### Check Status

```bash
sudo systemctl status msst-net
```

### View Logs

```bash
sudo journalctl -u msst-net -f
```

---

## macOS (launchd)

On macOS, we recommend managing the client core with launchd. Because it needs root privileges, configure it as a system-wide daemon (LaunchDaemon).

### Create the Configuration File

Place the configuration file at:

```text
/Library/LaunchDaemons/cn.msst-net.client-core.plist
```

Example configuration file (adjust to your actual install path):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>cn.msst-net.client-core</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/msst-net-core</string>
        <string>--foreground</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```

The configuration file must be owned by root:

```bash
sudo chown root:wheel /Library/LaunchDaemons/cn.msst-net.client-core.plist
sudo chmod 644 /Library/LaunchDaemons/cn.msst-net.client-core.plist
```

### Load the Service

```bash
sudo launchctl load /Library/LaunchDaemons/cn.msst-net.client-core.plist
```

### Unload the Service

```bash
sudo launchctl unload /Library/LaunchDaemons/cn.msst-net.client-core.plist
```

When running as root, the IPC socket is at `/var/run/msst-net/ipc.sock`. Here too you can add your everyday account to the `msst-net` group to get admin permissions.

---

## Managing the Service

### Start

Starts the client core service.

### Stop

Stops the client core service. On stop, the core removes the virtual network adapter and the system DNS configuration.

### Restart

Restarts the client core service. Changes to `core.toml` or the MTU only take effect after a restart.

### Status

Shows the current state of the service. You can also check the connection between the core and the coordinator in the controller under **Settings → Diagnostics & Debugging**.

### Logs

We recommend checking the logs regularly to help with troubleshooting. You can also **View Logs** directly in the controller.

---

## Notes

Configuring the client controller as a system service is generally not recommended.

If you want the controller to open automatically at boot, use your system's built-in startup feature.

---

## Next Steps

After configuring the system service, we recommend:

- Completing access authentication
- Choosing an access mode

See:

- [Client Configuration](/en/connect/install/configuration)
- [Getting Started](/en/connect/start)
