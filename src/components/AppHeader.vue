<template>
    <header id="header" class="bg-gray-700">
        <nav class="container mx-auto flex justify-start items-center py-5 px-4">
            <!-- App Name -->
            <router-link
                class="text-white font-bold uppercase text-2xl mr-4"
                :to="{ name: 'home' }"
                exact-active-class="no-active"
            >
                Music
            </router-link>

            <div class="flex flex-grow items-center">
                <!-- Primary Navigation -->
                <ul class="flex flex-row mt-1">
                    <li>
                        <router-link :to="{ name: 'about' }" class="text-white px-2"
                            >About</router-link
                        >
                    </li>
                    <!-- Navigation Links -->
                    <li v-if="!userLoggedIn">
                        <a @click.prevent="toggleAuthModal" class="px-2 text-white" href="#"
                            >Login / Register</a
                        >
                    </li>
                    <template v-else>
                        <li>
                            <router-link class="px-2 text-white" to="/manage">Manage</router-link>
                        </li>
                        <li @click.prevent="signOut">
                            <a class="px-2 text-white" href="#">Logout</a>
                        </li>
                    </template>
                </ul>
                <ul class="ml-auto">
                    <li>
                        <a class="px-2 text-white" href="#" @click.prevent="changeLocale">
                            {{ currentLocale }}
                        </a>
                    </li>
                </ul>
            </div>
        </nav>
    </header>
</template>
<script>
import { mapActions, mapStores, mapWritableState } from 'pinia'
import useModalStore from '@/stores/modal'
import useUserStore from '@/stores/user'

export default {
    name: 'AppHeader',
    computed: {
        ...mapStores(useModalStore),
        ...mapWritableState(useUserStore, ['userLoggedIn']),
        currentLocale() {
            return this.$i18n.locale === 'fr' ? 'French' : 'English'
        }
    },
    methods: {
        ...mapActions(useUserStore, ['logout']),
        toggleAuthModal() {
            this.modalStore.isOpen = !this.modalStore.isOpen
            console.log(this.modalStore.isOpen)
        },
        signOut() {
            this.logout()
            if (this.$route.meta.requiresAuth) {
                this.$router.push({ name: 'home' })
            }
        },
        changeLocale() {
            this.$i18n.locale = this.$i18n.locale === 'fr' ? 'en' : 'fr'
        }
    }
}
</script>
