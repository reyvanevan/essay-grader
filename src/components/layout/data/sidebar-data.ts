import {
  LayoutDashboard,
  FileText,
  Settings,
  Palette,
  GraduationCap,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Dr. Dosen',
    email: 'dosen@university.ac.id',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Essay Grader',
      logo: GraduationCap,
      plan: 'AI-Powered',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Submissions',
          url: '/submissions',
          icon: FileText,
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          title: 'Settings',
          icon: Settings,
          items: [
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: Palette,
            },
          ],
        },
      ],
    },
  ],
}
