# Invitation Platform

## Complete V1 Product, Database & Node.js Backend Technical Documentation

**Version:** 1.0
**Backend:** Node.js + Express.js
**Database:** MySQL 8+
**Frontend:** Existing React/Vite Application
**Authentication:** JWT Access Token + Refresh Session
**Payment Model:** Manual Payment / Admin Verification
**Primary Market Model:** Customer Request → Manual Payment → Account Activation → Invitation Builder → Publish

---

# 1. Executive Overview

The platform is a digital invitation creation service.

A visitor first submits an invitation request from the public landing page.

The request does **not** immediately give the customer access to the invitation builder.

Instead:

1. Customer submits request.
2. Request is stored in the database.
3. Admin receives an email notification.
4. Admin contacts the customer.
5. Customer pays manually.
6. Admin records the payment.
7. Admin activates the customer.
8. Customer login credentials are created.
9. Customer receives credentials.
10. Customer logs in.
11. Customer creates/customizes the invitation.
12. Customer previews it.
13. Customer publishes it.
14. System generates a unique public invitation URL.
15. Customer shares the invitation.

This follows the agreed manual-payment workflow where payment is confirmed before system access is provided.

The system is intentionally designed so that online-payment integration is **not required for V1**.

---

# 2. Main Business Flow

```text
PUBLIC LANDING PAGE
        │
        ▼
SUBMIT INVITATION REQUEST
        │
        ├──── Save Customer / Lead
        │
        ├──── Save Request
        │
        └──── Send Admin Notification
        │
        ▼
ADMIN DASHBOARD
        │
        ▼
CONTACT CUSTOMER
        │
        ▼
AWAITING MANUAL PAYMENT
        │
        ▼
PAYMENT RECEIVED
        │
        ▼
ADMIN: MARK AS PAID
        │
        ▼
CREATE CUSTOMER ACCOUNT
        │
        ├──── Generate Temporary Password
        │
        └──── Create Initial Invitation
        │
        ▼
SEND CREDENTIALS
        │
        ▼
CUSTOMER LOGIN
        │
        ▼
CHANGE TEMPORARY PASSWORD
        │
        ▼
CUSTOMER DASHBOARD
        │
        ▼
INVITATION BUILDER
        │
        ├──── Template
        ├──── Text
        ├──── GIFs / Images
        ├──── Locations
        ├──── Food
        ├──── Date / Time
        ├──── Dress Code
        ├──── Theme
        └──── Reactions / Final Screen
        │
        ▼
PREVIEW
        │
        ▼
PUBLISH
        │
        ▼
PUBLIC INVITATION URL
```

---

# 3. V1 User Roles

## 3.1 Visitor

Unauthenticated website visitor.

Can:

* View landing page.
* Submit invitation request.
* Enter contact details.
* Enter recipient name.
* Submit optional notes.
* Receive confirmation that request was received.

Cannot:

* Access invitation builder.
* Publish invitations.
* Access private customer data.

---

# 3.2 Customer

Customer whose payment has been approved and account activated.

Can:

* Log in.
* Change password.
* View own invitations.
* Edit own invitations.
* Select templates.
* Change invitation text.
* Select locations.
* Select food options.
* Select global GIFs.
* Upload personal media.
* Configure date/time.
* Configure dress code.
* Preview invitation.
* Publish invitation.
* Unpublish invitation.
* Copy public URL.
* View basic invitation statistics.

Cannot:

* Access another customer's invitation.
* Edit system templates.
* Edit global GIF library.
* Edit global location library.
* Edit global food library.
* Mark payments as paid.

---

# 3.3 Admin

Internal system administrator.

Can:

* View customer requests.
* Contact customers.
* Record payment information.
* Mark requests as paid.
* Create customer accounts.
* Suspend accounts.
* Reset customer passwords.
* Create invitations.
* Edit invitations.
* Publish/unpublish invitations.
* Manage templates.
* Manage themes.
* Manage locations.
* Manage food options.
* Manage global GIF/media library.
* View analytics.
* View audit history.

---

# 4. V1 Functional Modules

The backend should be divided into the following modules:

```text
Authentication
Customers
Customer Requests
Payments
Users
Invitations
Invitation Content
Templates
Themes
Locations
Food Options
Media
GIF Library
Invitation Media
Publishing
Public Invitation Renderer
Analytics
Email Notifications
Audit Logs
System Settings
```

---

# 5. Public Landing Page

## Required Fields

### Customer Name

Example:

```text
Tarek
```

### Phone

Prefer E.164 format internally.

Example:

```text
+96170123456
```

### Email

Used for:

* Customer identification.
* Login.
* Credential delivery if desired.
* Password recovery.

### Recipient Name

Example:

```text
Dana
```

### Notes

Optional.

Example:

```text
I want something romantic but funny.
```

---

# 6. Request Submission

Endpoint:

```http
POST /api/v1/public/requests
```

Payload:

```json
{
  "name": "Tarek",
  "phone": "+96170123456",
  "email": "tarek@example.com",
  "recipientName": "Dana",
  "notes": "Romantic and funny"
}
```

Backend should:

1. Validate fields.
2. Check whether customer exists.
3. Create or update customer lead.
4. Create customer request.
5. Set request status to `new`.
6. Set payment status to `pending`.
7. Add audit/business event.
8. Send email notification to admin.
9. Return confirmation.

Response:

```json
{
  "success": true,
  "message": "Your request has been received."
}
```

No user account should be created at this stage.

---

# 7. Request Status Lifecycle

```text
new
 ↓
contacted
 ↓
awaiting_payment
 ↓
paid
 ↓
account_created
 ↓
completed
```

Alternative terminal states:

```text
cancelled
```

Recommended enum:

```text
new
contacted
awaiting_payment
paid
account_created
completed
cancelled
```

---

# 8. Payment Model

V1 should use **manual payment verification only**.

Recommended methods:

```text
cash
whish
bank_transfer
other
```

There is no requirement for:

* Stripe
* PayPal
* Apple Pay
* Payment gateway callbacks
* Webhooks
* Automatic settlement

Admin records payment manually.

---

# 9. Payment Flow

Admin opens a request.

Example:

```text
Customer
────────────────────────
Tarek
+961 70 123 456
tarek@example.com

Request
────────────────────────
Recipient: Dana
Status: Awaiting Payment

Payment
────────────────────────
Amount: $25
Method: Whish
Reference: ABC123

[ Mark as Paid ]
```

When admin presses **Mark as Paid**, backend should create/update the payment record.

Do not create access automatically without checking payment status.

---

# 10. Account Activation

Recommended admin action:

```http
POST /api/v1/admin/requests/:requestId/activate
```

This action should run inside a database transaction.

It should:

1. Lock/request the target request.
2. Verify request exists.
3. Verify payment is `paid`.
4. Check whether customer already has account.
5. Generate account if required.
6. Generate cryptographically secure temporary password.
7. Hash password.
8. Store only password hash.
9. Set:

```text
must_change_password = true
```

10. Create initial draft invitation.
11. Update request to:

```text
account_created
```

12. Commit transaction.
13. Return temporary password **once**.
14. Optionally email credentials.

The database must never store the temporary password in plaintext.

---

# 11. Authentication Model

Use:

```text
Email / Username
+
Password
```

Recommended authentication architecture:

```text
Short-lived JWT access token
+
Long-lived refresh session
```

Example:

```text
Access Token:
15 minutes

Refresh Session:
7–30 days
```

Refresh token should preferably be stored in:

```text
Secure
HTTPOnly
SameSite cookie
```

Refresh token itself should not be stored in plaintext in MySQL.

Store a hash of it.

---

# 12. First Login

If:

```text
must_change_password = true
```

Customer should be redirected to:

```text
/change-password
```

Until password has been replaced.

After successfully changing password:

```text
must_change_password = false
```

---

# 13. Customer Dashboard

After login:

```text
Welcome, Tarek ❤️

My Invitations

────────────────────────
Dinner With Dana

Status:
Draft

[ Continue Editing ]
[ Preview ]
────────────────────────
```

After publishing:

```text
Dinner With Dana

Status:
Published

yourdomain.com/d/dana-7f82k

[ Edit ]
[ Preview ]
[ Copy Link ]
[ Unpublish ]
```

---

# 14. Invitation Identity

Do not use customer phone or email as the public invitation identifier.

Internally:

```text
customer.id
invitation.id
```

Externally:

```text
invitation.public_id
invitation.slug
```

Example:

```text
Internal customer ID:
182

Internal invitation ID:
492

Public ID:
01KXX8C4SVKDTFAV59B3RJXA2C

Public Slug:
dana-7f82k
```

The existing design already recommends a unique invitation ID/slug rather than making the phone number the system identity.

---

# 15. Public Invitation URL

Recommended structure:

```text
https://yourdomain.com/d/dana-7f82k
```

Frontend receives slug:

```text
dana-7f82k
```

Then calls:

```http
GET /api/v1/public/invitations/dana-7f82k
```

---

# 16. Existing React Frontend Architecture

The existing invitation experience should **not be rebuilt**.

Current hardcoded data should be moved into the database/API.

Architecture:

```text
MySQL
 ↓
Node.js API
 ↓
Invitation JSON
 ↓
Existing React Application
 ↓
Invitation Screens
```

The same React app can therefore render:

```text
/d/dana-7f82k
```

or:

```text
/d/sarah-19kd2
```

using different configuration data. This is the same renderer pattern recommended in the original specification.

---

# 17. Invitation Builder Sections

Recommended sections:

```text
General
Template
Content
Hero Media
Question
Reactions
Locations
Food
Date & Time
Dress Code
Theme
Final Screen
Preview
Publish
```

---

# 18. Templates

Templates should provide default:

* Colors.
* Theme.
* Content.
* GIFs/media.
* Animations.
* Button behavior.
* Background.
* General appearance.

Examples:

```text
Romantic ❤️
Funny 😂
Dark 🖤
Luxury ✨
Cute 🌸
```

Templates should initialize invitation configuration but customers should be able to customize individual values afterward. This follows the original template requirement.

---

# 19. Invitation Content

All important invitation text should be database-driven rather than hardcoded.

Recommended fields:

```text
opening_text
question_text

yes_button_text
no_button_text

no_phrase_1
no_phrase_2
no_phrase_3

angry_title
angry_message
angry_button

location_title
food_title
when_title
dress_code_title

final_title
final_message
```

The original concept explicitly calls for editable invitation text such as the question, NO phrases, angry screen, section titles and final message.

---

# 20. Location Library

Admin maintains a global location library.

Example:

```text
Skymate
Hawana
Jia
Restaurant X
Beach X
```

Each record can contain:

```text
name
category
description
emoji
image
active
sort_order
```

Invitation selects locations through a junction table rather than storing locations directly inside `invitations`.

---

# 21. Food Library

Admin maintains reusable food options.

Example:

```text
Lebanese
Italian
Sushi
Burgers
Sandwiches
Dessert
```

Fields:

```text
name
description
emoji
image
active
sort_order
```

Invitation selections are stored through a junction table.

---

# 22. Media System

Supported formats:

```text
JPG
JPEG
PNG
WEBP
GIF
```

Optional future formats:

```text
MP4
WEBM
```

Images/GIFs should have assignments such as:

```text
hero
no_reaction_1
no_reaction_2
no_reaction_3
angry
yes_reaction
final
background
```

The source concept specifically supports both global GIFs and invitation/customer uploads and advises that private customer GIFs should not automatically enter the public library.

---

# 23. Global GIF Library

Categories:

```text
romantic
funny
angry
dramatic
flirty
cute
celebration
chaotic
```

Admin manages the library.

Customer can:

```text
Choose from library
OR
Upload own
```

Private uploads remain private to that customer/invitation.

---

# 24. Recommended System Architecture

```text
┌───────────────────────────────┐
│       PUBLIC WEBSITE          │
│ React / Vite                  │
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│         NODE.JS API           │
│ Express.js                    │
│                               │
│ Auth                          │
│ Requests                      │
│ Customers                     │
│ Payments                      │
│ Invitations                   │
│ Libraries                     │
│ Media                         │
│ Analytics                     │
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│           MYSQL               │
└───────────────────────────────┘

               +

┌───────────────────────────────┐
│       FILE STORAGE            │
│ S3-compatible / Cloud Storage │
└───────────────────────────────┘

               +

┌───────────────────────────────┐
│       EMAIL PROVIDER          │
└───────────────────────────────┘
```

---

# 25. Recommended Backend Stack

```text
Node.js
Express.js
MySQL
mysql2/promise
JWT
Argon2 or bcrypt
Zod
Multer
Helmet
CORS
express-rate-limit
Pino
Nodemailer or transactional email provider
```

Recommended architecture:

```text
Route
 ↓
Middleware
 ↓
Controller
 ↓
Service
 ↓
Repository
 ↓
MySQL
```

---

# 26. Backend Project Structure

```text
backend/
│
├── src/
│   │
│   ├── app.js
│   ├── server.js
│   │
│   ├── config/
│   │   ├── env.js
│   │   ├── database.js
│   │   ├── auth.js
│   │   └── storage.js
│   │
│   ├── db/
│   │   ├── pool.js
│   │   ├── transaction.js
│   │   └── migrations/
│   │
│   ├── middleware/
│   │   ├── authenticate.js
│   │   ├── authorize.js
│   │   ├── error-handler.js
│   │   ├── validate.js
│   │   ├── rate-limit.js
│   │   └── upload.js
│   │
│   ├── modules/
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   ├── auth.repository.js
│   │   │   └── auth.schema.js
│   │   │
│   │   ├── users/
│   │   ├── customers/
│   │   ├── requests/
│   │   ├── payments/
│   │   ├── invitations/
│   │   ├── templates/
│   │   ├── themes/
│   │   ├── locations/
│   │   ├── foods/
│   │   ├── media/
│   │   ├── analytics/
│   │   └── admin/
│   │
│   ├── services/
│   │   ├── email.service.js
│   │   ├── storage.service.js
│   │   ├── slug.service.js
│   │   └── audit.service.js
│   │
│   └── utils/
│       ├── api-error.js
│       ├── response.js
│       ├── password.js
│       ├── tokens.js
│       └── pagination.js
│
├── tests/
├── uploads/
├── package.json
├── .env
├── .env.example
└── README.md
```

---

# 27. Database Relationship Model

```text
CUSTOMERS
   │
   ├──────── USERS
   │
   ├──────── CUSTOMER_REQUESTS
   │              │
   │              └──── PAYMENTS
   │
   └──────── INVITATIONS
                  │
                  ├──── INVITATION_CONTENT
                  ├──── INVITATION_LOCATIONS
                  │         └──── LOCATIONS
                  │
                  ├──── INVITATION_FOOD_OPTIONS
                  │         └──── FOOD_OPTIONS
                  │
                  ├──── INVITATION_MEDIA
                  │         └──── MEDIA_ASSETS
                  │
                  └──── INVITATION_EVENTS

TEMPLATES
   │
   └──────── THEMES
```

---

# 28. Complete MySQL Schema

```sql
CREATE DATABASE IF NOT EXISTS invitation_platform
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE invitation_platform;


-- =========================================================
-- 1. CUSTOMERS
-- =========================================================

CREATE TABLE customers (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(255) NOT NULL,

    status ENUM(
        'lead',
        'active',
        'suspended',
        'archived'
    ) NOT NULL DEFAULT 'lead',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_customers_email (email),
    KEY idx_customers_phone (phone),
    KEY idx_customers_status (status)
);


-- =========================================================
-- 2. USERS
-- =========================================================

CREATE TABLE users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    customer_id BIGINT UNSIGNED NULL,

    email VARCHAR(255) NOT NULL,
    username VARCHAR(100) NULL,

    password_hash VARCHAR(255) NOT NULL,

    role ENUM(
        'admin',
        'customer'
    ) NOT NULL,

    status ENUM(
        'active',
        'suspended',
        'disabled'
    ) NOT NULL DEFAULT 'active',

    must_change_password BOOLEAN NOT NULL DEFAULT TRUE,

    last_login_at DATETIME NULL,
    password_changed_at DATETIME NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_users_email (email),
    UNIQUE KEY uq_users_username (username),

    KEY idx_users_customer (customer_id),
    KEY idx_users_role_status (role, status),

    CONSTRAINT fk_users_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON DELETE SET NULL
);


-- =========================================================
-- 3. CUSTOMER REQUESTS
-- =========================================================

CREATE TABLE customer_requests (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    customer_id BIGINT UNSIGNED NOT NULL,

    recipient_name VARCHAR(150) NOT NULL,

    notes TEXT NULL,

    status ENUM(
        'new',
        'contacted',
        'awaiting_payment',
        'paid',
        'account_created',
        'completed',
        'cancelled'
    ) NOT NULL DEFAULT 'new',

    quoted_amount DECIMAL(10,2) NULL,
    quoted_currency CHAR(3) NULL DEFAULT 'USD',

    assigned_admin_user_id BIGINT UNSIGNED NULL,

    submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    contacted_at DATETIME NULL,
    completed_at DATETIME NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    KEY idx_requests_customer (customer_id),
    KEY idx_requests_status (status),
    KEY idx_requests_admin (assigned_admin_user_id),
    KEY idx_requests_created (created_at),

    CONSTRAINT fk_requests_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_requests_admin
        FOREIGN KEY (assigned_admin_user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);


-- =========================================================
-- 4. PAYMENTS
-- =========================================================

CREATE TABLE payments (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    request_id BIGINT UNSIGNED NOT NULL,
    customer_id BIGINT UNSIGNED NOT NULL,

    amount DECIMAL(10,2) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'USD',

    payment_method ENUM(
        'cash',
        'whish',
        'bank_transfer',
        'other'
    ) NOT NULL,

    status ENUM(
        'pending',
        'paid',
        'refunded',
        'cancelled'
    ) NOT NULL DEFAULT 'pending',

    reference_number VARCHAR(255) NULL,
    notes TEXT NULL,

    marked_paid_by BIGINT UNSIGNED NULL,
    paid_at DATETIME NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    KEY idx_payments_request (request_id),
    KEY idx_payments_customer (customer_id),
    KEY idx_payments_status (status),

    CONSTRAINT fk_payments_request
        FOREIGN KEY (request_id)
        REFERENCES customer_requests(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_payments_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_payments_admin
        FOREIGN KEY (marked_paid_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);


-- =========================================================
-- 5. REFRESH SESSIONS
-- =========================================================

CREATE TABLE user_sessions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    user_id BIGINT UNSIGNED NOT NULL,

    refresh_token_hash VARCHAR(255) NOT NULL,

    user_agent VARCHAR(500) NULL,
    ip_hash CHAR(64) NULL,

    expires_at DATETIME NOT NULL,
    revoked_at DATETIME NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    KEY idx_sessions_user (user_id),
    KEY idx_sessions_expiry (expires_at),

    CONSTRAINT fk_sessions_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- =========================================================
-- 6. PASSWORD RESET TOKENS
-- =========================================================

CREATE TABLE password_reset_tokens (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    user_id BIGINT UNSIGNED NOT NULL,

    token_hash VARCHAR(255) NOT NULL,

    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    KEY idx_password_reset_user (user_id),

    CONSTRAINT fk_password_reset_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- =========================================================
-- 7. THEMES
-- =========================================================

CREATE TABLE themes (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    name VARCHAR(120) NOT NULL,
    slug VARCHAR(120) NOT NULL,

    description TEXT NULL,

    primary_color VARCHAR(20) NULL,
    secondary_color VARCHAR(20) NULL,
    background_color VARCHAR(20) NULL,
    text_color VARCHAR(20) NULL,

    font_family VARCHAR(150) NULL,

    configuration JSON NULL,

    active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_themes_slug (slug),
    KEY idx_themes_active (active)
);


-- =========================================================
-- 8. TEMPLATES
-- =========================================================

CREATE TABLE templates (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    theme_id BIGINT UNSIGNED NULL,

    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL,

    description TEXT NULL,
    preview_image_url VARCHAR(1000) NULL,

    default_configuration JSON NULL,

    active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_templates_slug (slug),

    KEY idx_templates_theme (theme_id),
    KEY idx_templates_active_sort (active, sort_order),

    CONSTRAINT fk_templates_theme
        FOREIGN KEY (theme_id)
        REFERENCES themes(id)
        ON DELETE SET NULL
);


-- =========================================================
-- 9. TEMPLATE CONTENT
-- =========================================================

CREATE TABLE template_content (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    template_id BIGINT UNSIGNED NOT NULL,

    opening_text TEXT NULL,
    question_text TEXT NULL,

    yes_button_text VARCHAR(150) NULL,
    no_button_text VARCHAR(150) NULL,

    no_phrase_1 TEXT NULL,
    no_phrase_2 TEXT NULL,
    no_phrase_3 TEXT NULL,

    angry_title VARCHAR(255) NULL,
    angry_message TEXT NULL,
    angry_button VARCHAR(150) NULL,

    location_title VARCHAR(255) NULL,
    food_title VARCHAR(255) NULL,
    when_title VARCHAR(255) NULL,
    dress_code_title VARCHAR(255) NULL,

    final_title VARCHAR(255) NULL,
    final_message TEXT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_template_content_template (template_id),

    CONSTRAINT fk_template_content_template
        FOREIGN KEY (template_id)
        REFERENCES templates(id)
        ON DELETE CASCADE
);


-- =========================================================
-- 10. INVITATIONS
-- =========================================================

CREATE TABLE invitations (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    public_id CHAR(26) NOT NULL,

    customer_id BIGINT UNSIGNED NOT NULL,
    created_by_user_id BIGINT UNSIGNED NULL,

    template_id BIGINT UNSIGNED NULL,
    theme_id BIGINT UNSIGNED NULL,

    internal_title VARCHAR(255) NULL,

    slug VARCHAR(180) NOT NULL,

    recipient_name VARCHAR(150) NOT NULL,

    date_type ENUM(
        'exact',
        'tomorrow',
        'custom_text',
        'tbd'
    ) NOT NULL DEFAULT 'tbd',

    date_value DATE NULL,
    date_text VARCHAR(255) NULL,

    time_value TIME NULL,
    timezone VARCHAR(100) NOT NULL DEFAULT 'Asia/Beirut',

    dress_code VARCHAR(150) NULL,
    dress_code_text TEXT NULL,

    status ENUM(
        'draft',
        'published',
        'unpublished',
        'archived'
    ) NOT NULL DEFAULT 'draft',

    published_at DATETIME NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_invitations_public_id (public_id),
    UNIQUE KEY uq_invitations_slug (slug),

    KEY idx_invitations_customer (customer_id),
    KEY idx_invitations_status (status),
    KEY idx_invitations_template (template_id),

    CONSTRAINT fk_invitations_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_invitations_creator
        FOREIGN KEY (created_by_user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_invitations_template
        FOREIGN KEY (template_id)
        REFERENCES templates(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_invitations_theme
        FOREIGN KEY (theme_id)
        REFERENCES themes(id)
        ON DELETE SET NULL
);


-- =========================================================
-- 11. INVITATION CONTENT
-- =========================================================

CREATE TABLE invitation_content (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    invitation_id BIGINT UNSIGNED NOT NULL,

    opening_text TEXT NULL,
    question_text TEXT NULL,

    yes_button_text VARCHAR(150) NULL DEFAULT 'YES ❤️',
    no_button_text VARCHAR(150) NULL DEFAULT 'NO',

    no_phrase_1 TEXT NULL,
    no_phrase_2 TEXT NULL,
    no_phrase_3 TEXT NULL,

    angry_title VARCHAR(255) NULL,
    angry_message TEXT NULL,
    angry_button VARCHAR(150) NULL,

    location_title VARCHAR(255) NULL,
    food_title VARCHAR(255) NULL,
    when_title VARCHAR(255) NULL,
    dress_code_title VARCHAR(255) NULL,

    final_title VARCHAR(255) NULL,
    final_message TEXT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_invitation_content_invitation (invitation_id),

    CONSTRAINT fk_invitation_content_invitation
        FOREIGN KEY (invitation_id)
        REFERENCES invitations(id)
        ON DELETE CASCADE
);


-- =========================================================
-- 12. LOCATIONS
-- =========================================================

CREATE TABLE locations (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    name VARCHAR(180) NOT NULL,
    category VARCHAR(120) NULL,
    description TEXT NULL,

    emoji VARCHAR(30) NULL,
    image_url VARCHAR(1000) NULL,

    active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    KEY idx_locations_active_sort (active, sort_order),
    KEY idx_locations_category (category)
);


-- =========================================================
-- 13. INVITATION LOCATIONS
-- =========================================================

CREATE TABLE invitation_locations (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    invitation_id BIGINT UNSIGNED NOT NULL,
    location_id BIGINT UNSIGNED NOT NULL,

    sort_order INT NOT NULL DEFAULT 0,

    custom_name VARCHAR(180) NULL,
    custom_description TEXT NULL,
    custom_image_url VARCHAR(1000) NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_invitation_location (
        invitation_id,
        location_id
    ),

    KEY idx_inv_locations_sort (
        invitation_id,
        sort_order
    ),

    CONSTRAINT fk_inv_locations_invitation
        FOREIGN KEY (invitation_id)
        REFERENCES invitations(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_inv_locations_location
        FOREIGN KEY (location_id)
        REFERENCES locations(id)
        ON DELETE RESTRICT
);


-- =========================================================
-- 14. FOOD OPTIONS
-- =========================================================

CREATE TABLE food_options (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    name VARCHAR(180) NOT NULL,
    description TEXT NULL,

    emoji VARCHAR(30) NULL,
    image_url VARCHAR(1000) NULL,

    active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    KEY idx_food_active_sort (active, sort_order)
);


-- =========================================================
-- 15. INVITATION FOOD OPTIONS
-- =========================================================

CREATE TABLE invitation_food_options (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    invitation_id BIGINT UNSIGNED NOT NULL,
    food_option_id BIGINT UNSIGNED NOT NULL,

    sort_order INT NOT NULL DEFAULT 0,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_invitation_food (
        invitation_id,
        food_option_id
    ),

    KEY idx_inv_food_sort (
        invitation_id,
        sort_order
    ),

    CONSTRAINT fk_inv_food_invitation
        FOREIGN KEY (invitation_id)
        REFERENCES invitations(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_inv_food_option
        FOREIGN KEY (food_option_id)
        REFERENCES food_options(id)
        ON DELETE RESTRICT
);


-- =========================================================
-- 16. MEDIA ASSETS
-- =========================================================

CREATE TABLE media_assets (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    customer_id BIGINT UNSIGNED NULL,
    invitation_id BIGINT UNSIGNED NULL,
    uploaded_by_user_id BIGINT UNSIGNED NULL,

    visibility ENUM(
        'global',
        'customer_private',
        'invitation_private'
    ) NOT NULL,

    media_type ENUM(
        'image',
        'gif'
    ) NOT NULL,

    mime_type VARCHAR(150) NOT NULL,

    original_filename VARCHAR(500) NULL,

    storage_provider VARCHAR(80) NULL,
    storage_key VARCHAR(1000) NULL,

    file_url VARCHAR(1500) NOT NULL,
    thumbnail_url VARCHAR(1500) NULL,

    file_size_bytes BIGINT UNSIGNED NULL,

    active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    KEY idx_media_customer (customer_id),
    KEY idx_media_invitation (invitation_id),
    KEY idx_media_visibility (visibility),

    CONSTRAINT fk_media_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_media_invitation
        FOREIGN KEY (invitation_id)
        REFERENCES invitations(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_media_uploader
        FOREIGN KEY (uploaded_by_user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);


-- =========================================================
-- 17. GLOBAL GIF LIBRARY
-- =========================================================

CREATE TABLE gif_library (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    media_asset_id BIGINT UNSIGNED NOT NULL,

    name VARCHAR(180) NOT NULL,

    category ENUM(
        'romantic',
        'funny',
        'angry',
        'dramatic',
        'flirty',
        'cute',
        'celebration',
        'chaotic',
        'other'
    ) NOT NULL DEFAULT 'other',

    active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_gif_library_media (media_asset_id),

    KEY idx_gif_category (category),
    KEY idx_gif_active_sort (active, sort_order),

    CONSTRAINT fk_gif_media
        FOREIGN KEY (media_asset_id)
        REFERENCES media_assets(id)
        ON DELETE CASCADE
);


-- =========================================================
-- 18. INVITATION MEDIA ASSIGNMENTS
-- =========================================================

CREATE TABLE invitation_media (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    invitation_id BIGINT UNSIGNED NOT NULL,
    media_asset_id BIGINT UNSIGNED NOT NULL,

    slot ENUM(
        'hero',
        'no_reaction_1',
        'no_reaction_2',
        'no_reaction_3',
        'angry',
        'yes_reaction',
        'final',
        'background'
    ) NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_invitation_media_slot (
        invitation_id,
        slot
    ),

    KEY idx_inv_media_asset (media_asset_id),

    CONSTRAINT fk_inv_media_invitation
        FOREIGN KEY (invitation_id)
        REFERENCES invitations(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_inv_media_asset
        FOREIGN KEY (media_asset_id)
        REFERENCES media_assets(id)
        ON DELETE RESTRICT
);


-- =========================================================
-- 19. INVITATION EVENTS / ANALYTICS
-- =========================================================

CREATE TABLE invitation_events (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    invitation_id BIGINT UNSIGNED NOT NULL,

    event_type ENUM(
        'view',
        'yes_click',
        'no_click',
        'location_select',
        'food_select',
        'share_click',
        'rsvp_complete'
    ) NOT NULL,

    session_key VARCHAR(100) NULL,

    ip_hash CHAR(64) NULL,

    user_agent VARCHAR(500) NULL,

    event_data JSON NULL,

    occurred_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    KEY idx_events_invitation (
        invitation_id,
        occurred_at
    ),

    KEY idx_events_type (
        event_type,
        occurred_at
    ),

    CONSTRAINT fk_events_invitation
        FOREIGN KEY (invitation_id)
        REFERENCES invitations(id)
        ON DELETE CASCADE
);


-- =========================================================
-- 20. AUDIT LOG
-- =========================================================

CREATE TABLE audit_logs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    user_id BIGINT UNSIGNED NULL,

    action VARCHAR(150) NOT NULL,

    entity_type VARCHAR(100) NULL,
    entity_id BIGINT UNSIGNED NULL,

    old_values JSON NULL,
    new_values JSON NULL,

    ip_hash CHAR(64) NULL,
    user_agent VARCHAR(500) NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    KEY idx_audit_user (user_id),
    KEY idx_audit_entity (
        entity_type,
        entity_id
    ),
    KEY idx_audit_created (created_at),

    CONSTRAINT fk_audit_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);


-- =========================================================
-- 21. EMAIL OUTBOX
-- =========================================================

CREATE TABLE email_outbox (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    recipient_email VARCHAR(255) NOT NULL,

    template_name VARCHAR(150) NOT NULL,

    subject VARCHAR(255) NOT NULL,

    payload JSON NULL,

    status ENUM(
        'pending',
        'sent',
        'failed'
    ) NOT NULL DEFAULT 'pending',

    attempts INT UNSIGNED NOT NULL DEFAULT 0,

    last_error TEXT NULL,

    sent_at DATETIME NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    KEY idx_email_status (status),
    KEY idx_email_created (created_at)
);


-- =========================================================
-- 22. SYSTEM SETTINGS
-- =========================================================

CREATE TABLE system_settings (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    setting_key VARCHAR(150) NOT NULL,

    setting_value JSON NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_settings_key (setting_key)
);
```

---

# 29. Important Database Design Rules

## Never expose internal IDs unnecessarily

Frontend should preferably work with:

```text
public_id
slug
```

rather than:

```text
id = 492
```

Internal IDs remain useful for joins and performance.

---

# 30. Node.js Database Pool

Example:

```js
import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  charset: "utf8mb4"
});
```

---

# 31. Database Transaction Helper

```js
import { pool } from "./pool.js";

export async function withTransaction(callback) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const result = await callback(connection);

    await connection.commit();

    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
```

Account activation, payment recording and invitation creation should use transactions where several related writes must succeed together.

---

# 32. API Base URL

Use versioned APIs.

```text
/api/v1
```

---

# 33. Authentication APIs

## Login

```http
POST /api/v1/auth/login
```

Request:

```json
{
  "email": "tarek@example.com",
  "password": "Password123!"
}
```

---

## Refresh

```http
POST /api/v1/auth/refresh
```

---

## Logout

```http
POST /api/v1/auth/logout
```

---

## Current User

```http
GET /api/v1/auth/me
```

---

## Change Password

```http
POST /api/v1/auth/change-password
```

---

## Forgot Password

```http
POST /api/v1/auth/forgot-password
```

---

## Reset Password

```http
POST /api/v1/auth/reset-password
```

---

# 34. Public APIs

```http
POST /api/v1/public/requests

GET /api/v1/public/invitations/:slug

POST /api/v1/public/invitations/:slug/events
```

No authentication required.

---

# 35. Customer APIs

## Dashboard

```http
GET /api/v1/customer/dashboard
```

---

## Invitations

```http
GET /api/v1/customer/invitations
```

```http
GET /api/v1/customer/invitations/:publicId
```

```http
PATCH /api/v1/customer/invitations/:publicId
```

---

## Invitation Content

```http
GET /api/v1/customer/invitations/:publicId/content
```

```http
PATCH /api/v1/customer/invitations/:publicId/content
```

---

## Template

```http
PUT /api/v1/customer/invitations/:publicId/template
```

---

## Locations

```http
GET /api/v1/customer/invitations/:publicId/locations
```

```http
PUT /api/v1/customer/invitations/:publicId/locations
```

---

## Food

```http
GET /api/v1/customer/invitations/:publicId/food-options
```

```http
PUT /api/v1/customer/invitations/:publicId/food-options
```

---

## Media

```http
POST /api/v1/customer/invitations/:publicId/media
```

```http
PUT /api/v1/customer/invitations/:publicId/media/:slot
```

```http
DELETE /api/v1/customer/invitations/:publicId/media/:slot
```

---

## Preview

```http
GET /api/v1/customer/invitations/:publicId/preview
```

---

## Publish

```http
POST /api/v1/customer/invitations/:publicId/publish
```

---

## Unpublish

```http
POST /api/v1/customer/invitations/:publicId/unpublish
```

---

## Analytics

```http
GET /api/v1/customer/invitations/:publicId/analytics
```

---

# 36. Customer Library APIs

```http
GET /api/v1/customer/templates
```

```http
GET /api/v1/customer/themes
```

```http
GET /api/v1/customer/locations
```

```http
GET /api/v1/customer/food-options
```

```http
GET /api/v1/customer/gifs
```

---

# 37. Admin Request APIs

```http
GET /api/v1/admin/requests
```

```http
GET /api/v1/admin/requests/:requestId
```

```http
PATCH /api/v1/admin/requests/:requestId/status
```

```http
POST /api/v1/admin/requests/:requestId/payment
```

```http
POST /api/v1/admin/requests/:requestId/activate
```

```http
POST /api/v1/admin/requests/:requestId/cancel
```

---

# 38. Admin Customer APIs

```http
GET /api/v1/admin/customers
```

```http
GET /api/v1/admin/customers/:customerId
```

```http
PATCH /api/v1/admin/customers/:customerId
```

```http
POST /api/v1/admin/customers/:customerId/suspend
```

```http
POST /api/v1/admin/customers/:customerId/activate
```

---

# 39. Admin User APIs

```http
GET /api/v1/admin/users
```

```http
POST /api/v1/admin/users/:userId/reset-password
```

```http
POST /api/v1/admin/users/:userId/suspend
```

```http
POST /api/v1/admin/users/:userId/activate
```

---

# 40. Admin Invitation APIs

```http
GET /api/v1/admin/invitations
```

```http
GET /api/v1/admin/invitations/:publicId
```

```http
POST /api/v1/admin/customers/:customerId/invitations
```

```http
PATCH /api/v1/admin/invitations/:publicId
```

```http
POST /api/v1/admin/invitations/:publicId/publish
```

```http
POST /api/v1/admin/invitations/:publicId/unpublish
```

---

# 41. Admin Library APIs

## Templates

```http
GET    /api/v1/admin/templates
POST   /api/v1/admin/templates
GET    /api/v1/admin/templates/:id
PATCH  /api/v1/admin/templates/:id
DELETE /api/v1/admin/templates/:id
```

Prefer soft deactivation rather than physical deletion when the template has previously been used.

---

## Themes

```http
GET   /api/v1/admin/themes
POST  /api/v1/admin/themes
PATCH /api/v1/admin/themes/:id
```

---

## Locations

```http
GET    /api/v1/admin/locations
POST   /api/v1/admin/locations
PATCH  /api/v1/admin/locations/:id
DELETE /api/v1/admin/locations/:id
```

---

## Food Options

```http
GET    /api/v1/admin/food-options
POST   /api/v1/admin/food-options
PATCH  /api/v1/admin/food-options/:id
DELETE /api/v1/admin/food-options/:id
```

---

## GIF Library

```http
GET    /api/v1/admin/gifs
POST   /api/v1/admin/gifs
PATCH  /api/v1/admin/gifs/:id
DELETE /api/v1/admin/gifs/:id
```

---

# 42. Public Invitation Response

The public API should give the React renderer one complete configuration.

Example:

```json
{
  "invitation": {
    "slug": "dana-7f82k",
    "recipientName": "Dana",

    "status": "published",

    "date": {
      "type": "exact",
      "value": "2026-09-15",
      "time": "18:00",
      "timezone": "Asia/Beirut"
    },

    "dressCode": {
      "value": "Casual",
      "description": "Wear something comfortable."
    }
  },

  "content": {
    "openingText": "I have a question for you...",
    "questionText": "Will you go on a date with me? ❤️",

    "yesButtonText": "YES ❤️",
    "noButtonText": "NO",

    "noPhrases": [
      "Are you sure?",
      "Think again 😭",
      "Last chance!"
    ],

    "angry": {
      "title": "Excuse me?! 😤",
      "message": "That was the wrong button.",
      "button": "Try again"
    },

    "sectionTitles": {
      "locations": "Where should we go?",
      "food": "What should we eat?",
      "when": "When?",
      "dressCode": "What should we wear?"
    },

    "final": {
      "title": "It's a date ❤️",
      "message": "I can't wait."
    }
  },

  "theme": {
    "name": "Romantic",
    "primaryColor": "#...",
    "secondaryColor": "#...",
    "backgroundColor": "#...",
    "textColor": "#...",
    "fontFamily": "..."
  },

  "locations": [
    {
      "name": "Skymate",
      "description": "...",
      "emoji": "🌇",
      "imageUrl": "..."
    }
  ],

  "foodOptions": [
    {
      "name": "Italian",
      "description": "...",
      "emoji": "🍝",
      "imageUrl": "..."
    }
  ],

  "media": {
    "hero": {
      "type": "gif",
      "url": "..."
    },

    "noReaction1": {
      "type": "gif",
      "url": "..."
    },

    "final": {
      "type": "image",
      "url": "..."
    }
  }
}
```

This should be the contract between backend and the existing React renderer.

---

# 43. Ownership Security

Every customer request for an invitation must enforce:

```text
invitation.customer_id
=
authenticated user's customer_id
```

Never trust:

```text
customerId
```

from the request body.

For example, this is unsafe:

```json
{
  "customerId": 123,
  "question": "..."
}
```

Instead, determine customer from JWT/session.

---

# 44. Admin Authorization

Middleware:

```js
authorize("admin")
```

Example:

```js
router.get(
  "/admin/requests",
  authenticate,
  authorize("admin"),
  requestController.list
);
```

---

# 45. Customer Authorization

Example:

```js
router.patch(
  "/customer/invitations/:publicId/content",
  authenticate,
  authorize("customer"),
  invitationController.updateContent
);
```

Service/repository must additionally verify ownership.

---

# 46. Validation

Use a schema validator such as Zod.

Example request validation:

```js
import { z } from "zod";

export const createRequestSchema = z.object({
  name: z.string().min(2).max(150),

  phone: z.string().min(7).max(30),

  email: z.string().email(),

  recipientName: z.string().min(1).max(150),

  notes: z.string().max(3000).optional()
});
```

---

# 47. SQL Injection Protection

Use prepared statements.

Correct:

```js
const [rows] = await pool.execute(
  `
  SELECT *
  FROM invitations
  WHERE public_id = ?
  AND customer_id = ?
  `,
  [publicId, customerId]
);
```

Do not concatenate raw input into SQL.

---

# 48. Account Activation Service

Recommended logic:

```js
async function activateRequest(requestId, adminUserId) {
  return withTransaction(async (db) => {

    const [requests] = await db.execute(
      `
      SELECT *
      FROM customer_requests
      WHERE id = ?
      FOR UPDATE
      `,
      [requestId]
    );

    const request = requests[0];

    if (!request) {
      throw new Error("Request not found");
    }

    const [payments] = await db.execute(
      `
      SELECT *
      FROM payments
      WHERE request_id = ?
      AND status = 'paid'
      LIMIT 1
      `,
      [requestId]
    );

    if (!payments.length) {
      throw new Error("Payment must be completed first");
    }

    // Create/reuse user.
    // Generate temporary password.
    // Hash password.
    // Create first invitation.
    // Update request status.

    return {
      success: true
    };
  });
}
```

Production implementation should return the temporary password only at the moment it is generated.

---

# 49. Invitation Creation

When an invitation is created:

1. Generate ULID/UUID-style `public_id`.
2. Generate secure slug.
3. Copy template theme.
4. Copy template default content.
5. Create invitation.
6. Create invitation_content.
7. Copy default media assignments if appropriate.
8. Return public ID.

Suggested slug:

```text
recipient-first-name
+
random 5–8 character suffix
```

Example:

```text
dana-7f82k
```

Do not use sequential IDs in public URLs.

---

# 50. Applying a Template

When customer changes template, backend can either:

### Option A — Reset everything

Not recommended because customer customization could be lost.

### Recommended Option B

Ask frontend whether customer wants to:

```text
Apply visual style only
```

or:

```text
Apply full template defaults
```

Backend supports:

```json
{
  "mode": "theme_only"
}
```

or:

```json
{
  "mode": "full"
}
```

---

# 51. Publishing Requirements

Before publishing, validate:

* Recipient exists.
* Question exists.
* Invitation content exists.
* At least one location if location section is enabled.
* At least one food option if food section is enabled.
* Valid public slug.
* Customer account is active.

Then:

```text
status = published
published_at = current timestamp
```

---

# 52. Unpublishing

```text
status = unpublished
```

Public API should return:

```http
404
```

or a branded unavailable page.

Do not expose draft content publicly.

---

# 53. Draft Preview

Customers still need to preview drafts.

Recommended approach:

```text
/customer/invitations/:publicId/preview
```

Authenticated customer receives the full renderer payload even if status is `draft`.

The public `/public/invitations/:slug` endpoint only returns published invitations.

---

# 54. Media Upload Security

Never trust filename extension alone.

Validate:

```text
MIME type
file size
actual file structure/type where possible
```

Recommended maximum sizes:

```text
Images:
5–10 MB

GIF:
10–20 MB
```

Avoid unlimited file uploads.

---

# 55. Media Storage

Preferred production architecture:

```text
Browser
 ↓
Backend
 ↓
S3-compatible storage
 ↓
Public/CDN URL
```

Potential providers:

```text
AWS S3
Cloudflare R2
DigitalOcean Spaces
Backblaze B2
```

For first local development:

```text
/uploads
```

is acceptable.

For production, object storage is safer and more scalable.

---

# 56. Email Notifications

Required V1 email:

## New Request → Admin

Subject example:

```text
New Invitation Request — Tarek
```

Body:

```text
New invitation request received.

Customer:
Tarek

Phone:
+96170123456

Email:
tarek@example.com

Recipient:
Dana

Please open the admin dashboard.
```

Optional:

## Account Activated → Customer

Contains:

```text
Login URL
Email/username
Temporary password
```

If credentials are sent through WhatsApp manually instead, email delivery can remain optional.

---

# 57. Admin Dashboard

Recommended main navigation:

```text
Dashboard
Requests
Customers
Invitations
Payments
Templates
Themes
Locations
Food
GIF Library
Analytics
Settings
```

---

# 58. Admin Dashboard Summary

Cards:

```text
New Requests

Awaiting Payment

Paid Today

Active Customers

Draft Invitations

Published Invitations
```

---

# 59. Request Listing

Columns:

```text
Customer
Phone
Recipient
Request Status
Payment
Amount
Created
Actions
```

Filters:

```text
New
Contacted
Awaiting Payment
Paid
Account Created
Completed
Cancelled
```

---

# 60. Customer Details Page

```text
Customer Information

Name
Phone
Email
Status
Created
```

Then:

```text
Requests
Payments
Account
Invitations
Audit History
```

---

# 61. Customer Account Controls

Admin:

```text
Create Account
Reset Password
Suspend Account
Reactivate Account
```

Passwords should never be visible after initial generation.

A password-reset action should generate either:

* New temporary password.

or preferably:

* Password reset link.

---

# 62. Analytics

V1 basic statistics:

```text
Total views
YES clicks
NO clicks
Location selections
Food selections
Shares
Completed interactions
```

Do not overbuild analytics initially.

---

# 63. Analytics Response Example

```json
{
  "views": 127,
  "yesClicks": 1,
  "noClicks": 3,
  "shares": 5,

  "locations": [
    {
      "name": "Skymate",
      "selections": 1
    }
  ],

  "foodOptions": [
    {
      "name": "Italian",
      "selections": 1
    }
  ]
}
```

---

# 64. Audit Logging

Important actions to record:

```text
ADMIN_MARKED_PAYMENT_PAID

ADMIN_CREATED_CUSTOMER_ACCOUNT

ADMIN_RESET_PASSWORD

ADMIN_SUSPENDED_CUSTOMER

INVITATION_CREATED

INVITATION_UPDATED

INVITATION_PUBLISHED

INVITATION_UNPUBLISHED

TEMPLATE_CREATED

LOCATION_CREATED

MEDIA_DELETED
```

Audit records should capture:

```text
User
Action
Entity
Old values
New values
Time
```

---

# 65. API Response Standard

Success:

```json
{
  "success": true,
  "data": {}
}
```

Success with metadata:

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 50
  }
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "INVITATION_NOT_FOUND",
    "message": "Invitation was not found."
  }
}
```

---

# 66. HTTP Status Codes

Use:

```text
200 OK
201 Created
204 No Content

400 Invalid Request
401 Authentication Required
403 Forbidden
404 Not Found
409 Conflict
422 Validation Error
429 Rate Limited
500 Internal Server Error
```

---

# 67. Logging

Use structured logging.

Recommended fields:

```text
requestId
method
url
userId
responseStatus
duration
errorCode
```

Never log:

```text
Password
JWT
Refresh token
Temporary password
Private media URLs if sensitive
```

---

# 68. Rate Limiting

Important routes:

### Public request

Example:

```text
5 submissions / 15 minutes / IP
```

### Login

Example:

```text
10 attempts / 15 minutes / IP
```

### Password reset

Rate-limit heavily.

---

# 69. Security Headers

Use Helmet.

Configure:

```text
Content-Security-Policy
X-Content-Type-Options
Referrer-Policy
Frame protection
```

---

# 70. CORS

Production should only accept the actual frontend domains.

Example:

```env
CORS_ORIGINS=https://example.com,https://admin.example.com
```

Do not use:

```text
*
```

with credentialed requests.

---

# 71. Recommended Environment Variables

```env
NODE_ENV=production

PORT=3000

DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=invitation_platform
DB_USER=invitation_user
DB_PASSWORD=CHANGE_ME

JWT_ACCESS_SECRET=CHANGE_ME
JWT_ACCESS_EXPIRES_IN=15m

REFRESH_TOKEN_DAYS=14

FRONTEND_URL=https://yourdomain.com
ADMIN_URL=https://yourdomain.com/admin

CORS_ORIGINS=https://yourdomain.com

ADMIN_NOTIFICATION_EMAIL=admin@yourdomain.com

MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASSWORD=

STORAGE_PROVIDER=
STORAGE_BUCKET=
STORAGE_REGION=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=

MAX_IMAGE_UPLOAD_MB=10
MAX_GIF_UPLOAD_MB=20
```

---

# 72. Recommended Initial Admin Creation

Do not provide public admin registration.

Create first admin using:

* Migration/seed script.
* CLI command.
* Secure manual insert with hashed password.

Example role:

```text
admin
```

---

# 73. Search and Pagination

Admin listing endpoints should support:

```text
?page=1
&pageSize=20
&search=Tarek
&status=awaiting_payment
```

Maximum page size:

```text
100
```

---

# 74. Database Backup

At minimum:

```text
Daily MySQL backup
```

Keep:

```text
7 daily
4 weekly
3 monthly
```

for production if commercially important.

Media storage should have independent retention/versioning strategy.

---

# 75. Database Index Strategy

Important indexes already included around:

```text
customer email
request status
request created date
payment status
invitation customer
invitation slug
invitation public ID
invitation status
media owner
analytics invitation/time
```

These are the fields most likely to be used for filtering and lookups.

---

# 76. Data Deletion

Avoid immediately deleting:

```text
customers
payments
published invitations
templates already in use
```

Prefer:

```text
archived
disabled
inactive
```

for operational data.

Hard deletion should mainly be used for:

* Temporary uploads.
* Invalid test data.
* Unused library items where no foreign references exist.

---

# 77. Invitation Sections: Future Extensibility

If later you want completely dynamic invitation pages, introduce:

```text
invitation_sections
```

Example:

```text
hero
question
locations
food
date
dress_code
final
```

But this is not necessary for V1 because your existing React application already has known invitation screens.

Do not over-engineer this before necessary.

---

# 78. System Settings

Useful settings:

```text
default_currency

default_invitation_price

support_phone

support_email

max_customer_media

default_template_id

maintenance_mode
```

Store using `system_settings`.

---

# 79. Error Cases

## Payment not completed

Trying to activate account:

```text
403 / 409

PAYMENT_REQUIRED
```

---

## Invitation belongs to another customer

Return:

```text
404
```

rather than revealing that another customer's record exists.

---

## Slug already exists

Generate another suffix.

---

## Suspended account

Login response:

```text
ACCOUNT_SUSPENDED
```

---

## Unpublished invitation

Public API:

```text
404
```

---

# 80. Recommended Backend Development Order

## Phase 1 — Foundation

Build:

```text
Node.js project
Environment configuration
MySQL
Database pool
Error handler
Logging
Validation
Authentication
Roles
```

---

## Phase 2 — Landing Request

Build:

```text
customers
customer_requests
public request API
admin email notification
```

Test complete flow.

---

## Phase 3 — Admin Request Management

Build:

```text
Admin login
Requests list
Request details
Status management
```

---

## Phase 4 — Payments

Build:

```text
Payment record
Mark as paid
Payment history
Audit
```

---

## Phase 5 — Account Activation

Build:

```text
Customer account
Temporary password
First-login password replacement
Suspension
Password reset
```

---

## Phase 6 — Invitation Core

Build:

```text
invitations
invitation_content
templates
themes
public IDs
slugs
```

---

## Phase 7 — Libraries

Build:

```text
Locations
Food
GIF Library
Media Assets
Media Uploads
```

---

## Phase 8 — Invitation Builder API

Build:

```text
Invitation editing
Content editing
Template application
Locations
Food
Media
Date/time
Dress code
Theme
```

---

## Phase 9 — Existing React Wiring

Remove hardcoded:

```text
locations
foods
GIFs
texts
dates
dress code
theme configuration
```

Replace with backend responses.

This is exactly the architectural transition from hardcoded data to API-supplied invitation configuration envisioned in the original product discussion.

---

## Phase 10 — Publishing

Build:

```text
Preview
Publish validation
Public endpoint
Slug routing
Unpublish
```

---

## Phase 11 — Analytics

Build:

```text
View events
Interaction events
Dashboard counts
```

---

## Phase 12 — Production Hardening

Complete:

```text
Rate limiting
Security headers
File validation
Backups
Logging
Monitoring
CORS
HTTPS
Audit checks
Permission tests
```

---

# 81. V1 Acceptance Criteria

The system is V1-ready when:

### Landing

* Visitor can submit request.
* Admin receives notification.
* Request appears in admin dashboard.

### Payment

* Admin can record manual payment.
* Unpaid customer cannot be activated.
* Paid customer can be activated.

### Authentication

* Account can be created.
* Temporary password works.
* Customer must change first password.
* Customer can log out.
* Customer cannot access another account.

### Invitation Builder

* Customer can edit text.
* Customer can choose template.
* Customer can select locations.
* Customer can select food.
* Customer can choose GIFs.
* Customer can upload images/GIFs.
* Customer can set date/time.
* Customer can set dress code.
* Customer can preview.

### Publishing

* Draft is private.
* Published invitation is publicly accessible.
* Unique slug works.
* Unpublishing removes public access.

### Admin

* Admin can manage requests.
* Admin can manage customers.
* Admin can manage payments.
* Admin can manage invitation libraries.
* Admin can reset/suspend accounts.

---

# 82. Explicitly Out of Scope for V1

Do not build these unless required:

```text
Online payment gateways
Subscriptions
Automatic recurring billing
Multiple subscription tiers
Marketplace
Customer-to-customer invitations
Mobile application
Multi-tenant organizations
Advanced CRM
AI invitation generation
Real-time collaboration
Multi-user customer accounts
Complex dynamic page builder
```

These can be introduced later without replacing the proposed architecture.

---

# 83. Future V2

Potential V2 capabilities:

```text
Self-service registration
Automatic online payments
Subscription packages
Invitation credits
Custom domains
Multiple invitations per subscription
Coupon system
Advanced analytics
Custom template creator
Video uploads
Music
WhatsApp sharing integration
QR codes
Guest RSVP database
Guest lists
Multiple recipients
Arabic / English invitation variants
Invitation expiration
Password-protected invitations
```

---

# 84. Final Architecture Summary

The complete V1 should operate as:

```text
CUSTOMER
   │
   ▼
LANDING PAGE
   │
   ▼
REQUEST
   │
   ▼
ADMIN EMAIL
   │
   ▼
ADMIN DASHBOARD
   │
   ▼
MANUAL CUSTOMER CONTACT
   │
   ▼
MANUAL PAYMENT
   │
   ▼
MARK AS PAID
   │
   ▼
CREATE ACCOUNT
   │
   ▼
TEMPORARY CREDENTIALS
   │
   ▼
CUSTOMER LOGIN
   │
   ▼
INVITATION BUILDER
   │
   ├── Template
   ├── Theme
   ├── Text
   ├── GIFs
   ├── Images
   ├── Locations
   ├── Food
   ├── Date
   └── Dress Code
   │
   ▼
PREVIEW
   │
   ▼
PUBLISH
   │
   ▼
UNIQUE URL
   │
   ▼
PUBLIC REACT RENDERER
```

---

# 85. Core Technical Principle

The most important architectural principle is:

> One invitation frontend, unlimited invitation configurations.

You should **not** create a separate React page or separate source code for every customer.

Instead:

```text
Invitation A
       \
Invitation B
        \
Invitation C
         \
          → MySQL
               ↓
           Node.js API
               ↓
       Invitation Configuration
               ↓
        Same React Renderer
```

This gives you one maintainable application while allowing every invitation to have different:

```text
recipient
text
GIFs
images
locations
food
date
time
dress code
colors
template
final message
```

## The existing product discussion already established these libraries and database-driven configuration concepts for locations, food, GIFs, images and editable content.

# 86. Recommended Final V1 Technology Stack

```text
FRONTEND
React
Vite
React Router
React Query

BACKEND
Node.js
Express.js

DATABASE
MySQL 8+

AUTHENTICATION
JWT Access Tokens
Refresh Sessions
Argon2/Bcrypt Password Hashing

VALIDATION
Zod

FILE STORAGE
S3-compatible object storage

EMAIL
Transactional SMTP/API provider

DEPLOYMENT
Ubuntu Server
Nginx
PM2 or Docker
HTTPS

SECURITY
Helmet
CORS
Rate Limiting
Prepared SQL Queries
Ownership Validation
Role Authorization
Audit Logging
```

---

# 87. Final V1 Scope

The V1 product is therefore:

**Public Request + Admin Lead Management + Manual Payment Approval + Customer Login + Invitation Builder + Reusable Templates/Libraries + Media Uploads + Existing React Invitation Renderer + Publishing + Basic Analytics.**

This provides a solid enough foundation to launch and sell invitations manually without forcing you to build a complete self-service SaaS or online-payment infrastructure before validating the business.
