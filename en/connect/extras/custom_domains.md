---
title: "Custom Domains"
description: "This chapter covers how to apply for your own namespace under .net.msst2031.cn and manage its DNS records."
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

## What Are Custom Domains

Besides the automatically assigned ezPlay hostname, authenticated users can apply for a **namespace**, which gives them control over domains under `*.<namespace>.net.msst2031.cn`.

For example, once the namespace `abjust` is approved, you can add:

```text
mc.abjust.net.msst2031.cn     → CNAME → archlinux.abjust.ezplay.net.msst2031.cn
```

Your friends can then use `mc.abjust.net.msst2031.cn` to reach your Minecraft server; even if you switch devices, you only need to update this one record.

Custom domains are managed on the controller's **Domains** page.

> Custom domains **require access authentication first**.

---

## Applying for a Namespace

1. Open the controller's **Domains** page
2. Click **Apply for Namespace**
3. Enter the namespace name (such as `abjust` or `my-team`)
4. Fill in the **Reason** (required), explaining what it's for and why you need it
5. Click **Submit**

After submission, the status is **Pending**; once an administrator reviews it, it becomes **Approved** or **Rejected** (with a reason).

### Naming Rules

- Only lowercase letters, digits and hyphens (`-`) are allowed
- It cannot start or end with a hyphen, and is at most 63 characters long
- It cannot contain dots (single-level names only)
- It cannot be a reserved name (see below)

### Reserved Names

Two namespaces under `net.msst2031.cn` are used by MSST-Net itself:

| Namespace | Use |
|---|---|
| `*.srv.net.msst2031.cn` | Official services, maintained by administrators |
| `*.ezplay.net.msst2031.cn` | Devices' [ezPlay hostnames](/en/connect/extras/ezplay) |

These names can't be applied for: `srv`, `ezplay`, `serv`, `msst`, `msst-net`, `official`, `admin`, `coord`, `relay`, `www`, `api`, `ns`, `dns`.

### Limits

Each person can hold at most **5** namespaces at a time (pending and approved combined), and each namespace at most **100** records.

---

## Managing DNS Records

Once a namespace is approved, you can add records under it freely, **with no further review**.

Click **Manage Records** on the namespace card, then **Add Record**:

| Field | Description |
|---|---|
| Subdomain | Such as `mc`, `api`, `www` or `_minecraft._tcp`; leave empty for the namespace itself (`@`). Each label may contain only lowercase letters, digits, hyphens and underscores |
| Type | `CNAME`, `TXT` or `SRV` |
| Content | See the table below |
| TTL | 60–86400 seconds, default 300 seconds |

### Record Types

| Type | Content | Use |
|---|---|---|
| CNAME | Target hostname, usually an ezPlay hostname (such as `device.user.ezplay.net.msst2031.cn`) | Give a device a memorable alias |
| TXT | Arbitrary text | Verification, notes, etc. |
| SRV | Priority, weight, port, target host (ezPlay hostname) | Declare the host and port a service runs on |

Records can be **edited** or **deleted** at any time.

### Only Your Own Namespace

The coordinator makes sure each user can only change records under their own namespace:

- A record always lives at `<subdomain>.<your namespace>.net.msst2031.cn`; whatever the subdomain, it can't land outside the namespace. For example, adding the subdomain `www.bob` under `abjust` gives `www.bob.abjust.net.msst2031.cn`, not `www` in the `bob` namespace
- Adding or editing a record checks that the namespace is yours and approved; official services, ezPlay hostnames and other users' records can't be changed
- Only CNAME, TXT and SRV records can be added, not NS or other records that would delegate the name
- A CNAME only gives your own name an alias; it doesn't change what the target resolves to

---

## Resolution on MSST-Net Devices

On devices connected to MSST-Net, all queries for `*.net.msst2031.cn` are handled by the client core's local resolver (see [MSST-Net ezPlay](/en/connect/extras/ezplay#local-name-resolution)):

| Query type | Result |
|---|---|
| A / AAAA | A CNAME pointing to an ezPlay hostname is expanded directly to the target device's virtual IP (only one level is followed) |
| TXT / SRV | Returns the matching records in the namespace; if there's only a CNAME, that CNAME is returned and the system resolver follows it |

> Resolving TXT / SRV records requires a recent version of the client core; older cores only return A / AAAA results.

### SRV Record Example

Minecraft Java Edition looks up the SRV record `_minecraft._tcp.<domain>`. After adding the following record, friends can connect by entering `abjust.net.msst2031.cn`, without specifying a port:

| Field | Value |
|---|---|
| Subdomain | `_minecraft._tcp` |
| Type | SRV |
| Priority / weight | `0` / `5` |
| Port | `25565` |
| Target host | `archlinux.abjust.ezplay.net.msst2031.cn` |

::: warning Programs that make their own DNS queries
The local resolver takes over `*.net.msst2031.cn` through the system's split-DNS rules. Some programs (such as Minecraft Java Edition's SRV lookup) bypass the system resolver API and query the system's primary DNS server directly, so on **Windows and macOS** they may fail to find SRV records. If that happens, use a CNAME record instead and include the port in the address (such as `mc.abjust.net.msst2031.cn:25565`). Linux and Android are not affected.
:::

---

## Notes

- Like ezPlay hostnames, custom domains are resolved by the client core's local DNS and are used within the MSST-Net virtual network
- Being able to resolve a device doesn't mean you're allowed to access it; access is still subject to the peer's firewall rules
- Administrators can suspend namespaces or records that violate the rules; suspended records stop working

---

## Related

- [MSST-Net ezPlay](/en/connect/extras/ezplay)
- [Authentication](/en/connect/basics/authentication)
