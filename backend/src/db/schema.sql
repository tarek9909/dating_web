-- =========================================================
-- COMPLETE 22-TABLE MYSQL SCHEMA FOR DIGITAL INVITATION PLATFORM
-- =========================================================

CREATE DATABASE IF NOT EXISTS invitation_platform
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE invitation_platform;

-- 1. CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(255) NOT NULL,
    status ENUM('lead', 'active', 'suspended', 'archived') NOT NULL DEFAULT 'lead',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_customers_email (email),
    KEY idx_customers_phone (phone),
    KEY idx_customers_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. USERS
CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    customer_id BIGINT UNSIGNED NULL,
    email VARCHAR(255) NOT NULL,
    username VARCHAR(100) NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'customer') NOT NULL,
    status ENUM('active', 'suspended', 'disabled') NOT NULL DEFAULT 'active',
    must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at DATETIME NULL,
    password_changed_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email),
    UNIQUE KEY uq_users_username (username),
    KEY idx_users_customer (customer_id),
    KEY idx_users_role_status (role, status),
    CONSTRAINT fk_users_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. CUSTOMER REQUESTS
CREATE TABLE IF NOT EXISTS customer_requests (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    customer_id BIGINT UNSIGNED NOT NULL,
    recipient_name VARCHAR(150) NOT NULL,
    notes TEXT NULL,
    status ENUM('new', 'contacted', 'awaiting_payment', 'paid', 'account_created', 'completed', 'cancelled') NOT NULL DEFAULT 'new',
    quoted_amount DECIMAL(10,2) NULL,
    quoted_currency CHAR(3) NULL DEFAULT 'USD',
    assigned_admin_user_id BIGINT UNSIGNED NULL,
    submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    contacted_at DATETIME NULL,
    completed_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_requests_customer (customer_id),
    KEY idx_requests_status (status),
    KEY idx_requests_admin (assigned_admin_user_id),
    KEY idx_requests_created (created_at),
    CONSTRAINT fk_requests_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    CONSTRAINT fk_requests_admin FOREIGN KEY (assigned_admin_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    request_id BIGINT UNSIGNED NOT NULL,
    customer_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    payment_method ENUM('cash', 'whish', 'bank_transfer', 'other') NOT NULL,
    status ENUM('pending', 'paid', 'refunded', 'cancelled') NOT NULL DEFAULT 'pending',
    reference_number VARCHAR(255) NULL,
    notes TEXT NULL,
    marked_paid_by BIGINT UNSIGNED NULL,
    paid_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_payments_request (request_id),
    KEY idx_payments_customer (customer_id),
    KEY idx_payments_status (status),
    CONSTRAINT fk_payments_request FOREIGN KEY (request_id) REFERENCES customer_requests(id) ON DELETE RESTRICT,
    CONSTRAINT fk_payments_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    CONSTRAINT fk_payments_admin FOREIGN KEY (marked_paid_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. REFRESH SESSIONS
CREATE TABLE IF NOT EXISTS user_sessions (
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
    CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. PASSWORD RESET TOKENS
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_password_reset_user (user_id),
    CONSTRAINT fk_password_reset_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. THEMES
CREATE TABLE IF NOT EXISTS themes (
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
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_themes_slug (slug),
    KEY idx_themes_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. TEMPLATES
CREATE TABLE IF NOT EXISTS templates (
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
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_templates_slug (slug),
    KEY idx_templates_theme (theme_id),
    KEY idx_templates_active_sort (active, sort_order),
    CONSTRAINT fk_templates_theme FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. TEMPLATE CONTENT
CREATE TABLE IF NOT EXISTS template_content (
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
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_template_content_template (template_id),
    CONSTRAINT fk_template_content_template FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. INVITATIONS
CREATE TABLE IF NOT EXISTS invitations (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    public_id CHAR(26) NOT NULL,
    customer_id BIGINT UNSIGNED NOT NULL,
    created_by_user_id BIGINT UNSIGNED NULL,
    template_id BIGINT UNSIGNED NULL,
    theme_id BIGINT UNSIGNED NULL,
    internal_title VARCHAR(255) NULL,
    slug VARCHAR(180) NOT NULL,
    recipient_name VARCHAR(150) NOT NULL,
    date_type ENUM('exact', 'tomorrow', 'custom_text', 'tbd') NOT NULL DEFAULT 'tbd',
    schedule_mode ENUM('strict', 'picker') NOT NULL DEFAULT 'strict',
    date_value DATE NULL,
    date_text VARCHAR(255) NULL,
    time_value TIME NULL,
    timezone VARCHAR(100) NOT NULL DEFAULT 'Asia/Beirut',
    dress_code VARCHAR(150) NULL,
    dress_code_text TEXT NULL,
    status ENUM('draft', 'published', 'unpublished', 'archived') NOT NULL DEFAULT 'draft',
    published_at DATETIME NULL,
    is_claimed BOOLEAN NOT NULL DEFAULT FALSE,
    claimed_at DATETIME NULL,
    claimed_payload JSON NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_invitations_public_id (public_id),
    UNIQUE KEY uq_invitations_slug (slug),
    KEY idx_invitations_customer (customer_id),
    KEY idx_invitations_status (status),
    KEY idx_invitations_template (template_id),
    CONSTRAINT fk_invitations_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    CONSTRAINT fk_invitations_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_invitations_template FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE SET NULL,
    CONSTRAINT fk_invitations_theme FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. INVITATION CONTENT
CREATE TABLE IF NOT EXISTS invitation_content (
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
    location_subtitle TEXT NULL,
    category_type VARCHAR(50) NOT NULL DEFAULT 'food',
    food_title VARCHAR(255) NULL,
    food_subtitle TEXT NULL,
    when_title VARCHAR(255) NULL,
    when_subtitle TEXT NULL,
    dress_code_title VARCHAR(255) NULL,
    dress_code_subtitle TEXT NULL,
    dress_code_checklist JSON NULL,
    opening_gif VARCHAR(500) NULL,
    angry_gif VARCHAR(500) NULL,
    when_gif VARCHAR(500) NULL,
    dress_gif VARCHAR(500) NULL,
    final_gif VARCHAR(500) NULL,
    final_title VARCHAR(255) NULL,
    final_message TEXT NULL,
    picker_start_time VARCHAR(50) NULL,
    picker_end_time VARCHAR(50) NULL,
    theme_accent_color VARCHAR(30) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_invitation_content_invitation (invitation_id),
    CONSTRAINT fk_invitation_content_invitation FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. LOCATIONS
CREATE TABLE IF NOT EXISTS locations (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(180) NOT NULL,
    category VARCHAR(120) NULL,
    description TEXT NULL,
    emoji VARCHAR(30) NULL,
    image_url VARCHAR(1000) NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_locations_active_sort (active, sort_order),
    KEY idx_locations_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. INVITATION LOCATIONS
CREATE TABLE IF NOT EXISTS invitation_locations (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    invitation_id BIGINT UNSIGNED NOT NULL,
    location_id BIGINT UNSIGNED NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    custom_name VARCHAR(180) NULL,
    custom_tag VARCHAR(100) NULL,
    custom_description TEXT NULL,
    custom_image_url VARCHAR(1000) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_invitation_location (invitation_id, location_id),
    KEY idx_inv_locations_sort (invitation_id, sort_order),
    CONSTRAINT fk_inv_locations_invitation FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE,
    CONSTRAINT fk_inv_locations_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. FOOD OPTIONS
CREATE TABLE IF NOT EXISTS food_options (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(180) NOT NULL,
    description TEXT NULL,
    emoji VARCHAR(30) NULL,
    image_url VARCHAR(1000) NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_food_active_sort (active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. INVITATION FOOD OPTIONS
CREATE TABLE IF NOT EXISTS invitation_food_options (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    invitation_id BIGINT UNSIGNED NOT NULL,
    food_option_id BIGINT UNSIGNED NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    custom_name VARCHAR(180) NULL,
    custom_tag VARCHAR(100) NULL,
    custom_description TEXT NULL,
    custom_image_url VARCHAR(1000) NULL,
    custom_emoji VARCHAR(30) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_invitation_food (invitation_id, food_option_id),
    KEY idx_inv_food_sort (invitation_id, sort_order),
    CONSTRAINT fk_inv_food_invitation FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE,
    CONSTRAINT fk_inv_food_option FOREIGN KEY (food_option_id) REFERENCES food_options(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. MEDIA ASSETS
CREATE TABLE IF NOT EXISTS media_assets (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    customer_id BIGINT UNSIGNED NULL,
    invitation_id BIGINT UNSIGNED NULL,
    uploaded_by_user_id BIGINT UNSIGNED NULL,
    visibility ENUM('global', 'customer_private', 'invitation_private') NOT NULL,
    media_type ENUM('image', 'gif') NOT NULL,
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
    CONSTRAINT fk_media_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT fk_media_invitation FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE,
    CONSTRAINT fk_media_uploader FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. GLOBAL GIF LIBRARY
CREATE TABLE IF NOT EXISTS gif_library (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    media_asset_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(180) NOT NULL,
    category ENUM('romantic', 'funny', 'angry', 'dramatic', 'flirty', 'cute', 'celebration', 'chaotic', 'other') NOT NULL DEFAULT 'other',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_gif_library_media (media_asset_id),
    KEY idx_gif_category (category),
    KEY idx_gif_active_sort (active, sort_order),
    CONSTRAINT fk_gif_media FOREIGN KEY (media_asset_id) REFERENCES media_assets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. INVITATION MEDIA ASSIGNMENTS
CREATE TABLE IF NOT EXISTS invitation_media (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    invitation_id BIGINT UNSIGNED NOT NULL,
    media_asset_id BIGINT UNSIGNED NOT NULL,
    slot ENUM('hero', 'no_reaction_1', 'no_reaction_2', 'no_reaction_3', 'angry', 'yes_reaction', 'final', 'background') NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_invitation_media_slot (invitation_id, slot),
    KEY idx_inv_media_asset (media_asset_id),
    CONSTRAINT fk_inv_media_invitation FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE,
    CONSTRAINT fk_inv_media_asset FOREIGN KEY (media_asset_id) REFERENCES media_assets(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. INVITATION EVENTS / ANALYTICS
CREATE TABLE IF NOT EXISTS invitation_events (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    invitation_id BIGINT UNSIGNED NOT NULL,
    event_type ENUM('view', 'yes_click', 'no_click', 'location_select', 'food_select', 'date_select', 'share_click', 'rsvp_complete', 'button_click', 'restart_click') NOT NULL,
    session_key VARCHAR(100) NULL,
    ip_hash CHAR(64) NULL,
    user_agent VARCHAR(500) NULL,
    event_data JSON NULL,
    occurred_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_events_invitation (invitation_id, occurred_at),
    KEY idx_events_type (event_type, occurred_at),
    CONSTRAINT fk_events_invitation FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. AUDIT LOG
CREATE TABLE IF NOT EXISTS audit_logs (
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
    KEY idx_audit_entity (entity_type, entity_id),
    KEY idx_audit_created (created_at),
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. EMAIL OUTBOX
CREATE TABLE IF NOT EXISTS email_outbox (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    recipient_email VARCHAR(255) NOT NULL,
    template_name VARCHAR(150) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    payload JSON NULL,
    status ENUM('pending', 'sent', 'failed') NOT NULL DEFAULT 'pending',
    attempts INT UNSIGNED NOT NULL DEFAULT 0,
    last_error TEXT NULL,
    sent_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_email_status (status),
    KEY idx_email_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. SYSTEM SETTINGS
CREATE TABLE IF NOT EXISTS system_settings (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    setting_key VARCHAR(150) NOT NULL,
    setting_value JSON NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_settings_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
