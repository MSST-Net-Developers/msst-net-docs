---
title: "安装客户端"
description: "本章主要讲述 MSST-Net 客户端的安装方式与平台要求。"
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

## 客户端组成

MSST-Net 客户端由以下部分组成：

- **客户端核心（Core）**：负责网络连接与协议处理，需要以管理员 / root 权限运行。
- **客户端控制器（Controller）**：负责客户端配置与管理，以普通用户权限运行。

两者的分工请参考：[《系统架构》](/connect/basics/architecture)

不同平台的安装方式可能有所不同。

---

## 安装方式

MSST-Net 提供以下安装方式：

- 使用客户端安装器（推荐）
- 手动安装

---

## 使用客户端安装器（推荐）

对于桌面端系统（Windows / Linux / macOS），推荐使用 **MSST-Net 客户端安装器**。

客户端安装器可自动完成以下操作：

- 安装客户端核心
- 安装客户端控制器
- 安装平台依赖
- 初始化运行环境

下载地址：

[下载 MSST-Net 客户端安装器](https://github.com/MSST-Net-Developers/msst-net-installer-31x/releases)

---

## 手动安装

如果您希望手动安装客户端，请下载客户端组件：

[下载 MSST-Net 客户端核心](https://github.com/MSST-Net-Developers/msst-net-core-31x/releases)

[下载 MSST-Net 客户端控制器](https://github.com/MSST-Net-Developers/msst-net-controller-31x/releases)

---

## 桌面端安装

桌面端系统包括：

- Windows
- Linux
- macOS

安装时需要以下组件：

- 客户端核心（通常以 `msst-net-client-core` 开头）
- 客户端控制器（通常以 `msst-net-client-controller` 开头）

控制器版本选择请参考：

[《控制器说明》](/connect/install/controller)

---

## 移动端安装

移动端系统（Android）使用**移动版**控制器。

移动版控制器内置客户端核心，无需单独安装核心组件。首次启动 MSST-Net 时，系统会请求建立 VPN 连接的权限，请允许。

安装时仅需安装控制器。

控制器说明请参考：

[《控制器说明》](/connect/install/controller)

---

## 平台说明

### Windows

Windows 平台手动安装客户端核心时，需要额外安装 **wintun**。

请将 wintun 提供的 `.dll` 文件与客户端核心放置在同一目录。

下载地址：

[下载 wintun](https://www.wintun.net/)

---

### Linux

Linux 平台通常无需额外依赖。

客户端核心需要 root 权限（创建虚拟网卡、配置路由和 DNS）。若系统使用 systemd-resolved，核心会通过它为 `*.msst.net` 配置分流 DNS；否则会使用 iptables 拦截 DNS 查询。

以 root 运行核心时，请将日常账号加入 `msst-net` 用户组，以便控制器获得管理权限，详见 [《控制器说明》](/connect/install/controller#连接客户端核心)。

如需后台运行，建议配置系统服务。

详见：

[《配置系统服务》](/connect/install/service)

---

### macOS

macOS 平台通常无需额外依赖。

客户端核心需要 root 权限，运行时会创建 `/etc/resolver/msst.net`，使 `*.msst.net` 域名由 MSST-Net 解析。

如需后台运行，建议配置系统服务。

详见：

[《配置系统服务》](/connect/install/service)

---

## 安装验证

安装完成后，建议进行以下检查：

- 客户端核心是否能够正常启动
- 客户端控制器是否能够正常打开
- 控制器是否能够检测到客户端核心
- 是否成功生成设备 ID（控制器 **设置** 页面会显示设备 ID 与用户 ID）
- 控制器 **设置 → 诊断与调试** 中，协调服务器显示为已连接、虚拟网卡显示为已就绪

如果以上检查均通过，则表示客户端安装成功。

---

## 从 3.0.x 升级

- 3.1 客户端与 3.0.x 客户端**不能互通**（3.1 起所有数据均经 WireGuard 加密），请确保需要互相通信的设备都已升级
- 核心会自动沿用 3.0.x 的数据目录，设备 ID、用户 ID、虚拟 IP 和防火墙规则保持不变
- 详见 [《客户端配置》](/connect/install/configuration#从-3-0-x-升级)

---

## 下一步

完成客户端安装后，建议继续：

- 配置系统服务（可选）
- 完成接入认证

详见：

- [《配置系统服务》](/connect/install/service)
- [《接入认证》](/connect/basics/authentication)
- [《新手教程》](/connect/start)