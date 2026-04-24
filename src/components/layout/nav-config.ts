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
  UserCog,
  Group,
  User,
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
    items: [{ label: 'Dashboard', href: '/overview', icon: LayoutDashboard }],
  },
  {
    label: 'Sales',
    items: [
      {
        label: 'Orders',
        href: '/sales/orders',
        icon: ShoppingCart,
        permission: 'sales.orders.read',
      },
      {
        label: 'Invoices',
        href: '/sales/invoices',
        icon: FileText,
        permission: 'sales.invoices.read',
      },
      {
        label: 'Approved Orders',
        href: '/sales/approved-orders',
        icon: CheckSquare,
        permission: 'sales.orders.read',
      },
    ],
  },
  {
    label: 'Inventory',
    items: [
      {
        label: 'Items',
        href: '/inventory/items',
        icon: Package,
        permission: 'inventory.products.read',
      },
      {
        label: 'Categories',
        href: '/inventory/categories',
        icon: Tag,
        permission: 'inventory.products.read',
      },
      {
        label: 'Groups',
        href: '/inventory/groups',
        icon: Layers,
        permission: 'inventory.products.read',
      },
      {
        label: 'Store Centers',
        href: '/inventory/store-centers',
        icon: Warehouse,
        permission: 'inventory.products.read',
      },
      {
        label: 'Journals',
        href: '/inventory/journals',
        icon: BookOpen,
        permission: 'inventory.stock.movement',
      },
      {
        label: 'Stock Movements',
        href: '/inventory/stock-movements',
        icon: ArrowLeftRight,
        permission: 'inventory.stock.movement',
      },
    ],
  },
  {
    label: 'Accounts',
    items: [
      {
        label: 'Debtors',
        href: '/accounts/debtors',
        icon: Users,
        permission: 'accounts.ledger.read',
      },
      {
        label: 'Creditors',
        href: '/accounts/creditors',
        icon: CreditCard,
        permission: 'accounts.ledger.read',
      },
      {
        label: 'Vouchers',
        href: '/accounts/vouchers',
        icon: Receipt,
        permission: 'accounts.voucher.read',
      },
      {
        label: 'Price Lists',
        href: '/accounts/price-lists',
        icon: DollarSign,
        permission: 'accounts.ledger.read',
      },
    ],
  },
  {
    label: 'KYC',
    items: [
      {
        label: 'Applications',
        href: '/kyc/applications',
        icon: UserCheck,
        permission: 'kyc.read',
      },
      {
        label: 'Pending',
        href: '/kyc/pending',
        icon: UserCheck,
        permission: 'kyc.read',
      },
      {
        label: 'Approved',
        href: '/kyc/approved',
        icon: CheckSquare,
        permission: 'kyc.read',
      },
      {
        label: 'Rejected',
        href: '/kyc/rejected',
        icon: Shield,
        permission: 'kyc.read',
      },
    ],
  },
  {
    label: 'Reports',
    items: [
      {
        label: 'Overview',
        href: '/reports',
        icon: BarChart2,
        permission: 'reports.inventory',
      },
      {
        label: 'Inventory',
        href: '/reports/inventory',
        icon: FileBarChart,
        permission: 'reports.inventory',
      },
      {
        label: 'Movements',
        href: '/reports/movements',
        icon: TrendingUp,
        permission: 'reports.inventory',
      },
      {
        label: 'Aging',
        href: '/reports/aging',
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
        href: '/admin/users',
        icon: UserCog,
        permission: 'admin.*',
      },
      {
        label: 'Roles',
        href: '/admin/roles',
        icon: Shield,
        permission: 'admin.*',
      },
      {
        label: 'Groups',
        href: '/admin/groups',
        icon: Group,
        permission: 'admin.*',
      },
      {
        label: 'Settings',
        href: '/admin/settings',
        icon: Settings,
        permission: 'admin.*',
      },
    ],
  },
  {
    items: [
      {
        label: 'Audit Logs',
        href: '/audit-logs',
        icon: ScrollText,
        permission: 'audit.read',
      },
      {
        label: 'My Profile',
        href: '/profile',
        icon: User,
      },
    ],
  },
];
