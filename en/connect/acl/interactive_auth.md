---
title: "Interactive Authorization"
description: "This chapter covers MSST-Net's interactive authorization mechanism."
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

## What Is Interactive Authorization

**Interactive authorization** is how MSST-Net handles traffic when no firewall rule matches.

When a device tries to access a port on this device and none of the existing rules match, the system doesn't reject it outright; instead, it sends an **access request** to the controller so the user can decide in real time whether to allow it.

Authorization decisions are evaluated and enforced entirely by the client core; the controller only displays requests and submits the user's decisions.

---

## When It Is Triggered

Interactive authorization is not triggered for all unknown traffic.

**While in a room**: any known device can trigger an authorization request when no rule matches.

**While not in a room (Network Mode)**: only connection attempts from the following devices trigger an authorization request:

| Case | Description |
|---|---|
| The current user's other devices | Devices under the same account |
| Recently contacted devices | Devices that shared a room with this device, or had traffic pass this device's firewall, within the last 7 days |
| Devices explicitly referenced in rules | The device ID appears in an enabled device-level rule |

Connection attempts that don't meet these conditions are **silently dropped** without any notification.

In addition, access from an unauthenticated device that isn't in the same room as this device is denied outright, again without triggering authorization.

### Limits

To prevent port scans and similar behavior from flooding you with prompts:

- Each source device can have at most **3** pending access requests at a time
- There can be at most **16** pending access requests globally at a time

Access beyond these limits is silently dropped and marked as "Too many pending access requests" in the access log.

---

## What an Access Request Shows

When interactive authorization is triggered, the controller shows:

- The source device's name and owning user (if known)
- The target protocol (TCP / UDP) and port
- The service name (if it's a known service, such as Minecraft or SSH)
- The time remaining to respond

Repeated access from the same device to the same protocol and port shares one access request. Multiple requests are queued for display.

---

## Authorization Decisions

In the controller, the user can make one of four decisions:

| Decision | Meaning |
|---|---|
| **Allow** | Allow temporarily: creates an allow rule that expires automatically after 10 minutes |
| **Always Allow** | Allow permanently: creates a permanent allow rule |
| **Deny** | Deny temporarily: creates a deny rule that expires automatically after 10 minutes |
| **Always Deny** | Deny permanently: creates a permanent deny rule |

Authorization decisions always create **device-level** rules that apply only to that source device and that protocol and port. Permanent rules can be managed on the **Defense** page.

After **Allow**, connections established within the 10 minutes **can go on** after the rule expires (a game already in progress isn't interrupted); new connections after the expiry need a new authorization. To cut them right away, delete or disable the rule on the **Defense** page.

---

## Data While Waiting

Until the user makes a decision:

- **TCP connections** are reset immediately (RST), so the other side's program quickly reports a connection failure; once authorized, the other side just needs to reconnect
- **UDP packets** are **temporarily buffered** (up to 32 packets or 256 KB per request); if the user allows, the buffered packets are delivered to this device immediately, and if the user denies, they are dropped

---

## Timeout

An access request that gets no response within **60 seconds** of being sent times out.

On timeout, buffered packets are dropped and the request's status in the access log is updated to **Interactive authorization timed out**. A timeout doesn't create any rule; the next access will trigger authorization again.

Timeouts are determined by the client core. The countdown shown in the controller comes from the core, so closing the controller doesn't affect the timer.

---

## Notifications on Each Platform

| Controller | How you're notified |
|---|---|
| Desktop | In-app dialog plus system notification (Linux uses native desktop notifications; Windows / macOS via the tray) |
| Mobile (Android) | In-app dialog plus system notification with action buttons; notifications arrive even when the controller UI isn't open |
| WebUI | Interactive authorization is **not supported**; requests must be handled on the device itself, otherwise they time out |
| Command line (`msst-net-cli`) | Interactive authorization is **not supported**, as with the WebUI; afterwards, `msst-net-cli access` can add rules from the access log |

---

## Relationship with Firewall Rules

Interactive authorization complements firewall rules; together they form a complete access control system:

- **Rules take precedence**: if a firewall rule matches, it is applied directly and interactive authorization isn't triggered
- **Triggered only without rules**: the interactive authorization flow only starts when no rule matches
- **Every authorization becomes a rule**: each decision generates a rule, so the same access won't trigger authorization again while the rule is valid

---

## Related

- [Firewall Rules](/en/connect/acl/rules) — configure access control rules proactively
- [Access Log](/en/connect/acl/access_log) — see the decision for every access
- [Permission Groups](/en/connect/acl/groups) — combine multiple devices into permission groups to simplify rule management
