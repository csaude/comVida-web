import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login', // Redirect the root path to the login page
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('pages/LoginPage.vue'),
    meta: { requiresAuth: false }, // No authentication needed
  },
  {
    path: '/home',
    component: () => import('layouts/MainLayout.vue'),
    beforeEnter(to, from, next) {
      const authUser = sessionStorage.getItem('sessionId'); // Check for session ID
      if (!authUser) {
        //next('/login'); // Redirect to login if not authenticated
        next(); 
      } else {
        next(); // Allow access
      }
    },
    children: [
      { path: '', component: () => import('pages/HomePage.vue') },
    ],
  },
  {
    path: '/users',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/UserManager.vue') },
    ],
  },
  {
    path: '/settings',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Settings.vue') },
    ],
  },
  {
    path: '/about',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/About.vue') },
    ],
  },
  {
    path: '/cohorts',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/CohortManager.vue') },
    ],
  },
  {
    path: '/cohort-upload',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/CohortUpload.vue') },
    ],
  },
  {
    path: '/reports',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Reports.vue') },
    ],
  },
  {
    path: '/tracking',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Tracing.vue') },
    ],
  },
  {
    path: '/dashboard',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Dashboard.vue') },
    ],
  },

  // Catch all unmatched routes
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
