---
title: "Access Log"
description: "This chapter covers MSST-Net's access log, and how to adjust rules quickly from it."
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

## What Is the Access Log

The **access log** records every decision the firewall has recently made when other devices accessed this device.

From the access log you can see:

- Which device tried to access which service or port on this device, and when
- Whether the access was allowed, denied or silently denied
- Why that decision was made (which rule matched, or why no authorization prompt was shown)

The access log can be viewed in the controller under **Defense → Access Log** (command-line controller: `msst-net-cli access list`, and `access allow-once`, `allow`, `deny`, `revoke` add or remove rules based on an entry).

---

## What Is Recorded

Each access log entry contains:

| Field | Description |
|---|---|
| Source device | The device that initiated the access (shows the device name, or the device ID if unknown) |
| Time | When the access happened |
| Target | The service name accessed (if it's a known service) or protocol/port |
| Decision | Allowed, denied or silently denied |
| Reason | See the table below |

### Decision Reasons

| Reason | Description |
|---|---|
| Rule | A firewall rule matched (shows the rule's note, or the first 8 characters of the rule ID if it has no note) |
| Interactive authorization | No rule matched; an authorization request was sent to the user |
| Interactive authorization timed out | The authorization request wasn't handled within 60 seconds |
| Too many pending access requests (no prompt shown) | The per-source or global limit on pending requests was reached, so no further prompt was shown |
| No matching rule (default deny) | No rule matched, and the source doesn't qualify for interactive authorization |

---

## Merging and Capacity

- Multiple accesses from the same device to the same target with the same decision within 30 seconds are merged into one entry with a count (such as `×12`)
- The access log keeps at most the most recent **500** entries; older entries are removed beyond that
- The access log is kept in the client core's memory and is cleared when the core restarts
- You can click **Clear** to remove all entries manually

---

## Adjusting Rules from the Access Log

Each access log entry offers quick actions that create a device-level rule for that source device and protocol/port directly:

| Entry state | Available actions |
|---|---|
| Denied or silently denied | **Allow Once** (expires after 10 minutes), **Always Allow**, **Always Deny** |
| Allowed, but not by a permanent allow rule | **Always Allow** |
| Allowed by a permanent allow rule | **Revoke** (deletes that rule and immediately cuts the established connections it allowed) |

Rules can't be created manually on mobile, so the access log is one of the main ways to add rules there.

---

## Related

- [Firewall Rules](/en/connect/acl/rules)
- [Interactive Authorization](/en/connect/acl/interactive_auth)
