import { createRouter, createWebHashHistory } from 'vue-router';
import AppLayout from '@/layout/AppLayout.vue';

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '/',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue')
                },
                {
                    path: '/crud/:group/:item',
                    name: 'crud',
                    component: () => import('@/views/Crud.vue')
                }
            ]
        },
        {
            path: '/signin',
            name: 'signin',
            component: () => import('@/views/Signin.vue')
        },
        {
            path: '/404',
            name: '404',
            component: () => import('@/views/error/NotFound.vue')
        },
        {
            path: '/denied',
            name: 'denied',
            component: () => import('@/views/error/AccessDenied.vue')
        },
        {
            path: '/error',
            name: 'error',
            component: () => import('@/views/error/Error.vue')
        },
        {
            path: '/:notfound*',
            redirect: { name: '404' }
        }
    ]
});

export default router;
