---
title: "客户端配置"
description: "本章主要讲述 MSST-Net 客户端核心的配置文件、命令行参数与数据目录。"
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

## 概述

客户端核心的设置分为两类：

| 类型 | 保存位置 | 修改方式 |
|---|---|---|
| 启动配置 | `core.toml` | 编辑文件、命令行参数或环境变量，重启核心后生效 |
| 网络设置 | 数据目录中的 `net_settings.json` | 在控制器的 **设置 → 诊断与调试 → 高级选项** 中修改 |

大多数用户无需修改启动配置。

---

## 配置文件 `core.toml`

配置文件在首次启动时自动创建，默认位置：

| 平台 | 路径 |
|---|---|
| Linux | `~/.config/msst-net/core.toml` |
| macOS | `~/Library/Application Support/msst-net/core.toml` |
| Windows | `%APPDATA%\msst-net\core.toml` |

> 以 root 身份运行（如作为系统服务）时，`~` 指 root 用户的主目录。

可用的配置项：

| 配置项 | 默认值 | 说明 |
|---|---|---|
| `coordinator_url` | `https://coord.msst-net.msst2031.cn` | 协调服务器地址 |
| `udp_port` | `21031` | 数据通道 UDP 端口 |
| `tun_name` | `msst0` | 虚拟网卡名称 |
| `tun_mtu` | `1280` | 虚拟网卡 MTU（网络设置中的 MTU 优先） |
| `metrics_port` | `9100` | Prometheus 指标端口 |
| `ipc_socket` | 自动 | IPC 套接字路径 |
| `log_level` | `info` | 日志级别：`trace` / `debug` / `info` / `warn` / `error` |
| `data_dir` | 自动 | 数据目录（见下文） |
| `preferred_relay` | 无 | 偏好中转地址（网络设置中的偏好中转优先） |

示例：

```toml
coordinator_url = "https://coord.msst-net.msst2031.cn"
udp_port = 21031
tun_name = "msst0"
tun_mtu = 1280
log_level = "info"
```

---

## 命令行参数

```text
msst-net-core [OPTIONS]

  -c, --config <PATH>        配置文件路径
      --coordinator <URL>    协调服务器地址
      --udp-port <PORT>      数据通道 UDP 端口
      --metrics-port <PORT>  Prometheus 指标端口
  -l, --log-level <LEVEL>    日志级别
  -f, --foreground           前台运行
  -d, --daemon               后台运行
  -h, --help                 显示帮助
  -V, --version              显示版本
```

命令行参数会覆盖配置文件中的同名设置。

---

## 环境变量

| 变量 | 说明 |
|---|---|
| `MSST_COORD_URL` | 协调服务器地址（优先于配置文件和命令行） |
| `MSST_UDP_PORT` | 数据通道 UDP 端口 |
| `MSST_METRICS_PORT` | Prometheus 指标端口 |
| `MSST_IPC_SOCKET` | IPC 套接字路径 |
| `RUST_LOG` | 日志过滤规则（优先于日志级别设置） |

---

## 网络设置

以下设置保存在数据目录的 `net_settings.json` 中，建议通过控制器修改：

| 设置 | 默认值 | 说明 |
|---|---|---|
| 禁用 P2P 直连 | 关闭 | 始终经中转转发 |
| 锁定当前路径 | 关闭 | 冻结所有对端的路径 |
| 中转服务器偏好 | 自动选择 | 指定一台**官方**中转，重新连接协调服务器后生效 |
| MTU | 自动（1280） | 1280–1500，重启核心后生效 |
| 保活间隔 | 25 秒 | 5–30 秒，同时作用于中转与直连 |
| DNS 配置模式（仅 Linux） | 优先使用 DNS 分流 | 见 [《MSST-Net ezPlay》](/connect/extras/ezplay#本机域名解析) |
| 绕过其他 VPN 的全局隧道（仅 Linux） | 开启 | MSST-Net 自身的流量（对端、中转、协调服务器）走物理网络，不经 Tailscale 出口节点等其他 VPN；只能经其他 VPN 访问中转或协调服务器时请关闭。立即生效 |
| 阻止其他 VPN 经 MSST-Net 传输（仅 Linux） | 开启 | Tailscale 等会把 MSST-Net 地址当作直连路径，形成隧道套隧道；开启后它们改走自己的其他路径。立即生效 |

仅 Linux 的选项在移动版控制器中不显示。

`core.toml` 中的 `preferred_relay` 同样只接受官方中转；不在官方中转列表中的地址会被忽略，改为自动选择。

---

## 数据目录

数据目录保存设备身份、密钥、规则等持久数据。默认位置：

| 平台 | 路径 |
|---|---|
| Linux | `~/.local/share/msst-net/` |
| macOS | `~/Library/Application Support/msst-net/` |
| Windows | `%APPDATA%\msst-net\` |
| Android | 应用私有目录 |

### 从 3.0.x 升级

若未显式设置 `data_dir`，且 3.0.x 的数据目录中已有 `identity.json`，核心会继续使用旧目录，以保留设备 ID、用户 ID 与虚拟 IP：

- 普通部署：`~/MSST-Net/`
- 容器部署（`CORE_MODE=container`）：`/var/lib/msst/`

首次启动 3.1 时，若 3.0.x 的 `config.yaml` 中设置了自定义协调服务器地址，也会自动写入新的 `core.toml`。

### 目录内容

| 文件 | 说明 |
|---|---|
| `private.key` | 设备私钥（**切勿泄露**） |
| `identity.json` | 用户 / 设备 ID、助记符、显示名称、ezPlay 主机名、认证凭据 |
| `firewall_rules.json` | 防火墙规则 |
| `permission_groups.json` | 权限组 |
| `ping_settings.json` | Ping 开关 |
| `net_settings.json` | 网络设置 |
| `contacts.json` | 近期联系过的设备（用于交互式授权） |
| `peer_cache.json` | 节点信息缓存 |

> 设备 ID 由 `private.key` 推导。若 `identity.json` 中的设备 ID 与私钥不符，核心会按私钥重新推导设备 ID。

---

## 相关内容

- [《配置系统服务》](/connect/install/service)
- [《诊断工具》](/connect/troubleshoot/diagnostics)
