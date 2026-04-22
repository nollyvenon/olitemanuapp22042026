# OMCLTA — Production ERP System

**Enterprise Resource Planning system** for manufacturing with strict financial integrity, regulatory audit trails, and multi-role workflows.

## Tech Stack

- **Backend**: Laravel 11 + PostgreSQL + Redis
- **Frontend**: Next.js App Router + TypeScript + Tailwind
- **Queue**: BullMQ (Redis-backed)
- **Authentication**: JWT (HS256) + Device Fingerprinting + GPS Validation
- **Audit**: Immutable audit logs with before/after snapshots
- **Deployment**: Docker + Docker Compose

## Features

### Authentication & Security
- 🔐 JWT tokens (8hr access, 30day refresh)
- 📍 GPS-based login enforcement with IP fallback
- 🖥️ Device fingerprinting via SubtleCrypto
- 🛡️ RBAC with DAG group inheritance
- 🔍 Immutable audit logging on all actions

### Core Modules
1. **AUTH** - Users, groups, permissions, sessions
2. **SALES** - Customers, orders, invoices
3. **INVENTORY** - Categories, items, stock ledger, movements
4. **ACCOUNTS** - Ledgers, vouchers, price lists, territories
5. **KYC** - Customer onboarding, approval workflow
6. **REPORTING** - Inventory (opening/inwards/outwards/closing), sales, ledger
7. **AUDIT** - Full action trail with user/timestamp/before/after
8. **NOTIFICATIONS** - Event-driven real-time alerts
9. **MARKET INTELLIGENCE** - Trends, competitor analysis, customer segments

## Folder Structure

```
omclta/
├── backend/                          # Laravel API
│   ├── app/
│   │   ├── Models/                  # Eloquent models
│   │   ├── Modules/                 # Modular structure
│   │   │   ├── Auth/
│   │   │   ├── Sales/
│   │   │   ├── Inventory/
│   │   │   ├── Accounts/
│   │   │   ├── Kyc/
│   │   │   ├── Reporting/
│   │   │   ├── Audit/
│   │   │   ├── Notifications/
│   │   │   └── MarketIntelligence/
│   │   ├── Observers/               # Model observers for audit
│   │   ├── Events/                  # Broadcasting events
│   │   └── Listeners/               # Event listeners
│   ├── database/
│   │   ├── migrations/              # Schema (10 files)
│   │   └── seeders/
│   ├── config/
│   │   ├── cache.php               # Redis caching
│   │   ├── queue.php               # BullMQ/Redis queues
│   │   └── auth.php                # JWT config
│   ├── routes/api.php              # All API routes (v1)
│   ├── .env.example                # Environment template
│   └── Dockerfile
├── frontend/                        # Next.js 15 app
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/login/
│   │   │   ├── (dashboard)/
│   │   │   ├── admin/
│   │   │   └── api/
│   │   ├── components/
│   │   ├── store/
│   │   ├── hooks/
│   │   └── lib/
│   ├── .env.example
│   └── Dockerfile
├── docker-compose.yml
├── DEPLOYMENT.md
└── README.md
```

## Quick Start

```bash
# Setup
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker-compose up -d
docker-compose exec backend php artisan migrate --seed

# Access
API: http://localhost:8000
App: http://localhost:3000
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for production setup.

## License
Proprietary — Onyx Group Studios
