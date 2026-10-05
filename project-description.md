# JBC Skin Cream App — Project Description

## Overview
A client-facing web app for **JBC**, an all-natural herbal skin cream made with no artificial additives. It is safe for children and adults (men and women). Clients sign in with Google, choose a cream size and quantity, and request a price. The admin sees each request with the client's email, then replies with a price.

## Product Claims (landing page)
- All-natural, made from herbs, no artificial additives
- Antifungal
- Works on burns
- Works on most skin conditions, including fungal infections and eczema, rashes and dry skin
- Safe for children, men and women

## Users
1. **Client**: visits the landing page, signs in with Google, requests a price.
2. **Admin**: signs in with Google (email on the admin allowlist), reviews requests, sets prices.

## Core Features
1. **Landing page** (green, yellow, blue): hero, benefits, conditions it helps with, "Safe for the whole family" section, "Sign in with Google to get a price" button.
2. **Google-only sign-in**: no passwords, no other providers.
3. **Request a price** (signed-in clients): pick cream size/quantity `[size options: to confirm]`, add an optional note about the skin condition, submit.
4. **My requests**: client sees their requests and status (Pending → Priced → Closed), and the price once the admin sets it.
5. **Admin page** (simple, protected): list of clients (name, Google email, sign-up date) and their requests; admin enters a price and a reply note, then marks the request Priced.

## Rules
- Prices are **never shown publicly**. A price appears only after the admin sets it for that client.
- Only allowlisted admin emails can open the admin page.
- Clients can only see their own requests.

## Out of Scope (v1)
- Online payment
- Public product pricing
- Other login methods

## Footer Note (suggested)
"For external use only. Do a small patch test first. For severe burns or conditions that don't improve, see a doctor."

## Open Items
- Cream sizes and any quantity limits
- Admin contact method (WhatsApp number or phone) shown after pricing
- Admin email(s) for the allowlist
- Product photos and logo
