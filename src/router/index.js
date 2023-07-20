import { createRouter, createWebHistory } from 'vue-router'
import useUserStore from '@/stores/user'

const Home = () => import('@/views/Home.vue')
const About = () => import('@/views/About.vue')
const Song = () => import('@/views/Song.vue')
const Manage = () => import('@/views/Manage.vue')

const routes = [
    {
        path: '/',
        component: Home,
        name: 'home'
    },
    {
        path: '/about',
        component: About,
        name: 'about'
    },
    {
        path: '/manage',
        component: Manage,
        name: 'manage',
        meta: {
            requiresAuth: true
        }
        // alias: '/manage-music
    },
    {
        path: '/manage-music',
        redirect: { name: 'manage' }
    },
    {
        name: 'song',
        path: '/song/:id',
        component: Song
    },
    {
        path: '/:catchAll(.*)*',
        redirect: { name: 'home' }
    }
]
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    linkExactActiveClass: 'text-yellow-500'
})

router.beforeEach((to, from, next) => {
    if (!to.meta.requiresAuth) {
        next()
        return
    }
    const store = useUserStore()
    if (store.userLoggedIn) {
        next()
    } else {
        next({ name: 'home' })
    }
})

export default router
