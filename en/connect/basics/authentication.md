---
title: "Authentication"
description: "This chapter covers how access authentication works in MSST-Net, and the difference between authenticated and unauthenticated users."
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

## Identity Types

From the coordinator's point of view, every device connected to MSST-Net is in one of the following states:

| State | Credential source | Available access modes |
|---|---|---|
| **Authenticated user** | MSST Identity and Access System (MSST-IAS) account | Network Mode + Room Mode |
| **Guest (unauthenticated)** | Temporary guest credential issued automatically by the coordinator | Room Mode only |

Access authentication is **optional**: unauthenticated devices automatically join as guests and can create or join rooms right away.

---

## Completing Access Authentication

MSST-Net authenticates through the MSST Identity and Access System (MSST-IAS)'s **device authorization flow**, so you never need to enter your username or password in the client.

1. Open the client controller and click **Authenticate** on the home page
2. Click **Start Authentication**
3. The controller opens the authentication page in your browser and shows a **verification code**
   (if the browser doesn't open automatically, copy the authentication link shown in the controller and open it manually)
4. On the authentication page, log in to your MSST Identity and Access System (MSST-IAS) account and confirm the verification code
5. You're done once the controller shows **Authentication successful!**

After authentication, the controller shows the **authenticated user** and the credential's expiry. To switch accounts, click **Re-authenticate**; the new credential replaces the current one.

> If you don't have an account yet, fill in the **MSST-Net Access Registration Form**. Once approved, an administrator will send the account details to the contact you provided.

### How Credentials Are Stored

- Authentication credentials are stored only in the client core's data directory (`identity.json`)
- Access tokens are never sent to the controller or written to logs
- The core refreshes credentials automatically before they expire

---

## What Changes After Authentication

After authentication:

- The **user ID** becomes a fixed ID derived from your account; every device logged in to the same account shares the same user ID
- The **user mnemonic** and **user display name** come from your account information and are managed by the coordinator; changing them locally has no effect
- Device mnemonics and device display names can still be changed freely locally
- The device becomes visible to other authenticated devices on the network and can use Network Mode
- You can apply for a custom `.msst.net` namespace

See: [Identifiers](/en/connect/basics/identifiers)

---

## Guest (Unauthenticated) Identity

When not authenticated, the core automatically requests a **guest credential** from the coordinator:

- Guest credentials are kept only in memory, are valid for 24 hours by default, and are renewed automatically before they expire
- Guest credentials become invalid when the coordinator restarts; the core automatically requests a new one
- A guest's user ID is derived from this device's key and is associated only with this device

### Limitations Without Authentication

When connected as a guest, the following limitations apply:

- **Only Room Mode is available**; you cannot join the Network
- The device is visible only to members of the same room
- You can only communicate with devices **currently in the same room** — this applies in both directions: authenticated devices cannot reach a guest device outside a room either
- You cannot apply for a custom domain

Rooms created by guests **no longer have a member limit** (3.0.x limited them to 5 people). Guests can also specify a room relay for rooms they create, including self-hosted relays.

---

## Credential Expiry

If the authentication credential expires and the refresh is also rejected (for example, the account has been disabled, or the refresh token expired after a long time offline):

- The core automatically falls back to a guest credential; **Room Mode is unaffected**
- The user ID temporarily reverts to the one derived from the device key, and the user mnemonic is cleared
- During this time the device is treated as unauthenticated and cannot use Network Mode
- The controller prompts you to re-authenticate

Once you complete access authentication again, the device immediately regains its authenticated identity.

> Refresh failures caused by network outages or server errors are not treated as credential expiry; the core keeps using the existing credential once the network recovers.

---

## Related

- [Identifiers](/en/connect/basics/identifiers)
- [Network Mode](/en/connect/spaces/network_space)
- [Room Mode](/en/connect/spaces/room_space)
