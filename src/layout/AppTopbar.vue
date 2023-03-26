<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useRouter } from 'vue-router';
import useValidate from '@vuelidate/core';
import { required, minLength, sameAs } from '@vuelidate/validators';
import AuthService from '@/service/AuthService';

const { layoutConfig, onMenuToggle, contextPath } = useLayout();

const router = useRouter();

const authService = new AuthService();
const outsideClickListener = ref(null);
const topbarMenuActive = ref(false);

const username = localStorage.getItem('username');
const userinfo = ref({});

const signoutDialog = ref(false);
const profileDialog = ref(false);
const changePWDialog = ref(false);

const passwords = ref({});
const errors = ref({});
const passwordErr = computed(() => {
    return errors.value.Password;
});
const clearPasswordErr = () => {
    delete errors.value.Password;
};
const newPasswordErr = computed(() => {
    return errors.value.NewPassword;
});
const clearNewPasswordErr = () => {
    delete errors.value.NewPassword;
};
const confirmPasswordErr = computed(() => {
    return errors.value.ConfirmPassword;
});
const clearConfirmPasswordErr = () => {
    delete errors.value.ConfirmPassword;
};
const openChangePWDialog = () => {
    passwords.value = {};
    errors.value = {};
    submitDisabled.value = false;
    changePWDialog.value = true;
};
const submitDisabled = ref(false);
const changePassword = async () => {
    submitDisabled.value = true;
    const v$ = useValidate(
        {
            Password: { required, minLength: minLength(8) },
            NewPassword: { required, minLength: minLength(8) },
            ConfirmPassword: { required, minLength: minLength(8), sameAs: sameAs(passwords.value.NewPassword) }
        },
        passwords.value
    );

    if (!(await v$.value.$validate())) {
        for (let err of v$.value.$errors) {
            errors.value[err.$property] = err.$message;
        }
        submitDisabled.value = false;
        return;
    }

    if (!(await authService.changePassword(router, { Password: passwords.value.Password, NewPassword: passwords.value.NewPassword }))) {
        errors.value.Password = 'Invalid password';
        submitDisabled.value = false;
        return;
    }

    changePWDialog.value = false;
    passwords.value = {};
    errors.value = {};
    submitDisabled.value = false;
};

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
    if (!userinfo.value.ID) {
        userinfo.value = await authService.userinfo(router);
    }
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

    <Dialog v-model:visible="changePWDialog" modal header="Change Password" :style="{ width: '400px' }" class="p-fluid">
        <div class="field">
            <label for="password">Password</label>
            <Password id="password" v-model="passwords.Password" @focus="clearPasswordErr" :class="{ 'p-invalid': passwordErr }" autofocus :feedback="false" toogleMask></Password>
            <small class="p-error">{{ passwordErr }}</small>
        </div>
        <div class="field">
            <label for="newPassword1">New password</label>
            <Password id="newPassword1" v-model="passwords.NewPassword" @focus="clearNewPasswordErr" :class="{ 'p-invalid': newPasswordErr }" toogleMask></Password>
            <small class="p-error">{{ newPasswordErr }}</small>
        </div>
        <div class="field">
            <label for="newPassword2">Confirm password</label>
            <Password id="newPassword2" v-model="passwords.ConfirmPassword" @focus="clearConfirmPasswordErr" :class="{ 'p-invalid': confirmPasswordErr }" :feedback="false" toogleMask></Password>
            <small class="p-error">{{ confirmPasswordErr }}</small>
        </div>
        <template #footer>
            <div>
                <Button label="Submit" icon="pi pi-check" @click="changePassword" text :disabled="submitDisabled" />
            </div>
        </template>
    </Dialog>

    <Dialog v-model:visible="profileDialog" :style="{ width: '300px' }" header="Profile" modal class="p-fluid">
        <div class="container text-left">
            <div class="grid">
                <div class="col col-6"><i class="pi pi-mobile"></i> ID:</div>
                <div class="col col-6"><Badge :value="userinfo.ID"></Badge></div>
                <div class="col-6"><i class="pi pi-user"></i> Username:</div>
                <div class="col-6">{{ userinfo.Username }}</div>
                <div class="col-6"><i class="pi pi-inbox"></i> Email:</div>
                <div class="col-6">{{ userinfo.Email }}</div>
            </div>
        </div>
        <template #footer>
            <div class="text-left">
                <Button label="Change password" icon="pi pi-pencil" @click="openChangePWDialog" text />
            </div>
        </template>
    </Dialog>

    <Dialog v-model:visible="signoutDialog" :style="{ width: '450px' }" header="Confirm" modal class="p-fluid">
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
