<script setup>
import { useLayout } from '@/layout/composables/layout';
import { ref, computed } from 'vue';
import AppConfig from '@/layout/AppConfig.vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import AuthService from '@/service/AuthService';
import { InvalidUserOrPassword } from '@/service/ErrCodes';
import useValidate from '@vuelidate/core';
import { required, alphaNum, minLength, maxLength } from '@/helper/i18n-validators';

const router = useRouter();
const { layoutConfig, contextPath } = useLayout();
const { t } = useI18n();

const authService = new AuthService();

const btnSigninDisabled = ref(false);
const signinForm = ref({
    Username: '',
    Password: '',
    RememberMe: true
});
const errors = ref({});

const v$ = useValidate(
    {
        Username: { required, alphaNum, minLength: minLength(3), maxLength: maxLength(40) },
        Password: { required, minLength: minLength(8) }
    },
    signinForm.value
);

const usernameErr = computed(() => {
    return errors.value.Username || errors.value.Global;
});
const passwordErr = computed(() => {
    return errors.value.Password || errors.value.Global;
});
const clearUsernameErr = () => {
    delete errors.value.Username;
    delete errors.value.Global;
};
const clearPasswordErr = () => {
    delete errors.value.Password;
    delete errors.value.Global;
};

const logoUrl = computed(() => {
    return `${contextPath}layout/images/${layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'}.svg`;
});

const signin = async () => {
    btnSigninDisabled.value = true;
    if (!(await v$.value.$validate())) {
        for (let err of v$.value.$errors) {
            errors.value[err.$property] = err.$message;
        }
        btnSigninDisabled.value = false;
        return;
    }

    const { code, data } = await authService.signin(router, signinForm.value);
    if (code === InvalidUserOrPassword) {
        errors.value.Global = t('signin.invalidUserOrPassword');
        btnSigninDisabled.value = false;
    } else if (data) {
        localStorage.setItem('username', data);
        router.push({ name: 'dashboard' });
    }
};
</script>

<template>
    <div class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
                    <div class="text-center mb-5">
                        <img :src="logoUrl" alt="Image" height="50" class="mb-3" />
                        <div class="text-600 font-medium mb-3">{{ t('signin.formLabel') }}</div>
                    </div>

                    <div>
                        <label for="username" class="block text-900 text-xl font-medium mb-2">{{ t('signin.username') }}</label>
                        <InputText id="username" type="text" placeholder="Username" @focus="clearUsernameErr" :class="{ 'w-full': true, 'md:w-30rem': true, 'p-invalid': usernameErr }" style="padding: 1rem" autofocus v-model="signinForm.Username" />
                        <div>
                            <small class="p-error">{{ usernameErr }}</small>
                        </div>

                        <label for="password" class="block text-900 font-medium text-xl mt-5 mb-2">{{ t('signin.password') }}</label>
                        <Password
                            id="password"
                            v-model="signinForm.Password"
                            placeholder="Password"
                            @focus="clearPasswordErr"
                            :toggleMask="true"
                            :class="{ 'w-full': true, 'md:w-30rem': true, 'p-invalid': passwordErr }"
                            inputClass="w-full"
                            :inputStyle="{ padding: '1rem' }"
                            :feedback="false"
                        ></Password>
                        <div>
                            <small class="p-error">{{ passwordErr }}</small>
                        </div>

                        <div class="flex align-items-center justify-content-between mt-3 mb-5 gap-5">
                            <div class="flex align-items-center">
                                <Checkbox v-model="signinForm.RememberMe" id="rememberMe" binary class="mr-2"></Checkbox>
                                <label for="rememberMe">{{ t('signin.rememberMe') }}</label>
                            </div>
                        </div>
                        <Button :label="t('signin.button')" class="w-full p-3 text-xl" @click="signin" :disabled="btnSigninDisabled"></Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <AppConfig simple />
</template>

<style scoped></style>
