---
title: "Getting Started"
description: "This chapter covers the basic steps for connecting to MSST-Net for the first time."
---

# {{ $frontmatter.title }}

{{ $frontmatter.description }}

## Quick Start

Connecting to MSST-Net for the first time works like this:

1. Install the client
2. Complete access authentication (optional)
3. Choose an access mode
4. Verify the connection

If this is your first time, we recommend following this chapter in order.

To learn what MSST-Net is made of first, read: [Architecture](/en/connect/basics/architecture)

---

## Step 1: Install the Client

Install the client first.

For installation instructions, see:

[Installation / Installing the Client](/en/connect/install/client)

If you want it to run automatically at boot:

[Installation / System Service](/en/connect/install/service)

If you need to choose a controller edition:

[Installation / Controller](/en/connect/install/controller)

---

## Step 2: Complete Access Authentication (Optional)

Access authentication is not required — **unauthenticated users automatically join as guests and can use Room Mode right away**.

However, you must authenticate to use Network Mode or to apply for a custom domain.

### If You Already Have an Account

If you already hold an MSST Identity and Access System (MSST-IAS) account:

Open the client controller, click **Authenticate** on the home page, and follow the prompts to complete authentication in your browser.

### If You Don't Have an Account Yet

If you don't have an account:

Fill in the **MSST-Net Access Registration Form**.

Once your application is approved, an administrator will send the account details to the contact you provided.

### Limitations Without Authentication

If you skip authentication, the following limitations apply:

- Only **Room Mode** is available; you cannot join the Network
- You can only communicate with members of the same room

Rooms created by unauthenticated users have **no member limit**.

See: [Authentication](/en/connect/basics/authentication)

---

## Step 3: Choose an Access Mode

Pick an access mode:

### Network Mode

Suited for long-term, stable access to a shared network (**authentication required**). Once authenticated, you join it automatically; no further action is needed.

See:

[Network Mode](/en/connect/spaces/network_space)

### Room Mode

Suited for ad-hoc networks or small-group collaboration (available to both authenticated and unauthenticated users). Click **Create Room** or **Join Room** on the controller home page.

See:

[Room Mode](/en/connect/spaces/room_space)

---

## Step 4: Verify the Connection

After connecting, we recommend some basic checks:

- In **Settings → Diagnostics & Debugging**, confirm that the coordinator is connected and the virtual network adapter is ready
- Check that the controller home page shows this device's ezPlay hostname
- Try joining a room and confirm you can see other members
- Test basic communication (for example, connecting to someone else's game server)

If you run into problems:

- [Diagnostics](/en/connect/troubleshoot/diagnostics)
- [FAQ](/en/connect/faq)

---

## Next Steps

After your first connection, we recommend reading:

- [Identifiers](/en/connect/basics/identifiers)
- [Firewall Rules](/en/connect/acl/rules)
- [Interactive Authorization](/en/connect/acl/interactive_auth)
- [Connections](/en/connect/basics/connections)
- [Room Relay](/en/connect/spaces/room_relay)
