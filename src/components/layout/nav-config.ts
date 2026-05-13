import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  CheckSquare,
  Package,
  Tag,
  Layers,
  Warehouse,
  BookOpen,
  ArrowLeftRight,
  Users,
  CreditCard,
  Receipt,
  DollarSign,
  UserCheck,
  Shield,
  Settings,
  BarChart2,
  FileBarChart,
  TrendingUp,
  ScrollText,
  Scale,
  UserCog,
  Group,
  User,
  Brain,
  LineChart,
  HelpCircle,
  Sparkles,
  MapPin,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  permission?: string;
  badge?: string;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { label: 'Dashboard', href: '/dashboard/overview', icon: LayoutDashboard, permission: 'dashboard.read' },
      { label: 'AI Dashboard', href: '/dashboard/ai-dashboard', icon: Sparkles, permission: 'dashboard.ai' },
    ],
  },
  {
    label: 'Sales',
    items: [
      {
        label: 'Customers',
        href: '/dashboard/customers',
        icon: Users,
        permission: 'sales.customers.read',
      },
      {
        label: 'Orders',
        href: '/dashboard/sales/orders',
        icon: ShoppingCart,
        permission: 'sales.orders.read',
      },
      {
        label: 'Invoices',
        href: '/dashboard/sales/invoices',
        icon: FileText,
        permission: 'sales.invoices.read',
      },
      {
        label: 'Approved Orders',
        href: '/dashboard/sales/approved-orders',
        icon: CheckSquare,
        permission: 'sales.orders.read',
      },
      {
        label: 'Market',
        href: '/dashboard/market',
        icon: BarChart2,
        permission: 'sales.orders.read',
      },
    ],
  },
  {
    label: 'Stock Center',
    items: [
      {
        label: 'Stock Items',
        href: '/dashboard/inventory/items',
        icon: Package,
        permission: 'inventory.products.read',
      },
      {
        label: 'Stock Categories',
        href: '/dashboard/inventory/categories',
        icon: Tag,
        permission: 'inventory.products.read',
      },
      {
        label: 'Stock Groups',
        href: '/dashboard/inventory/groups',
        icon: Layers,
        permission: 'inventory.products.read',
      },
      {
        label: 'Store Centers',
        href: '/dashboard/inventory/store-centers',
        icon: Warehouse,
        permission: 'inventory.products.read',
      },
      {
        label: 'View Store Centers',
        href: '/dashboard/inventory/store-centers/view',
        icon: MapPin,
        permission: 'inventory.products.read',
      },
      {
        label: 'View Stock Journal',
        href: '/dashboard/inventory/journals/view',
        icon: BookOpen,
        permission: 'inventory.products.read',
      },
      {
        label: 'Create Stock Journal',
        href: '/dashboard/inventory/journals/create',
        icon: ScrollText,
        permission: 'inventory.stock.movement',
      },
      {
        label: 'Stock Movements',
        href: '/dashboard/inventory/stock-movements',
        icon: ArrowLeftRight,
        permission: 'inventory.stock.movement',
      },
    ],
  },
  {
    label: 'ACCOUNTS',
    items: [
      {
        label: 'Override / Adjustment',
        href: '/dashboard/accounts/override',
        icon: Scale,
        permission: 'accounts.ledger.read',
      },
      {
        label: 'Debtors',
        href: '/dashboard/accounts/debtors',
        icon: Users,
        permission: 'accounts.ledger.read',
      },
      {
        label: 'Creditors',
        href: '/dashboard/accounts/creditors',
        icon: CreditCard,
        permission: 'accounts.ledger.read',
      },
      {
        label: 'Vouchers',
        href: '/dashboard/accounts/vouchers',
        icon: Receipt,
        permission: 'accounts.voucher.read',
      },
      {
        label: 'Price Categories',
        href: '/dashboard/accounts/price-categories',
        icon: Tag,
        permission: 'accounts.price_categories.read',
      },
      {
        label: 'Territories',
        href: '/dashboard/accounts/territories',
        icon: MapPin,
        permission: 'accounts.territories.read',
      },
      {
        label: 'Receipts',
        href: '/dashboard/accounts/receipts',
        icon: Receipt,
        permission: 'accounts.receipts.read',
      },
      {
        label: 'Add Receipt',
        href: '/dashboard/accounts/receipts/create',
        icon: Receipt,
        permission: 'accounts.receipts.create',
      },
      {
        label: 'Credit Notes',
        href: '/dashboard/accounts/credit-notes',
        icon: CreditCard,
        permission: 'accounts.credit_notes.read',
      },
      {
        label: 'Add Credit Note',
        href: '/dashboard/accounts/credit-notes/create',
        icon: CreditCard,
        permission: 'accounts.credit_notes.create',
      },
      {
        label: 'Debit Notes',
        href: '/dashboard/accounts/debit-notes',
        icon: CreditCard,
        permission: 'accounts.debit_notes.read',
      },
      {
        label: 'Add Debit Note',
        href: '/dashboard/accounts/debit-notes/create',
        icon: CreditCard,
        permission: 'accounts.debit_notes.create',
      },
      {
        label: 'Discount Vouchers',
        href: '/dashboard/accounts/discounts',
        icon: DollarSign,
        permission: 'accounts.discount_vouchers.read',
      },
      {
        label: 'Add Discount Voucher',
        href: '/dashboard/accounts/discounts/create',
        icon: DollarSign,
        permission: 'accounts.discount_vouchers.create',
      },
      {
        label: 'Sales Reverses',
        href: '/dashboard/sales/sales-reverse',
        icon: ArrowLeftRight,
        permission: 'sales.sales_reverses.read',
      },
      {
        label: 'Create Sales Reverse',
        href: '/dashboard/sales/sales-reverse/create',
        icon: ArrowLeftRight,
        permission: 'sales.sales_reverses.create',
      },
    ],
  },
  {
    label: 'KYC',
    items: [
      {
        label: 'Applications',
        href: '/dashboard/kyc/applications',
        icon: UserCheck,
        permission: 'kyc.read',
      },
      {
        label: 'Pending',
        href: '/dashboard/kyc/pending',
        icon: UserCheck,
        permission: 'kyc.read',
      },
      {
        label: 'Approved',
        href: '/dashboard/kyc/approved',
        icon: CheckSquare,
        permission: 'kyc.read',
      },
      {
        label: 'Rejected',
        href: '/dashboard/kyc/rejected',
        icon: Shield,
        permission: 'kyc.read',
      },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      {
        label: 'Unified Intelligence',
        href: '/dashboard/intelligence/unified',
        icon: Brain,
        permission: 'analytics.read',
      },
      {
        label: 'Forecasts',
        href: '/dashboard/intelligence/forecasts',
        icon: LineChart,
        permission: 'analytics.read',
      },
      {
        label: 'AI Insights',
        href: '/dashboard/intelligence/ai-insights',
        icon: Brain,
        permission: 'analytics.read',
      },
      {
        label: 'Reporting Hub',
        href: '/dashboard/intelligence',
        icon: Brain,
        permission: 'analytics.read',
      },
      {
        label: 'Sales',
        href: '/dashboard/intelligence/sales',
        icon: TrendingUp,
        permission: 'analytics.read',
      },
      {
        label: 'Collections',
        href: '/dashboard/intelligence/collections',
        icon: DollarSign,
        permission: 'analytics.read',
      },
      {
        label: 'Inventory',
        href: '/dashboard/intelligence/inventory',
        icon: Package,
        permission: 'analytics.read',
      },
      {
        label: 'Performance',
        href: '/dashboard/intelligence/performance',
        icon: Users,
        permission: 'analytics.read',
      },
      {
        label: 'Revenue',
        href: '/dashboard/intelligence/revenue',
        icon: DollarSign,
        permission: 'analytics.read',
      },
      {
        label: 'Inventory',
        href: '/dashboard/intelligence/inventory-intelligence',
        icon: Package,
        permission: 'analytics.read',
      },
      {
        label: 'Accounts Risk',
        href: '/dashboard/intelligence/accounts-risk',
        icon: CreditCard,
        permission: 'analytics.read',
      },
      {
        label: 'Sales Performance',
        href: '/dashboard/intelligence/sales-performance',
        icon: TrendingUp,
        permission: 'analytics.read',
      },
    ],
  },
  {
    label: 'Reports',
    items: [
      {
        label: 'Overview',
        href: '/dashboard/reports',
        icon: BarChart2,
        permission: 'reports.inventory',
      },
      {
        label: 'Inventory',
        href: '/dashboard/reports/inventory',
        icon: FileBarChart,
        permission: 'reports.inventory',
      },
      {
        label: 'Movements',
        href: '/dashboard/reports/movements',
        icon: TrendingUp,
        permission: 'reports.inventory',
      },
      {
        label: 'Aging',
        href: '/dashboard/reports/aging',
        icon: TrendingUp,
        permission: 'reports.accounts',
      },
    ],
  },
  {
    label: 'Admin',
    items: [
      {
        label: 'Users',
        href: '/dashboard/admin/users',
        icon: UserCog,
        permission: 'admin.*',
      },
      {
        label: 'User groups & permissions',
        href: '/dashboard/admin/groups',
        icon: Shield,
        permission: 'admin.*',
      },
      {
        label: 'Audit Reports',
        href: '/dashboard/admin/audit-reports',
        icon: ScrollText,
        permission: 'admin.*',
      },
      {
        label: 'Settings',
        href: '/dashboard/admin/settings',
        icon: Settings,
        permission: 'admin.*',
      },
      {
        label: 'AI Settings',
        href: '/dashboard/admin/ai-settings',
        icon: Brain,
        permission: 'admin.*',
      },
    ],
  },
  {
    label: 'Help',
    items: [
      {
        label: 'Manual',
        href: '/dashboard/manual',
        icon: HelpCircle,
      },
      {
        label: 'Audit Logs',
        href: '/dashboard/audit-logs',
        icon: ScrollText,
        permission: 'audit.read',
      },
      {
        label: 'My Profile',
        href: '/dashboard/profile',
        icon: User,
      },
    ],
  },
];
