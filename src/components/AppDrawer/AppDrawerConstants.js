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

export const appDrawerItems = [
  {
    key: 'Customer',
    icon: FaSchoolFlag,
    name: 'Customer Pages',
    menuItems: [
      {
        key: 'customers',
        href: (stockCycle) => `/${stockCycle}/customer`,
        icon: FaSchoolFlag,
        name: 'Customers',
      },
      {
        key: 'sales-order',
        href: (stockCycle) => `/${stockCycle}/sales-order`,
        icon: PlaylistAddIcon,
        name: 'Sales Orders',
      },
      {
        key: 'packing-note',
        href: (stockCycle) => `/${stockCycle}/dummy`,
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
        href: (stockCycle) => `/${stockCycle}/companies`,
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
    href: (stockCycle) => `/${stockCycle}/items`,
  },
]

export const adminDrawerItems = [
  {
    key: 'users',
    icon: GroupIcon,
    name: 'Users',
    href: (stockCycle) => `/${stockCycle}/users`,
  },
  {
    key: 'audit-logs',
    icon: HistoryIcon,
    name: 'Audit Logs',
    href: (stockCycle) => `/${stockCycle}/audit-logs`,
  },
]

export const superAdminDrawerItems = [
  {
    key: 'db-editor',
    icon: TbDatabaseEdit,
    name: 'DB Editor',
    href: (stockCycle) => `/${stockCycle}/db-editor`,
  },
]
