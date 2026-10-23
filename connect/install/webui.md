---
title: "WebUI 远程管理"
description: "本章主要讲述如何部署 WebUI 版控制器，通过浏览器远程管理 MSST-Net 客户端。"
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

## 适用场景

WebUI 版控制器（`msst-net-webui`）适用于：

- 没有桌面环境的服务器
- 需要从另一台电脑远程查看、管理的设备

WebUI 运行在客户端核心所在的设备上，通过本机 IPC 连接核心，再以 HTTPS 向浏览器提供与桌面版相同的界面。

只在设备本机的终端（或经 SSH）管理、不需要浏览器访问时，也可以使用命令行控制器 `msst-net-cli`，它不需要访问密码，也不开放任何端口，详见 [《控制器说明》](/connect/install/controller#命令行版)。

---

## 首次启动

```bash
msst-net-webui
```

首次启动时需要设置**访问密码**（至少 6 位）。密码按以下顺序获取：

1. 环境变量 `PASSWORD_FILE` 指向的文件（默认 `/run/secrets/admin_password`）
2. 环境变量 `ADMIN_PASSWORD`
3. 都没有时，在终端中交互式输入并确认

密码以 Argon2 哈希的形式保存，之后启动不再询问。

启动后，在浏览器中访问：

```text
https://<设备地址>:18080
```

WebUI 每次启动都会生成新的自签名证书，浏览器首次访问时会提示证书不受信任，确认继续即可。

---

## 配置文件

WebUI 的配置保存在 `~/.config/msst-net-webui/` 目录下（Windows 为 `%APPDATA%\msst-net-webui\`，可用环境变量 `MSST_WEBUI_CONFIG_DIR` 指定其他目录，例如容器中的数据卷）：

| 文件 | 说明 |
|---|---|
| `config.toml` | 监听端口与 IP 白名单 |
| `passwd` | 访问密码的哈希 |

`config.toml` 默认内容：

```toml
port = 18080
allowed_cidrs = [
    "127.0.0.0/8",
    "::1/128",
    "10.0.0.0/8",
    "172.16.0.0/12",
    "192.168.0.0/16",
    "fc00::/7",
]
```

> `config.toml` 存在但无法解析时，WebUI 会拒绝启动，而不是回退到默认配置，以免意外放宽白名单。

> MSST-Net 自己的虚拟网段（`172.22.0.0/16`、`fd22:2222:2222:2222::/64`）默认**不允许**访问 WebUI，即使默认白名单中的 `172.16.0.0/12`、`fc00::/7` 覆盖了它们。若要允许从 MSST-Net 内的其他设备访问，需要在白名单中明确添加位于虚拟网段内的条目（例如某台设备的 `172.22.x.y/32`）。

### 环境变量

| 变量 | 说明 |
|---|---|
| `WEBUI_BIND` | 覆盖监听地址（默认 `0.0.0.0:<port>`） |
| `MSST_WEBUI_CONFIG_DIR` | 配置目录 |
| `MSST_IPC_PATH` | 指定客户端核心的 IPC 套接字路径 |
| `PASSWORD_FILE` / `ADMIN_PASSWORD` | 首次启动时的访问密码来源 |

---

## 安全机制

- **访问密码**：所有页面和接口都需要先登录；登录失败会被延迟响应，以减缓暴力尝试。登录会话有效期 24 小时，WebUI 重启后需要重新登录
- **IP 白名单**：每一个请求都会检查来源地址是否在 `allowed_cidrs` 内
- **HTTPS**：通信全程加密
- 拒绝跨站的 WebSocket 连接

IP 白名单也可以在 WebUI 的 **设置 → 远程管理** 中修改。

> 移除当前浏览器所用的地址段后，本浏览器将无法再访问 WebUI。

---

## 功能差异

与桌面版相比，WebUI 版：

- **不支持交互式授权**：访问请求需要在设备本机处理，否则会在 60 秒后超时
- 支持规则向导与权限组管理
- 支持房间、域名管理和诊断工具

---

## 只读模式

若运行 WebUI 的系统用户只获得客户端核心的**只读（viewer）**权限，WebUI 会显示只读提示，所有修改操作都不可用。

如何授予管理权限，请参考：[《控制器说明》](/connect/install/controller#连接客户端核心)

---

## 相关内容

- [《控制器说明》](/connect/install/controller)
- [《配置系统服务》](/connect/install/service)
