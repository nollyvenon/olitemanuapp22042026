import os
from dotenv import load_dotenv
import psycopg2
import bcrypt
import uuid
from datetime import datetime

# Load environment variables from .env file
load_dotenv(dotenv_path='.env')

db_name = os.getenv('DB_DATABASE')
db_user = os.getenv('DB_USERNAME')
db_password = os.getenv('DB_PASSWORD')
db_host = os.getenv('DB_HOST', 'localhost')
db_port = int(os.getenv('DB_PORT', 5432))

conn = psycopg2.connect(
    dbname=db_name,
    user=db_user,
    password=db_password,
    host=db_host,
    port=db_port
)
cur = conn.cursor()

now = datetime.now()

# Ensure is_god_admin column exists in users table
cur.execute("""
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='users' AND column_name='is_god_admin'
    ) THEN
        ALTER TABLE users ADD COLUMN is_god_admin BOOLEAN DEFAULT FALSE;
    END IF;
END$$;
""")

# 1. Create tables (add UNIQUE to locations.name, add is_god_admin to users)
cur.execute("""
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_sub_admin BOOLEAN DEFAULT FALSE,
    is_god_admin BOOLEAN DEFAULT FALSE,
    force_password_reset BOOLEAN DEFAULT FALSE,
    created_by UUID NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    address TEXT,
    city VARCHAR(255),
    state VARCHAR(255),
    country VARCHAR(255),
    lat DECIMAL,
    long DECIMAL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    module VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    created_by UUID,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
""")

# 2. Insert locations
locations = [
    {'name': 'Lagos HQ', 'address': 'Lagos, Nigeria', 'city': 'Lagos', 'country': 'Nigeria', 'lat': 6.5244, 'long': 3.3792},
    {'name': 'Abuja Office', 'address': 'Abuja, Nigeria', 'city': 'Abuja', 'country': 'Nigeria', 'lat': 9.0765, 'long': 7.3986},
    {'name': 'Port Harcourt', 'address': 'Port Harcourt, Nigeria', 'city': 'Port Harcourt', 'country': 'Nigeria', 'lat': 4.8156, 'long': 7.0498},
]
for loc in locations:
    cur.execute("""
        INSERT INTO locations (id, name, address, city, country, lat, long, is_active, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, TRUE, %s, %s)
        ON CONFLICT (name) DO NOTHING
    """, (str(uuid.uuid4()), loc['name'], loc['address'], loc['city'], loc['country'], loc['lat'], loc['long'], now, now))

# 3. Insert permissions (add all from your seeder)
permissions = [
    {'name': 'users.read', 'module': 'auth'},
    {'name': 'users.create', 'module': 'auth'},
    # ... add all others from AuthSeeder
]
for perm in permissions:
    cur.execute("""
        INSERT INTO permissions (id, name, module)
        VALUES (%s, %s, %s)
        ON CONFLICT (name) DO NOTHING
    """, (str(uuid.uuid4()), perm['name'], perm['module']))

# 4. Insert users (add all from your seeders)
def insert_user(name, email, password, is_active=True, is_sub_admin=False, is_god_admin=False):
    user_id = str(uuid.uuid4())
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    cur.execute("""
        INSERT INTO users (id, name, email, password_hash, is_active, is_sub_admin, is_god_admin, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (email) DO NOTHING
    """, (user_id, name, email, password_hash, is_active, is_sub_admin, is_god_admin, now, now))

insert_user("System Admin", "superadmin@omclta.com", "Admin@123456", True, False, False)
insert_user("God Admin 1", "godadmin1@omclta.com", "GodAdmin@123456", True, False, True)
insert_user("Sales Manager", "sales.manager@omclta.com", "SalesMgr@123", True, False, False)
insert_user("Store Manager", "storemanager@omclta.com", "StoreMgr@123", True, False, False)

# 5. Insert customers (example from DemoDataSeeder)
customers = [
    {'name': 'Dangote Group', 'email': 'contact@dangote.com', 'phone': '0800111111'},
    {'name': 'BUA Group', 'email': 'contact@bua.com', 'phone': '0800222222'},
    {'name': 'MTN Nigeria', 'email': 'procurement@mtn.com', 'phone': '0800333333'},
]
for cust in customers:
    cur.execute("""
        INSERT INTO customers (id, name, email, phone, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT (email) DO NOTHING
    """, (str(uuid.uuid4()), cust['name'], cust['email'], cust['phone'], now, now))

# ...repeat for groups, group_permissions, user_groups, etc.

conn.commit()
cur.close()
conn.close()

print("All tables created and seed data inserted (if not present).")