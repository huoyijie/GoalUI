<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useRouter } from 'vue-router';
import { usePrimeVue } from 'primevue/config';
import { useI18n } from 'vue-i18n';
import useValidate from '@vuelidate/core';
import { required, minLength, sameAs } from '@/helper/i18n-validators';
import AuthService from '@/service/AuthService';

const { layoutConfig, onMenuToggle, contextPath } = useLayout();

const router = useRouter();
const primevue = usePrimeVue();
const i18n = useI18n();
const { t } = i18n;
const selectedLang = ref(i18n.locale.value);
const langs = ref([
    { name: 'EN', value: 'en' },
    { name: '简体中文', value: 'zh_CN' }
]);

const authService = new AuthService();
const outsideClickListener = ref(null);
const topbarMenuActive = ref(false);

const username = localStorage.getItem('username');
const userinfo = ref({});

const switchLangDialog = ref(false);
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
        errors.value.Password = t('changePassword.invalidPassword');
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
    switchLangDialog.value = false;
    switchLangDialog.value = true;
};
const changeLang = () => {
    if (selectedLang.value) {
        i18n.locale.value = selectedLang.value;
        primevue.config.locale = primevue.config[selectedLang.value];
        localStorage.setItem('lang', selectedLang.value);
    } else {
        selectedLang.value = i18n.locale.value;
    }
    switchLangDialog.value = false;
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
                <span>{{ t('appTopbar.language') }}</span>
            </button>
            <button @click="onViewProfile" class="p-link layout-topbar-button">
                <i class="pi pi-user"></i>
                <span>{{ username }}</span>
            </button>
            <button @click="onSignout" class="p-link layout-topbar-button">
                <i class="pi pi-sign-out"></i>
                <span>{{ t('appTopbar.signout') }}</span>
            </button>
        </div>
    </div>

    <Dialog v-model:visible="switchLangDialog" modal :header="t('appTopbar.language')" position="topright" :style="{ width: '240px' }">
        <Listbox v-model="selectedLang" :options="langs" optionLabel="name" optionValue="value" class="w-full md:w-14rem" @change="changeLang" />
    </Dialog>

    <Dialog v-model:visible="changePWDialog" modal :header="t('appTopbar.changePassword')" :style="{ width: '400px' }" class="p-fluid">
        <div class="field">
            <label for="password">{{ t('appTopbar.password') }}</label>
            <Password id="password" v-model="passwords.Password" @focus="clearPasswordErr" :class="{ 'p-invalid': passwordErr }" autofocus :feedback="false" toogleMask></Password>
            <small class="p-error">{{ passwordErr }}</small>
        </div>
        <div class="field">
            <label for="newPassword1">{{ t('appTopbar.newPassword') }}</label>
            <Password id="newPassword1" v-model="passwords.NewPassword" @focus="clearNewPasswordErr" :class="{ 'p-invalid': newPasswordErr }" toogleMask></Password>
            <small class="p-error">{{ newPasswordErr }}</small>
        </div>
        <div class="field">
            <label for="newPassword2">{{ t('appTopbar.confirmPassword') }}</label>
            <Password id="newPassword2" v-model="passwords.ConfirmPassword" @focus="clearConfirmPasswordErr" :class="{ 'p-invalid': confirmPasswordErr }" :feedback="false" toogleMask></Password>
            <small class="p-error">{{ confirmPasswordErr }}</small>
        </div>
        <template #footer>
            <div>
                <Button :label="t('appTopbar.submit')" icon="pi pi-check" @click="changePassword" text :disabled="submitDisabled" />
            </div>
        </template>
    </Dialog>

    <Dialog v-model:visible="profileDialog" :style="{ width: '400px' }" :header="t('appTopbar.profile')" modal class="p-fluid">
        <div class="container text-left">
            <div class="grid">
                <div class="col col-6"><i class="pi pi-mobile"></i> ID:</div>
                <div class="col col-6"><Badge :value="userinfo.ID"></Badge></div>
                <div class="col-6"><i class="pi pi-user"></i> {{ t('appTopbar.username') }}:</div>
                <div class="col-6">{{ userinfo.Username }}</div>
                <div class="col-6"><i class="pi pi-inbox"></i> {{ t('appTopbar.email') }}:</div>
                <div class="col-6">{{ userinfo.Email }}</div>
            </div>
        </div>
        <template #footer>
            <div class="text-left">
                <Button :label="t('appTopbar.changePassword')" icon="pi pi-pencil" @click="openChangePWDialog" text />
            </div>
        </template>
    </Dialog>

    <Dialog v-model:visible="signoutDialog" :style="{ width: '450px' }" :header="t('appTopbar.confirm')" modal class="p-fluid">
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span>{{ t('appTopbar.isConfirmSignout') }}</span>
        </div>
        <template #footer>
            <Button :label="t('appTopbar.no')" icon="pi pi-times" class="p-button-text" @click="signoutDialog = false" />
            <Button :label="t('appTopbar.yes')" icon="pi pi-check" class="p-button-text" @click="authService.signout(router)" />
        </template>
    </Dialog>
</template>

<style lang="scss" scoped></style>
