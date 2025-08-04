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
        href: (stockCycle) => `/${stockCycle}`,
        icon: FaSchoolFlag,
        name: 'Customers',
      },
      {
        key: 'create-sales-order',
        href: (stockCycle) => `/${stockCycle}/sales-order/create`,
        icon: PlaylistAddIcon,
        name: 'Create Sales Order',
      },
      {
        key: 'packing-note',
        href: '/',
        icon: ContentPasteIcon,
        name: 'Packing Note',
      },
      {
        key: 'create-packed-list',
        href: '/',
        icon: LuPackagePlus,
        name: 'Create Packed List',
      },
      {
        key: 'create-invoice',
        href: '/',
        icon: FaFileInvoice,
        name: 'Create Invoice',
      },
      {
        key: 'set-pack',
        href: '/',
        icon: SiBookstack,
        name: 'Set Pack',
      },
      {
        key: 'sales-consolidate',
        href: '/',
        icon: FaRegListAlt,
        name: 'Sales Consolidate',
      },
      {
        key: 'returns-entry',
        href: '/',
        icon: BackspaceIcon,
        name: 'Returns Entry',
      },
      {
        key: 'receipt-entry',
        href: '/',
        icon: ReceiptIcon,
        name: 'Receipt Entry',
      },
      {
        key: 'statement',
        href: '/',
        icon: RequestQuoteIcon,
        name: 'Statement',
      },
      {
        key: 'list-of-docs',
        href: '/',
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
        href: '/',
        icon: PlaylistAddIcon,
        name: 'Create Purchase Order',
      },
      {
        key: 'create-purchase-returns',
        href: '/',
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
