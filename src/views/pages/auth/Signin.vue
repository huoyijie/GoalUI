<script setup>
import { useLayout } from '@/layout/composables/layout';
import { ref, computed } from 'vue';
import AppConfig from '@/layout/AppConfig.vue';
import { useRouter } from 'vue-router';
import AuthService from '@/service/AuthService';
import useValidate from '@vuelidate/core';
import { required, alphaNum, minLength, maxLength } from '@vuelidate/validators';

const router = useRouter();
const authService = new AuthService();
const { layoutConfig, contextPath } = useLayout();
const signinForm = ref({
    Username: '',
    Password: '',
    RememberMe: true
});
const errors = ref({});
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

const v$ = useValidate(
    {
        Username: { required, alphaNum, minLength: minLength(3), maxLength: maxLength(40) },
        Password: { required, minLength: minLength(8) }
    },
    signinForm.value
);

const logoUrl = computed(() => {
    return `${contextPath}layout/images/${layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'}.svg`;
});

const signin = async () => {
    if (!(await v$.value.$validate())) {
        for (let err of v$.value.$errors) {
            errors.value[err.$property] = err.$message;
        }
        return;
    }

    if (!(await authService.signin(router, signinForm.value))) {
        errors.value.Global = 'Invalid username or password';
    }
};
</script>

<template>
    <div class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <div
                style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
                    <div class="text-center mb-5">
                        <img :src="logoUrl" alt="Image" height="50" class="mb-3" />
                        <div class="text-600 font-medium mb-3">Sign in to continue</div>
                    </div>

                    <div>
                        <label for="username" class="block text-900 text-xl font-medium mb-2">Username</label>
                        <InputText id="username" type="text" placeholder="Username" @focus="clearUsernameErr"
                            :class="{ 'w-full': true, 'md:w-30rem': true, 'p-invalid': usernameErr }" style="padding: 1rem"
                            autofocus v-model="signinForm.Username" />
                        <div><small class="p-invalid">{{ usernameErr }}</small></div>

                        <label for="password" class="block text-900 font-medium text-xl mt-5 mb-2">Password</label>
                        <Password id="password" v-model="signinForm.Password" placeholder="Password"
                            @focus="clearPasswordErr" :toggleMask="true"
                            :class="{ 'w-full': true, 'p-invalid': passwordErr }" inputClass="w-full"
                            inputStyle="padding:1rem" :feedback="false"></Password>
                        <small>{{ passwordErr }}</small>

                        <div class="flex align-items-center justify-content-between mt-3 mb-5 gap-5">
                            <div class="flex align-items-center">
                                <Checkbox v-model="signinForm.RememberMe" id="rememberMe" binary class="mr-2"></Checkbox>
                                <label for="rememberMe">Remember me</label>
                            </div>
                        </div>
                        <Button label="Sign In" class="w-full p-3 text-xl" @click="signin"></Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <AppConfig simple />
</template>

<style scoped></style>
