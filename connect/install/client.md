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

- 安装客户端核心，并配置为系统服务
- 安装客户端控制器
- 安装平台依赖
- 初始化运行环境
- 创建管理员组并加入你的账号（Linux / macOS：`msst-net`；Windows：`MSST-Net Administrators`），使控制器拥有管理权限
- 在系统防火墙中放行核心的 UDP 端口（3.1.5 起，见下文 [系统防火墙](#系统防火墙)）
- 升级、修复、回滚与卸载

下载地址：

[下载 MSST-Net 客户端安装器](https://gitee.com/Abjust/msst-net-installer-31x/releases)

在 Linux / macOS 上以 root 运行，在 Windows 上以管理员身份运行；不带参数时进入交互式向导。安装时需要选择控制器：

| 选项 | 说明 |
|---|---|
| 桌面版（`--controller desktop`） | 图形界面，适合桌面用户 |
| WebUI（`--controller webui`） | 以服务运行，通过浏览器远程管理；在 Linux 上也可以用 Docker 部署（`--docker`） |
| 命令行（`--controller cli`） | 安装 `msst-net-cli`，在终端中使用（3.1.4 起） |
| 仅核心（`--controller none`） | 不安装控制器 |

选择命令行时，`msst-net-cli` 会出现在命令路径中（Linux / macOS 为 `/usr/local/bin/msst-net-cli`；Windows 上安装目录的 `bin` 会加入系统 `PATH`）。在 Linux 上也可以只用 Docker 运行核心、命令行控制器装在主机上（`--controller cli --docker`），这时需要用 `sudo msst-net-cli`。

> 3.1.8 及更新的控制器需要 **3.1.4 或更新的安装器**，旧版安装器会拒绝安装，请先下载新版安装器。

在 Windows 上，安装器会把**当前桌面登录的用户**加入管理员组（3.1.5 起）。即使普通用户在提权时输入了另一个管理员账号的密码，加入的也是你自己；如需加入其他账号，用 `--admin-user <用户名>` 指定。

3.1.10 起，桌面端控制器和 WebUI 发现新版本时会在顶部提示，请按提示下载最新的安装器，选择 **升级**，详见 [《控制器说明》](/connect/install/controller#更新提醒)。

### 系统防火墙

系统防火墙会丢弃对端主动发来的 UDP 数据包，导致直连（尤其是局域网直连和 IPv6 直连）无法建立，流量一直走中转。因此安装器（3.1.5 起）在安装、升级、修复、回滚时放行核心的入站 UDP 端口（`core.toml` 中的 `udp_port`，默认 `21031`），卸载时移除：

| 平台 | 规则 |
|---|---|
| Windows | Windows 防火墙规则 `MSST-Net-Core-UDP`：入站、允许 UDP 端口，仅限核心程序，适用于所有网络类型（域、专用、公用） |
| Linux | 只在 **firewalld** 或 **ufw** 运行时处理：firewalld 新建服务 `msst-net` 并加入默认区域；ufw 添加规则 `allow 21031/udp`（注释 `MSST-Net Core`） |
| macOS | 在应用防火墙中允许核心程序接收传入连接 |

客户端核心（3.1.10 起）每次启动时也会检查这条规则，缺失或过期（端口改变、升级后程序路径改变）时自动重建，因此手动安装、或用旧版安装器安装的核心也能放行。

- 放行的只是核心的数据通道端口：其上只有经过身份验证的加密数据，本机服务的访问仍由 [防火墙规则](/connect/acl/rules) 控制
- 使用自定义 nftables / iptables 规则的 Linux 主机不会被修改，请自行放行入站 UDP 21031
- firewalld 只添加到默认区域；联网网卡属于其他区域时，请把服务 `msst-net` 加到该区域
- 修改 `udp_port` 后重启核心即可，规则会随之更新

---

## 手动安装

如果您希望手动安装客户端，请下载客户端组件：

[下载 MSST-Net 客户端核心](https://gitee.com/Abjust/msst-net-core-31x/releases)

[下载 MSST-Net 客户端控制器](https://gitee.com/Abjust/msst-net-controller-31x/releases)

---

## 桌面端安装

桌面端系统包括：

- Windows
- Linux
- macOS

安装时需要以下组件：

- 客户端核心：`msst-net-core-<系统>-<架构>`（Windows 为 `.exe`）
- 客户端控制器，任选其一：
  - 桌面版：`msst-net-controller-desktop-…`（Linux 为 `.deb` / `.rpm` / `.tar.gz`，Windows 为 `.msi`，macOS 为 `.dmg`）
  - WebUI 版：`msst-net-controller-webui-<系统>-<架构>`
  - 命令行版：`msst-net-controller-cli-<系统>-<架构>`

其中 `<系统>` 为 `linux`、`windows` 或 `macos`，`<架构>` 为 `x86_64` 或 `aarch64`；Windows 版带 `.exe` 后缀。下载后可以改名为 `msst-net-webui` / `msst-net-cli`（客户端安装器也是这样安装的）。3.1.7 及以前的 WebUI 版文件名为 `msst-net-webui-<系统>-<架构>`。

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

客户端核心需要 root 权限（创建虚拟网卡、配置路由和 DNS）。若系统使用 systemd-resolved，核心会通过它为 `*.net.msst2031.cn` 配置分流 DNS；否则会使用 iptables 拦截 DNS 查询。

以 root 运行核心时，请将日常账号加入 `msst-net` 用户组，以便控制器获得管理权限，详见 [《控制器说明》](/connect/install/controller#连接客户端核心)。

系统运行 firewalld 或 ufw 时，核心的 UDP 端口会自动放行；使用自定义 nftables / iptables 规则时请自行放行，详见上文 [系统防火墙](#系统防火墙)。

如需后台运行，建议配置系统服务。

详见：

[《配置系统服务》](/connect/install/service)

---

### macOS

macOS 平台通常无需额外依赖。

客户端核心需要 root 权限，运行时会创建 `/etc/resolver/net.msst2031.cn`，使 `*.net.msst2031.cn` 域名由 MSST-Net 解析。

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

## 升级到 3.1.10

- 与其他 3.1 客户端完全互通，无需任何操作
- 规则编辑、权限组关联、名称识别需要核心和控制器**都是 3.1.10**；只升级控制器时，这些功能不可用，界面与 3.1.9 相同
- 3.1.9 及以前用权限组创建的规则不会自动关联权限组，如需随权限组更新，请编辑规则并重新选择该权限组
- 建议同时更新到 **3.1.5 的安装器**：它会在系统防火墙中放行核心的 UDP 端口，Windows 上把桌面登录用户加入管理员组（3.1.4 的安装器也能安装 3.1.10，防火墙规则由核心启动时补上）
- Windows 上，已加入 `MSST-Net Administrators` 但控制器仍提示只读的，升级核心后重新打开控制器即可，无需注销
- 详见 [《版本更新说明》](/connect/changelog#_3-1-10)

---

## 升级到 3.1.9

- 无需任何操作，与其他 3.1 客户端完全互通；修复都在核心中，只升级核心也可以（IPC 协议未变，3.1.8 的控制器可以继续使用）
- 修复的问题都在**本机**一侧生效：房间中转的可用性由每位成员各自判断，切换网络后的中转恢复发生在切换网络的设备上
- 详见 [《版本更新说明》](/connect/changelog#_3-1-9)

---

## 升级到 3.1.8

- 无需任何操作，与 3.1.7 及以前的 3.1 客户端完全互通
- 切换网络后的快速恢复主要在**切换网络的那台设备**上生效，请优先升级经常切换网络的设备（笔记本电脑、手机）
- **保活间隔** 现在只作用于中转登记（控制器中改名为 **中转保活间隔**），直连的存活探测固定为每秒一次；此前为直连设置过较长保活间隔的，无需再调整
- 使用客户端安装器安装 3.1.8 的控制器时，需要 3.1.4 或更新的安装器
- 详见 [《版本更新说明》](/connect/changelog#_3-1-8)

---

## 升级到 3.1.7

- 内部域名后缀由 `.msst.net` 改为 `.net.msst2031.cn`（`msst.net` 并不归 MSST 持有）：ezPlay 主机名变为 `<设备>.<用户>.ezplay.net.msst2031.cn`，自定义命名空间变为 `<命名空间>.net.msst2031.cn`
- 旧后缀**不再解析**；游戏、脚本或书签中写过的旧主机名需要手动改成新后缀
- 协调服务器升级后，3.1.6 及以前的客户端无法再解析任何 MSST-Net 主机名（虚拟 IP 不受影响），请让网络中的设备都升级
- 详见 [《MSST-Net ezPlay》](/connect/extras/ezplay)、[《自定义域名》](/connect/extras/custom_domains)

---

## 升级到 3.1.6

- 游戏发现改为经加密隧道逐个发给房间成员，不再经过中转服务器分发，也不再使用 UDP 21032
- 3.1.6 与 3.1.5 及以前的设备之间**没有游戏发现**（其余功能照常互通），房间成员列表中会标出版本过旧的成员；请让需要联机的设备都升级
- 详见 [《房间模式》](/connect/spaces/room_space#游戏发现)

---

## 下一步

完成客户端安装后，建议继续：

- 配置系统服务（可选）
- 完成接入认证

详见：

- [《配置系统服务》](/connect/install/service)
- [《接入认证》](/connect/basics/authentication)
- [《新手教程》](/connect/start)