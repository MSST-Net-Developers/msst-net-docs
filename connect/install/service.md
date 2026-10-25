---
title: "配置系统服务"
description: "本章主要讲述如何将 MSST-Net 客户端核心配置为系统服务。"
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

## 什么是系统服务

系统服务是一种后台运行机制。

将 **MSST-Net 客户端核心**配置为系统服务后，可以在后台持续运行，并支持开机自动启动。

---

## 为什么推荐配置系统服务

推荐将客户端核心配置为系统服务，主要原因如下：

- 开机自动运行
- 后台持续运行，不依赖控制器是否打开
- 提高运行稳定性
- 支持自动恢复

对于长期接入 MSST-Net 的设备，建议进行配置。

客户端核心需要创建虚拟网卡、配置路由和系统 DNS，因此应当以**管理员 / root 权限**运行。

> 下文示例中，客户端核心的可执行文件统一写作 `msst-net-core`。发布包中的文件名带有平台后缀（`msst-net-core-<系统>-<架构>`），请替换为实际的文件名与安装路径。使用客户端安装器时，系统服务会自动配置。

---

## Windows

如果使用客户端安装器，通常可以自动配置系统服务。

如需手动配置，请在**管理员**权限的终端中执行（路径请替换为实际安装位置，`=` 后的空格不可省略）：

```powershell
sc.exe create msst-net binPath= "C:\Program Files\MSST-Net\msst-net-core.exe" start= auto
sc.exe start msst-net
```

- 服务名必须为 `msst-net`
- 请确保 `wintun.dll` 与客户端核心位于同一目录
- 直接双击运行客户端核心时，它会以控制台前台模式运行（按 Ctrl+C 停止），便于调试

以本地系统账户运行时，配置与数据目录位于 `C:\Windows\System32\config\systemprofile\AppData\Roaming\msst-net\`。

以本地系统账户运行时，桌面登录用户默认只有**只读**权限。将日常账号加入本地组 `MSST-Net Administrators`（不存在时先创建），重新打开控制器即可获得管理权限：

```powershell
net localgroup "MSST-Net Administrators" /add
net localgroup "MSST-Net Administrators" <用户名> /add
```

核心（3.1.10 起）启动时会在 Windows 防火墙中添加规则 `MSST-Net-Core-UDP`，放行它的 UDP 端口，详见 [《安装客户端》](/connect/install/client#系统防火墙)。

停止与删除服务：

```powershell
sc.exe stop msst-net
sc.exe delete msst-net
```

---

## Linux（systemd）

Linux 平台推荐使用 **systemd** 管理客户端核心。

### 创建服务文件

服务文件路径：

```text
/etc/systemd/system/msst-net.service
```

示例服务文件内容（请根据实际安装路径修改）：

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

> 以 root 运行时，IPC 套接字位于 `/run/msst-net/ipc.sock`，控制器可以自动找到它。
>
> 不建议改用普通用户运行：普通用户的系统服务没有 `XDG_RUNTIME_DIR`，IPC 套接字会落在 `/tmp/msst-net-<uid>/` 下，控制器默认找不到；同时系统 DNS 配置也需要 root 权限。

### 授予日常账号管理权限

服务以 root 运行时，桌面登录用户默认只有**只读**权限。将日常账号加入 `msst-net` 用户组，即可通过控制器管理核心：

```bash
sudo groupadd -f msst-net
sudo usermod -aG msst-net $USER
```

重新打开控制器后生效，无需重新登录系统，也无需重启核心。

详见：[《控制器说明》](/connect/install/controller#连接客户端核心)

### 重新加载 systemd 配置

```bash
sudo systemctl daemon-reload
```

### 启用服务（开机自启）

```bash
sudo systemctl enable msst-net
```

### 启动服务

```bash
sudo systemctl start msst-net
```

### 查看状态

```bash
sudo systemctl status msst-net
```

### 查看日志

```bash
sudo journalctl -u msst-net -f
```

---

## macOS（launchd）

macOS 平台推荐使用 launchd 管理客户端核心。由于需要 root 权限，请配置为系统级守护进程（LaunchDaemon）。

### 创建配置文件

将配置文件放入：

```text
/Library/LaunchDaemons/cn.msst-net.client-core.plist
```

示例配置文件内容（请根据实际安装路径修改）：

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

配置文件需归 root 所有：

```bash
sudo chown root:wheel /Library/LaunchDaemons/cn.msst-net.client-core.plist
sudo chmod 644 /Library/LaunchDaemons/cn.msst-net.client-core.plist
```

### 加载服务

```bash
sudo launchctl load /Library/LaunchDaemons/cn.msst-net.client-core.plist
```

### 卸载服务

```bash
sudo launchctl unload /Library/LaunchDaemons/cn.msst-net.client-core.plist
```

以 root 运行时，IPC 套接字位于 `/var/run/msst-net/ipc.sock`。同样可以将日常账号加入 `msst-net` 用户组以获得管理权限。

---

## 服务管理

### 启动服务

启动客户端核心服务。

### 停止服务

停止客户端核心服务。停止时，核心会移除虚拟网卡和系统 DNS 配置。

### 重启服务

重新启动客户端核心服务。修改 `core.toml` 或 MTU 后需要重启才能生效。

### 查看状态

查看当前服务运行状态。也可以在控制器的 **设置 → 诊断与调试** 中查看核心与协调服务器的连接状态。

### 查看日志

建议定期查看运行日志，以便排查问题。控制器中也可以直接 **查看日志**；使用命令行控制器时运行 `msst-net-cli logs`。

---

## 注意事项

客户端控制器通常不建议配置为系统服务。

如需开机自动打开控制器，请使用系统自带的开机启动功能。

---

## 下一步

完成系统服务配置后，建议继续：

- 完成接入认证
- 选择接入方式

详见：

- [《客户端配置》](/connect/install/configuration)
- [《新手教程》](/connect/start)
