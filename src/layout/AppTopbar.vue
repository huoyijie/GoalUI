<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useRouter } from 'vue-router';
import AuthService from '@/service/AuthService';

const { layoutConfig, onMenuToggle, contextPath } = useLayout();

const authService = new AuthService();
const outsideClickListener = ref(null);
const topbarMenuActive = ref(false);
const router = useRouter();
const username = localStorage.getItem('username');
const userinfo = ref({});
const profileDialog = ref(false);
const signoutDialog = ref(false);

onMounted(() => {
    bindOutsideClickListener();
});

onBeforeUnmount(() => {
    unbindOutsideClickListener();
});

const logoUrl = computed(() => {
    return `${contextPath}layout/images/${layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'}.svg`;
});

const onTopBarMenuButton = () => {
    topbarMenuActive.value = !topbarMenuActive.value;
};
const onSwitchLang = () => {
    topbarMenuActive.value = false;
};
const onViewProfile = async () => {
    topbarMenuActive.value = false;
    userinfo.value = await authService.userinfo(router);
    profileDialog.value = true;
};
const onSignout = () => {
    topbarMenuActive.value = false;
    signoutDialog.value = true;
};
const topbarMenuClasses = computed(() => {
    return {
        'layout-topbar-menu-mobile-active': topbarMenuActive.value
    };
});

const bindOutsideClickListener = () => {
    if (!outsideClickListener.value) {
        outsideClickListener.value = (event) => {
            if (isOutsideClicked(event)) {
                topbarMenuActive.value = false;
            }
        };
        document.addEventListener('click', outsideClickListener.value);
    }
};
const unbindOutsideClickListener = () => {
    if (outsideClickListener.value) {
        document.removeEventListener('click', outsideClickListener);
        outsideClickListener.value = null;
    }
};
const isOutsideClicked = (event) => {
    if (!topbarMenuActive.value) return;

    const sidebarEl = document.querySelector('.layout-topbar-menu');
    const topbarEl = document.querySelector('.layout-topbar-menu-button');

    return !(sidebarEl.isSameNode(event.target) || sidebarEl.contains(event.target) || topbarEl.isSameNode(event.target) || topbarEl.contains(event.target));
};
</script>

<template>
    <div class="layout-topbar">
        <router-link to="/" class="layout-topbar-logo">
            <img :src="logoUrl" alt="logo" />
            <span>GOAL</span>
        </router-link>

        <button class="p-link layout-menu-button layout-topbar-button" @click="onMenuToggle">
            <i class="pi pi-bars"></i>
        </button>

        <button class="p-link layout-topbar-menu-button layout-topbar-button" @click="onTopBarMenuButton">
            <i class="pi pi-ellipsis-v"></i>
        </button>

        <div class="layout-topbar-menu" :class="topbarMenuClasses">
            <button @click="onSwitchLang" class="p-link layout-topbar-button">
                <i class="pi pi-language"></i>
                <span>Language</span>
            </button>
            <button @click="onViewProfile" class="p-link layout-topbar-button">
                <i class="pi pi-user"></i>
                <span>{{ username }}</span>
            </button>
            <button @click="onSignout" class="p-link layout-topbar-button">
                <i class="pi pi-sign-out"></i>
                <span>Sign out</span>
            </button>
        </div>
    </div>

    <Dialog v-model:visible="profileDialog" :style="{ width: '300px' }" header="Profile" modal>
        <div class="container text-start">
            <div class="grid">
                <div class="col col-6"><i class="pi pi-mobile"></i> ID:</div>
                <div class="col col-6"><Badge :value="userinfo.ID"></Badge></div>
                <div class="col-6"><i class="pi pi-user"></i> Username:</div>
                <div class="col-6">{{ userinfo.Username }}</div>
                <div class="col-6"><i class="pi pi-inbox"></i> Email:</div>
                <div class="col-6">{{ userinfo.Email }}</div>
            </div>
        </div>
    </Dialog>

    <Dialog v-model:visible="signoutDialog" :style="{ width: '450px' }" header="Confirm" modal>
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span>Are you sure you want to sign out?</span>
        </div>
        <template #footer>
            <Button label="No" icon="pi pi-times" class="p-button-text" @click="signoutDialog = false" />
            <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="authService.signout(router)" />
        </template>
    </Dialog>
</template>

<style lang="scss" scoped></style>
