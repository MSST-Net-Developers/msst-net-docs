---
title: "MSST-Net ezPlay"
description: "本章主要讲述 MSST-Net ezPlay 主机名。"
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

## 什么是 ezPlay 主机名

**ezPlay 主机名**是 MSST-Net 为每个接入设备分配的人类可读主机名，用于在虚拟网络中替代不易记忆的 IP 地址。

拥有 ezPlay 主机名后，你可以用类似 `archlinux.abjust.ezplay.net.msst2031.cn` 的格式直接访问网络中的设备，就像在浏览器中输入域名一样。

---

## 主机名格式

ezPlay 主机名的格式为：

```text
{设备助记符}.{用户助记符}.ezplay.net.msst2031.cn
```

例如：

```text
archlinux.abjust.ezplay.net.msst2031.cn
```

其中：

- `archlinux` 是设备助记符
- `abjust` 是用户助记符
- `.ezplay.net.msst2031.cn` 是固定后缀

若设备或用户尚未设置助记符，系统会使用对应的 ID 作为替代。

> 3.0.x 文档中的 `.ezplay` 短后缀已不再使用，请使用完整的 `.ezplay.net.msst2031.cn` 后缀。
>
> 3.1.6 及以前的后缀是 `.ezplay.msst.net`。由于 `msst.net` 并不归 MSST 持有，3.1.7 起改为 `.ezplay.net.msst2031.cn`，旧后缀**不再解析**。如果在游戏、脚本或书签里写过旧主机名，请改成新后缀。

---

## 主机名的分配

ezPlay 主机名由协调服务器分配。

客户端在首次连接协调服务器、或更新助记符后，协调服务器会根据提议的主机名进行唯一性检查：

- 若主机名未被占用，直接分配
- 若主机名已被其他设备占用，协调服务器会自动在末尾追加数字（如 `archlinux-1.abjust.ezplay.net.msst2031.cn`）

分配完成后，主机名会存储在设备本地，并在控制器首页展示，可以一键复制。

---

## 如何使用

### 访问其他设备

在同一 MSST-Net 网络中（已接入大内网或同一房间），可以直接在程序或命令行中使用 ezPlay 主机名：

```bash
ping archlinux.abjust.ezplay.net.msst2031.cn
ssh user@archlinux.abjust.ezplay.net.msst2031.cn
```

> `ping` 需要对端在防御页面中开启 Ping (ICMP)，详见 [《防火墙规则》](/connect/acl/rules#ping-icmp)。

### 在游戏中使用

在支持手动输入 IP 或主机名的游戏中，可以直接输入 ezPlay 主机名作为服务器地址，例如在 Minecraft 多人联机界面中输入：

```text
archlinux.abjust.ezplay.net.msst2031.cn:25565
```

在房间内，也可以在成员卡片上 **复制主机名**。

---

## 本机域名解析

客户端核心内置了一个 DNS 解析器，并只接管 `*.net.msst2031.cn` 域名的查询，其他域名仍由系统原有的 DNS 解析：

| 平台 | 接管方式 |
|---|---|
| Windows | NRPT 规则，将 `.net.msst2031.cn` 交给 `127.0.0.1:53` |
| macOS | 创建 `/etc/resolver/net.msst2031.cn`，指向 `127.0.0.1:21053` |
| Linux | 优先使用 systemd-resolved 为虚拟网卡配置分流 DNS；不可用时使用 iptables 拦截 DNS 查询 |
| Android | VPN 服务将 MSST-Net 的虚拟 DNS 设为系统 DNS |

这些名称**只能在运行客户端核心的设备上解析**，公网 DNS 中查不到，设备主机名也就不会对外暴露。升级到 3.1.7 时，核心会删除旧版本为 `msst.net` 留下的分流规则；在 Linux 的 systemd-resolved 模式下，MSST-Net 虚拟网卡的 DNSSEC 校验会被关闭（只影响本域名的查询）。

解析 `*.net.msst2031.cn` 时：

- 已知的对端设备直接在本地解析，无需联网
- 未知的名称再向协调服务器查询
- 解析结果为该设备的虚拟 IPv4 地址（`172.22.x.y`）和虚拟 IPv6 地址（`fd22:2222:2222:2222::xxxx:xxxx`）
- 成功结果缓存 30 秒，未找到的结果缓存 10 秒

### Linux DNS 配置模式

在控制器的 **设置 → 诊断与调试 → 高级选项 → DNS 配置模式** 中可以选择（命令行控制器：`msst-net-cli settings set dns-mode prefer-split|iptables-only`）：

| 模式 | 说明 |
|---|---|
| 优先使用 DNS 分流（默认） | 优先通过 systemd-resolved 配置，不可用时自动切换为 DNS 拦截 |
| 仅使用 DNS 拦截 | 仅使用 iptables 配置 DNS 拦截规则，跳过 systemd-resolved |

---

## 修改主机名

ezPlay 主机名依赖设备助记符和用户助记符。修改助记符后，主机名会随之更新。

设备助记符可以在控制器的 **设置** 页面修改。认证用户的用户助记符取自账号，无法在本地修改。

---

## 注意事项

- ezPlay 主机名仅在 MSST-Net 虚拟网络内有效，无法从公网直接解析
- 主机名不区分大小写（建议使用全小写）
- 更改助记符后，旧主机名可能被其他设备占用

---

## 相关内容

- [《自定义域名》](/connect/extras/custom_domains) — 在 `.net.msst2031.cn` 下注册自己的命名空间
- [《标识符》](/connect/basics/identifiers) — 了解助记符与 ID 体系
- [《连接机制》](/connect/basics/connections) — 了解虚拟 IP 地址的分配方式
