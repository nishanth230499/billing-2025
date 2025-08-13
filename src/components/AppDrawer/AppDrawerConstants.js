import BackspaceIcon from '@mui/icons-material/Backspace'
import BusinessIcon from '@mui/icons-material/Business'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'
import GroupIcon from '@mui/icons-material/Group'
import HistoryIcon from '@mui/icons-material/History'
import InventoryIcon from '@mui/icons-material/Inventory'
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'
import ReceiptIcon from '@mui/icons-material/Receipt'
import RequestQuoteIcon from '@mui/icons-material/RequestQuote'
import { FaFileInvoice } from 'react-icons/fa'
import { FaRegListAlt } from 'react-icons/fa'
import { FaSchoolFlag } from 'react-icons/fa6'
import { IoDocumentsOutline } from 'react-icons/io5'
import { LuPackagePlus } from 'react-icons/lu'
import { SiBookstack } from 'react-icons/si'
import { TbDatabaseEdit } from 'react-icons/tb'

import routes from '@/constants/routeConstants'

export const appDrawerItems = [
  {
    key: 'Customer',
    icon: FaSchoolFlag,
    name: 'Customer Pages',
    menuItems: [
      {
        key: 'customers',
        href: (stockCycleId) => routes.customer.home(stockCycleId),
        icon: FaSchoolFlag,
        name: 'Customers',
      },
      {
        key: 'sales-order',
        href: (stockCycleId) => routes.salesOrder.home(stockCycleId),
        icon: PlaylistAddIcon,
        name: 'Sales Orders',
      },
      {
        key: 'packing-note',
        href: (stockCycle) => routes.packingNote(stockCycle),
        icon: ContentPasteIcon,
        name: 'Packing Note',
      },
      {
        key: 'create-packed-list',
        href: (stockCycle) => `/${stockCycle}/dummy`,
        icon: LuPackagePlus,
        name: 'Create Packed List',
      },
      {
        key: 'create-invoice',
        href: (stockCycle) => `/${stockCycle}/dummy`,
        icon: FaFileInvoice,
        name: 'Create Invoice',
      },
      {
        key: 'set-pack',
        href: (stockCycle) => `/${stockCycle}/dummy`,
        icon: SiBookstack,
        name: 'Set Pack',
      },
      {
        key: 'sales-consolidate',
        href: (stockCycle) => `/${stockCycle}/dummy`,
        icon: FaRegListAlt,
        name: 'Sales Consolidate',
      },
      {
        key: 'returns-entry',
        href: (stockCycle) => `/${stockCycle}/dummy`,
        icon: BackspaceIcon,
        name: 'Returns Entry',
      },
      {
        key: 'receipt-entry',
        href: (stockCycle) => `/${stockCycle}/dummy`,
        icon: ReceiptIcon,
        name: 'Receipt Entry',
      },
      {
        key: 'statement',
        href: (stockCycle) => `/${stockCycle}/dummy`,
        icon: RequestQuoteIcon,
        name: 'Statement',
      },
      {
        key: 'list-of-docs',
        href: (stockCycle) => `/${stockCycle}/dummy`,
        icon: IoDocumentsOutline,
        name: 'List of Documents',
      },
    ],
  },
  {
    key: 'company',
    icon: BusinessIcon,
    name: 'Company Pages',
    menuItems: [
      {
        key: 'companies',
        href: (stockCycleId) => routes.company.home(stockCycleId),
        icon: BusinessIcon,
        name: 'Companies',
      },
      {
        key: 'create-purchase-order',
        href: (stockCycle) => `/${stockCycle}/dummy`,
        icon: PlaylistAddIcon,
        name: 'Create Purchase Order',
      },
      {
        key: 'create-purchase-returns',
        href: (stockCycle) => `/${stockCycle}/dummy`,
        icon: BackspaceIcon,
        name: 'Create Purchase Returns',
      },
    ],
  },
  {
    key: 'items',
    icon: InventoryIcon,
    name: 'Items',
    href: (stockCycleId) => routes.item.home(stockCycleId),
  },
]

export const adminDrawerItems = [
  {
    key: 'users',
    icon: GroupIcon,
    name: 'Users',
    href: (stockCycleId) => routes.user.home(stockCycleId),
  },
  {
    key: 'audit-logs',
    icon: HistoryIcon,
    name: 'Audit Logs',
    href: (stockCycleId) => routes.auditLog.home(stockCycleId),
  },
]

export const superAdminDrawerItems = [
  {
    key: 'db-editor',
    icon: TbDatabaseEdit,
    name: 'DB Editor',
    href: (stockCycleId) => routes.dbEditor.home(stockCycleId),
  },
]
