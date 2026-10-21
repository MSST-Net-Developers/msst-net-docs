---
title: "自定义域名"
description: "本章主要讲述如何在 .msst.net 下申请自己的命名空间并管理 DNS 记录。"
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

## 什么是自定义域名

除了系统自动分配的 ezPlay 主机名，认证用户还可以申请一个**命名空间**，获得 `*.<命名空间>.msst.net` 下的域名管理权。

例如，申请命名空间 `abjust` 并获批后，可以添加：

```text
mc.abjust.msst.net     → CNAME → archlinux.abjust.ezplay.msst.net
```

之后好友就可以用 `mc.abjust.msst.net` 访问你的 Minecraft 服务器，即使你更换了设备，也只需修改这条记录。

自定义域名在控制器的 **域名** 页面中管理。

> 自定义域名功能**需要先完成接入认证**。

---

## 申请命名空间

1. 打开控制器的 **域名** 页面
2. 点击 **申请命名空间**
3. 填写命名空间名称（如 `abjust`、`my-team`）
4. 填写 **申请理由**（必填），说明用途和必要性
5. 点击 **提交申请**

申请提交后，状态为**待审核**；管理员审核后会变为**已审批**或**已拒绝**（并附拒绝原因）。

### 命名规则

- 只能包含小写字母、数字和连字符（`-`）
- 不能以连字符开头或结尾
- 不能包含点号（只能是单级名称）

### 数量限制

每人最多同时拥有 **5** 个命名空间（待审核与已审批合计）。

---

## 管理 DNS 记录

命名空间获批后，可以在其下自由添加记录，**无需再次审核**。

在命名空间卡片上点击 **管理记录**，然后 **添加记录**：

| 字段 | 说明 |
|---|---|
| 子域名 | 如 `mc`、`api`、`www`；留空表示命名空间本身（`@`） |
| 类型 | `CNAME`、`TXT` 或 `SRV` |
| 内容 | 见下表 |
| TTL | 60–86400 秒，默认 300 秒 |

### 记录类型

| 类型 | 内容 | 用途 |
|---|---|---|
| CNAME | 目标主机名，通常为 ezPlay 主机名（如 `device.user.ezplay.msst.net`） | 为设备起一个好记的别名 |
| TXT | 任意文本 | 验证、说明等 |
| SRV | 优先级、权重、端口、目标主机（ezPlay 主机名） | 声明服务所在的主机与端口 |

记录可以随时 **编辑** 或 **删除**。

---

## 在 MSST-Net 设备上的解析

接入 MSST-Net 的设备上，`*.msst.net` 的查询全部由客户端核心的本机解析器处理（详见 [《MSST-Net ezPlay》](/connect/extras/ezplay#本机域名解析)）：

| 查询类型 | 结果 |
|---|---|
| A / AAAA | 指向 ezPlay 主机名的 CNAME 会被直接展开为目标设备的虚拟 IP（只跟随一层） |
| TXT / SRV | 返回命名空间中对应的记录；只有 CNAME 时返回该 CNAME，由系统解析器继续跟随 |

> 解析 TXT / SRV 记录需要较新版本的客户端核心；旧版本核心只返回 A / AAAA 结果。

### SRV 记录示例

Minecraft Java 版会查询 `_minecraft._tcp.<域名>` 的 SRV 记录。添加如下记录后，好友输入 `abjust.msst.net` 即可连接，无需填写端口：

| 字段 | 值 |
|---|---|
| 子域名 | `_minecraft._tcp` |
| 类型 | SRV |
| 优先级 / 权重 | `0` / `5` |
| 端口 | `25565` |
| 目标主机 | `archlinux.abjust.ezplay.msst.net` |

::: warning 自行发起 DNS 查询的程序
本机解析器通过系统的 DNS 分流规则接管 `*.msst.net`。部分程序（例如 Minecraft Java 版的 SRV 查询）会绕过系统解析接口、直接向系统的主 DNS 服务器查询，在 **Windows 和 macOS** 上可能因此查不到 SRV 记录。遇到这种情况，请改用 CNAME 记录并在地址中写明端口（如 `mc.abjust.msst.net:25565`）。Linux 与 Android 上不受影响。
:::

---

## 注意事项

- 自定义域名与 ezPlay 主机名一样，通过客户端核心的本机 DNS 解析，在 MSST-Net 虚拟网络内使用
- 能解析到某台设备，不代表有权访问它；访问时仍受对端防火墙规则约束
- 管理员可以暂停违规的命名空间或记录，暂停后相应记录不再生效

---

## 相关内容

- [《MSST-Net ezPlay》](/connect/extras/ezplay)
- [《接入认证》](/connect/basics/authentication)
