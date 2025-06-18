import Inbox from '@/components/pages/Inbox';
import Contacts from '@/components/pages/Contacts';
import Templates from '@/components/pages/Templates';
import CreateTemplate from '@/components/pages/CreateTemplate';
import Analytics from '@/components/pages/Analytics';
import Users from '@/components/pages/Users';
import Billing from '@/components/pages/Billing';
import Admin from '@/components/pages/Admin';
import Settings from '@/components/pages/Settings';
export const routes = {
  inbox: {
    id: 'inbox',
    label: 'Inbox',
    path: '/',
    icon: 'MessageSquare',
    component: Inbox
  },
  contacts: {
    id: 'contacts',
    label: 'Contacts',
    path: '/contacts',
    icon: 'Users',
    component: Contacts
  },
templates: {
    id: 'templates',
    label: 'Templates',
    path: '/templates',
    icon: 'FileText',
    component: Templates
  },
  createTemplate: {
    id: 'createTemplate',
    label: 'Create Template',
    path: '/templates/create',
    icon: 'Plus',
    component: CreateTemplate,
    hidden: true
  },
  analytics: {
    id: 'analytics',
    label: 'Analytics',
    path: '/analytics',
    icon: 'BarChart3',
    component: Analytics
  },
  settings: {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
path: '/settings',
    icon: 'Settings',
    component: Settings
  },
  users: {
    id: 'users',
    label: 'Users',
    path: '/users',
    icon: 'Users',
    component: Users
  },
billing: {
    id: 'billing',
    label: 'Billing',
    path: '/billing',
    icon: 'CreditCard',
    component: Billing
  },
  admin: {
    id: 'admin',
    label: 'Admin',
    path: '/admin',
    icon: 'Shield',
    component: Admin
  }
};

export const routeArray = Object.values(routes);