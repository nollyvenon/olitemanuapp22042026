# GOD MODE ADMIN SYSTEM

## Overview

GOD MODE provides absolute system-level authority with complete audit traceability and data immutability. Every action is logged to `god_mode_actions` table with full context (before/after state, device, IP, reason).

## Setup

### 1. Run Migration

```bash
php artisan migrate
```

This creates:
- `god_mode_actions` — logs all god admin actions
- `god_mode_confirmations` — tracks high-risk action confirmations
- Adds `is_god_admin` column to `users` table

### 2. Seed God Admins (Optional)

```bash
php artisan db:seed --class=GodAdminSeeder
```

Creates:
- `godadmin1@omclta.com` / `GodAdmin@123456`
- `godadmin2@omclta.com` / `GodAdmin@123456`

### 3. Enable on User

```bash
# Via SQL
UPDATE users SET is_god_admin = true WHERE email = 'user@example.com';

# Or via API
PATCH /api/v1/users/{id}
{ "is_god_admin": true }
```

---

## High-Risk Actions (Require Confirmation)

These actions require a second god admin to confirm within 24 hours:

1. **SUSPEND_USER** — Revoke all user sessions + mark inactive
2. **DELETE_LEDGER** — Remove ledger account
3. **FORCE_STOCK_NEGATIVE** — Override inventory balance below zero
4. **PRICE_OVERRIDE_MAJOR** — Increase/decrease price by >20%

Flow:
1. GOD ADMIN 1 calls `POST /api/v1/god-admin/override` with high-risk action
2. Receive `{confirmation_id, requires_confirmation: true, status: 'pending'}`
3. GOD ADMIN 2 calls `POST /api/v1/god-admin/confirmations/{confirmation_id}/confirm`
4. System executes the action, logs to `god_mode_actions`

---

## API Endpoints

### 1. Override (General Purpose)

```http
POST /api/v1/god-admin/override
Content-Type: application/json

{
  "action_type": "PRICE_OVERRIDE",
  "module": "SALES",
  "affected_entity_id": "uuid",
  "affected_entity_type": "Order",
  "previous_state": { "status": "DRAFT", "total": 5000 },
  "new_state": { "status": "DRAFT", "total": 4500 },
  "reason": "Customer special discount approved by CFO",
  "device_id": "uuid-optional",
  "ip_address": "127.0.0.1-optional"
}
```

**Response (non-high-risk):**
```json
{
  "action_id": "uuid",
  "status": "completed",
  "action_type": "PRICE_OVERRIDE"
}
```

**Response (high-risk):**
```json
{
  "confirmation_id": "uuid",
  "requires_confirmation": true,
  "status": "pending",
  "message": "High-risk action awaiting second god admin confirmation"
}
```

---

### 2. Confirm High-Risk Action

```http
POST /api/v1/god-admin/confirmations/{confirmation_id}/confirm
Content-Type: application/json

{
  "confirmation_id": "uuid"
}
```

**Response:**
```json
{
  "status": "confirmed",
  "confirmation_id": "uuid"
}
```

---

### 3. Impersonate User (1 hour)

```http
POST /api/v1/god-admin/impersonate
Content-Type: application/json

{
  "target_user_id": "uuid",
  "reason": "Investigating customer complaint about order history"
}
```

**Response:**
```json
{
  "impersonation_token": "eyJhbGc...",
  "expires_in": 3600,
  "target_user_id": "uuid"
}
```

**Usage:**
```bash
curl -H "Authorization: Bearer {impersonation_token}" \
  https://api.omclta.com/api/v1/orders
```

All actions while impersonated include `impersonated_user_id` in audit logs.

---

### 4. Force State Transition

```http
POST /api/v1/god-admin/force-transition
Content-Type: application/json

{
  "entity_type": "Order",
  "entity_id": "uuid",
  "new_state": "APPROVED",
  "reason": "Manual correction for stalled approval workflow"
}
```

**Response:**
```json
{
  "status": "transitioned",
  "entity_type": "Order",
  "entity_id": "uuid",
  "new_state": "APPROVED"
}
```

---

### 5. Suspend User (High-Risk)

```http
POST /api/v1/god-admin/suspend-user/{user_id}
Content-Type: application/json

{
  "reason": "Suspicious activity detected on account"
}
```

**Response:**
```json
{
  "status": "pending_confirmation",
  "user_id": "uuid",
  "message": "User suspension awaiting second god admin confirmation"
}
```

---

### 6. Unsuspend User

```http
POST /api/v1/god-admin/unsuspend-user/{user_id}
Content-Type: application/json

{
  "reason": "Investigation completed, account cleared"
}
```

**Response:**
```json
{
  "status": "unsuspended",
  "user_id": "uuid"
}
```

---

### 7. Override Price on Order

```http
POST /api/v1/god-admin/override-price
Content-Type: application/json

{
  "order_id": "uuid",
  "line_item_overrides": [
    { "line_item_id": "uuid", "new_price": 2500 },
    { "line_item_id": "uuid", "new_price": 1500 }
  ],
  "reason": "Volume discount applied retroactively per sales manager request"
}
```

**Response:**
```json
{
  "status": "overridden",
  "order_id": "uuid",
  "affected_items_count": 2
}
```

---

### 8. Override Inventory Balance (High-Risk)

```http
POST /api/v1/god-admin/override-inventory
Content-Type: application/json

{
  "item_id": "uuid",
  "location_id": "uuid",
  "new_balance": 500,
  "reason": "Physical count reconciliation: variance of 50 units due to damage"
}
```

**Response:**
```json
{
  "status": "overridden",
  "item_id": "uuid",
  "location_id": "uuid",
  "new_balance": 500
}
```

---

### 9. View Version History

```http
GET /api/v1/god-admin/version-history/{entityType}/{entityId}
```

**Example:**
```http
GET /api/v1/god-admin/version-history/Order/550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
{
  "entity_type": "Order",
  "entity_id": "uuid",
  "versions": [
    {
      "version_number": 3,
      "is_current": true,
      "created_at": "2026-04-23T10:15:30Z",
      "snapshot": { "status": "APPROVED", "total": 4500 }
    },
    {
      "version_number": 2,
      "is_current": false,
      "parent_id": "uuid",
      "created_at": "2026-04-23T09:45:20Z",
      "snapshot": { "status": "DRAFT", "total": 5000 }
    }
  ],
  "total_versions": 2
}
```

---

### 10. View GOD MODE Audit Log

```http
GET /api/v1/god-admin/audit-log?action_type=PRICE_OVERRIDE&module=SALES&start_date=2026-04-01&end_date=2026-04-30
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "god_admin_id": "uuid",
      "god_admin": { "email": "godadmin@omclta.com", "name": "God Admin" },
      "action_type": "PRICE_OVERRIDE",
      "module": "SALES",
      "affected_entity_type": "Order",
      "affected_entity_id": "uuid",
      "reason": "Volume discount retroactive",
      "previous_state": { "prices": { "item1": 5000 } },
      "new_state": { "prices": { "item1": 4500 } },
      "impersonated_user_id": null,
      "device_id": "uuid",
      "ip_address": "203.0.113.42",
      "created_at": "2026-04-23T10:15:30Z"
    }
  ],
  "pagination": { "current_page": 1, "total": 50, "per_page": 50 }
}
```

---

### 11. Export GOD MODE Audit Log

```http
POST /api/v1/god-admin/export-log
Content-Type: application/json

{
  "start_date": "2026-04-01",
  "end_date": "2026-04-30"
}
```

**Response:**
```json
{
  "download_url": "https://s3.amazonaws.com/bucket/exports/god_mode_audit_2026-04-23_101530.csv?X-Amz-Algorithm=...",
  "expires_in": 86400
}
```

CSV contains columns:
```
ID, God Admin, Action Type, Module, Entity Type, Entity ID, Reason, Created At
```

---

## Design Constraints

### Immutability
- All god mode actions are logged immutably to `god_mode_actions` table
- No update/delete of god mode action records
- SoftDeletes used only for audit compliance, not operational deletion

### Confirmation Workflow
- High-risk actions require confirmation from **different god admin**
- Original god admin **cannot confirm their own action**
- Confirmation must occur within **24 hours** or action expires (marked `cancelled`)
- No timeout extension mechanism

### Impersonation Isolation
- Impersonation creates **separate session** (not overwriting user's real session)
- Token marked `impersonated_session=true` in JWT claims
- Timeout: **1 hour** maximum
- All actions logged with `impersonated_user_id`

### Reason Field Rules
- Required on every action
- Max **500 characters** (short-form only)
- Must be non-empty and meaningful

### Version History
- All overridden entities retain **full version history**
- Can rollback to any prior version (creates new version pointing to snapshot)
- Version numbers monotonically increase

---

## Database Schema

### god_mode_actions
```sql
CREATE TABLE god_mode_actions (
  id UUID PRIMARY KEY,
  god_admin_id UUID REFERENCES users(id),
  action_type VARCHAR(255),           -- PRICE_OVERRIDE, SUSPEND_USER, etc.
  module VARCHAR(100),                -- SALES, AUTH, INVENTORY, etc.
  affected_entity_id UUID NULLABLE,
  affected_entity_type VARCHAR(100) NULLABLE,
  previous_state JSONB NULLABLE,      -- Full state before action
  new_state JSONB NULLABLE,           -- Full state after action
  reason TEXT,                        -- ≤500 chars, required
  impersonated_user_id UUID NULLABLE, -- If action done while impersonating
  device_id UUID NULLABLE,            -- Device where action initiated
  ip_address INET NULLABLE,           -- IP address of action initiator
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX god_mode_actions_admin_time ON god_mode_actions(god_admin_id, created_at);
CREATE INDEX god_mode_actions_entity ON god_mode_actions(affected_entity_type, affected_entity_id);
```

### god_mode_confirmations
```sql
CREATE TABLE god_mode_confirmations (
  id UUID PRIMARY KEY,
  god_admin_id UUID REFERENCES users(id),
  action_type VARCHAR(255),
  reason TEXT,                        -- ≤500 chars
  status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
  confirmed_by UUID NULLABLE REFERENCES users(id),
  confirmed_at TIMESTAMPTZ NULLABLE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX god_mode_confirmations_status_time ON god_mode_confirmations(status, created_at);
```

---

## Testing Workflow

### 1. Create Two God Admins
```bash
php artisan db:seed --class=GodAdminSeeder
```

### 2. Login as GOD ADMIN 1
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "godadmin1@omclta.com",
    "password": "GodAdmin@123456",
    "device_fingerprint": "test-device",
    "user_agent": "PostmanRuntime/7.0",
    "gps_source": "ip_fallback"
  }'
```

Save the `access_token`.

### 3. Initiate High-Risk Action (GOD ADMIN 1)
```bash
curl -X POST http://localhost:8000/api/v1/god-admin/override \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "action_type": "SUSPEND_USER",
    "module": "AUTH",
    "affected_entity_id": "{user_id}",
    "affected_entity_type": "User",
    "previous_state": {"is_active": true},
    "new_state": {"is_active": false},
    "reason": "Suspicious login activity"
  }'
```

Save the `confirmation_id` from response.

### 4. Login as GOD ADMIN 2
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "godadmin2@omclta.com",
    "password": "GodAdmin@123456",
    "device_fingerprint": "test-device-2",
    "user_agent": "PostmanRuntime/7.0",
    "gps_source": "ip_fallback"
  }'
```

Save the second `access_token`.

### 5. Confirm Action (GOD ADMIN 2)
```bash
curl -X POST http://localhost:8000/api/v1/god-admin/confirmations/{confirmation_id}/confirm \
  -H "Authorization: Bearer {access_token_2}" \
  -H "Content-Type: application/json" \
  -d '{
    "confirmation_id": "{confirmation_id}"
  }'
```

### 6. Verify Action Logged
```bash
curl -X GET http://localhost:8000/api/v1/god-admin/audit-log \
  -H "Authorization: Bearer {access_token}"
```

Should see `SUSPEND_USER` action with full audit trail.

---

## Security Notes

1. **No Audit Trail Gaps**: Every god mode action creates immutable record
2. **No Silent Failures**: High-risk actions fail explicitly if confirmations unavailable
3. **No Permission Bypass**: GOD MODE actions still logged under that god admin's identity
4. **No Lateral Movement**: Impersonation token separate from original session (no token hijacking)
5. **No Timestamp Falsification**: `created_at` set server-side, not client-controlled
