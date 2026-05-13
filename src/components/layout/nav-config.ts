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
    label: 'Inventory',
    items: [
      {
        label: 'Items',
        href: '/dashboard/inventory/items',
        icon: Package,
        permission: 'inventory.products.read',
      },
      {
        label: 'Categories',
        href: '/dashboard/inventory/categories',
        icon: Tag,
        permission: 'inventory.products.read',
      },
      {
        label: 'Groups',
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
        label: 'Journals',
        href: '/dashboard/inventory/journals',
        icon: BookOpen,
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
    label: 'Account Center',
    items: [
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
        label: 'Price Lists',
        href: '/dashboard/accounts/price-lists',
        icon: DollarSign,
        permission: 'accounts.ledger.read',
      },
      {
        label: 'Override / Adjustment',
        href: '/dashboard/accounts/override',
        icon: Scale,
        permission: 'accounts.ledger.read',
      },
      {
        label: 'KYC for trading',
        href: '/dashboard/accounts/kyc-trading',
        icon: UserCheck,
        permission: 'accounts.ledger.read',
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
