import {
  LayoutDashboard,
  Target,
  Layers,
  FileEdit,
  BarChart2,
  FileText,
  Settings,
  LucideIcon,
  Book
} from "lucide-react"

interface MenuItem {
  title: string;
  path: string;
  icon: LucideIcon;
}

export const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    path: '/',
    icon: LayoutDashboard
  },
  {
    title: 'Niche Selection',
    path: '/niche-selection',
    icon: Target
  },
  {
    title: 'Content Pillars',
    path: '/pillars',
    icon: Layers
  },
  {
    title: 'Research',
    path: '/research',
    icon: Book
  },
  {
    title: 'Content Merge',
    path: '/content-merge',
    icon: FileEdit
  },
  {
    title: 'SEO Grade',
    path: '/seo-grade',
    icon: BarChart2
  },
  {
    title: 'Final Articles',
    path: '/articles',
    icon: FileText
  },
  {
    title: 'Settings',
    path: '/settings',
    icon: Settings
  }
]
