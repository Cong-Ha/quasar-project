import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { 
        path: '', 
        component: () => import('pages/IndexPage.vue') 
      }
    ],
  },

  // Mobile app routes with tab navigation
  {
    path: '/mobile',
    component: () => import('layouts/MobileLayout.vue'),
    children: [
      {
        path: '',
        redirect: '/mobile/home'
      },
      {
        path: 'home',
        component: () => import('pages/mobile/HomePage.vue')
      },
      {
        path: 'videos',
        component: () => import('pages/mobile/VideosPage.vue')
      },
      {
        path: 'record',
        component: () => import('pages/mobile/RecordPage.vue')
      },
      {
        path: 'settings',
        component: () => import('pages/mobile/SettingsPage.vue')
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
