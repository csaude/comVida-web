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
    path: '/patientPanel',
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
      { path: '', component: () => import('pages/PatientPanel.vue') },
    ],
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

  // Catch all unmatched routes
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
