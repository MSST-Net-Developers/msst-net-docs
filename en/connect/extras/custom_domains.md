---
title: "Custom Domains"
description: "This chapter covers how to apply for your own namespace under .msst.net and manage its DNS records."
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

## What Are Custom Domains

Besides the automatically assigned ezPlay hostname, authenticated users can apply for a **namespace**, which gives them control over domains under `*.<namespace>.msst.net`.

For example, once the namespace `abjust` is approved, you can add:

```text
mc.abjust.msst.net     → CNAME → archlinux.abjust.ezplay.msst.net
```

Your friends can then use `mc.abjust.msst.net` to reach your Minecraft server; even if you switch devices, you only need to update this one record.

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
- It cannot start or end with a hyphen
- It cannot contain dots (single-level names only)

### Limits

Each person can hold at most **5** namespaces at a time (pending and approved combined).

---

## Managing DNS Records

Once a namespace is approved, you can add records under it freely, **with no further review**.

Click **Manage Records** on the namespace card, then **Add Record**:

| Field | Description |
|---|---|
| Subdomain | Such as `mc`, `api` or `www`; leave empty for the namespace itself (`@`) |
| Type | `CNAME`, `TXT` or `SRV` |
| Content | See the table below |
| TTL | 60–86400 seconds, default 300 seconds |

### Record Types

| Type | Content | Use |
|---|---|---|
| CNAME | Target hostname, usually an ezPlay hostname (such as `device.user.ezplay.msst.net`) | Give a device a memorable alias |
| TXT | Arbitrary text | Verification, notes, etc. |
| SRV | Priority, weight, port, target host (ezPlay hostname) | Declare the host and port a service runs on |

Records can be **edited** or **deleted** at any time.

---

## Resolution on MSST-Net Devices

On devices connected to MSST-Net, all queries for `*.msst.net` are handled by the client core's local resolver (see [MSST-Net ezPlay](/en/connect/extras/ezplay#local-name-resolution)):

| Query type | Result |
|---|---|
| A / AAAA | A CNAME pointing to an ezPlay hostname is expanded directly to the target device's virtual IP (only one level is followed) |
| TXT / SRV | Returns the matching records in the namespace; if there's only a CNAME, that CNAME is returned and the system resolver follows it |

> Resolving TXT / SRV records requires a recent version of the client core; older cores only return A / AAAA results.

### SRV Record Example

Minecraft Java Edition looks up the SRV record `_minecraft._tcp.<domain>`. After adding the following record, friends can connect by entering `abjust.msst.net`, without specifying a port:

| Field | Value |
|---|---|
| Subdomain | `_minecraft._tcp` |
| Type | SRV |
| Priority / weight | `0` / `5` |
| Port | `25565` |
| Target host | `archlinux.abjust.ezplay.msst.net` |

::: warning Programs that make their own DNS queries
The local resolver takes over `*.msst.net` through the system's split-DNS rules. Some programs (such as Minecraft Java Edition's SRV lookup) bypass the system resolver API and query the system's primary DNS server directly, so on **Windows and macOS** they may fail to find SRV records. If that happens, use a CNAME record instead and include the port in the address (such as `mc.abjust.msst.net:25565`). Linux and Android are not affected.
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
