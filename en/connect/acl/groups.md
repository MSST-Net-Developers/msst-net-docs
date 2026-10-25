---
title: "Permission Groups"
description: "This chapter covers MSST-Net's permission groups."
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

## What Is a Permission Group

A **permission group** is a reusable set of principals that combines multiple devices or users into one named group.

When creating a firewall rule, you can pick a permission group as the rule's source instead of entering every member one by one each time.

Permission groups can be created, edited and deleted in the controller under **Defense → Permission Groups** (command-line controller: `msst-net-cli groups`).

> Permission group management is not available on mobile (Android).

---

## What a Permission Group Contains

Each permission group has the following properties:

| Property | Description |
|---|---|
| Name | The group's name, such as `trusted-friends` |
| Type | Member type: **device group** or **user group** |
| Members | The list of device or user identifiers in the group |

All members of a permission group must be of the same type (all devices, or all users).

---

## Member Identifiers

When you enter an identifier in permission group management and click "Add", the client core recognizes the device or user and the member shows as "name (identifier)"; identifiers that can't be recognized can't be added. On save, members are recorded by their fixed IDs, so later mnemonic changes don't affect the group.

Once a group has members, its type (device group / user group) can no longer be switched.

Members can be specified by:

- **Device ID** (such as `device-a7f29b3e`)
- **User ID** (such as `user-1a2b3c4d`)
- **Device mnemonic / combined mnemonic** (such as `archlinux` or `archlinux.abjust`)
- **User mnemonic** (such as `abjust`)

For details on identifiers, see:

[Identifiers](/en/connect/basics/identifiers)

---

## Using Permission Groups in Rules

In the **Source** step of the rule wizard, choose **Use a named permission group**, then pick a device group or user group.

A rule created with a permission group (or edited to use one) is **linked** to it:

- When the group's members change, linked rules **follow automatically**; connections admitted under a rule are re-checked against the new members
- In the rule list, linked rules show as "Group 'name' · members…"; permission group management shows how many rules use each group
- A group can be emptied; its linked rules then match no source
- **A group still used by rules can't be deleted**: delete those rules first, or change their source to another group or to manual sources

::: warning Rules created with 3.1.9 or earlier
Before 3.1.10, a permission group was expanded into its member list when the rule was created, and the rule didn't record which group it came from. Those rules stay as they are after upgrading and don't follow the group. To link one, edit the rule and pick the group as its source again.
:::

---

## Why Use Permission Groups

Compared with filling in device IDs manually for every rule, permission groups:

- **Reduce repetition**: when the same set of devices needs several rules (for example, allowing different services separately), you only maintain one group and pick it in each rule
- **Prevent omissions**: the member list is maintained in one place, so you don't have to recall and type each member when creating a rule
- **Are self-explanatory**: a group's name can express the members' role or category (such as "trusted friends" or "home devices")

---

## Example

**Scenario**: allow several friends' devices to access the Minecraft and Terraria services on this device.

Steps:

1. Create a **device group** named `trusted-friends`
2. Add your friends' device IDs or mnemonics as members
3. Create a firewall rule: source is the permission group, target is Minecraft (Java Edition), action is allow
4. Create another rule: source is the same permission group, target is Terraria

When a new friend joins later, just add them to the permission group; both rules take effect for them automatically.

---

## Related

- [Firewall Rules](/en/connect/acl/rules) — use permission groups in rules
- [Identifiers](/en/connect/basics/identifiers) — how devices and users are identified
