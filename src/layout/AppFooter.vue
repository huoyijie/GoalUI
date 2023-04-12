<script setup>
import { useLayout } from '@/layout/composables/layout';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const i18n = useI18n();
const { t } = i18n;

const { layoutConfig } = useLayout();

const logoUrl = computed(() => {
    return `layout/images/${layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'}.svg`;
});
</script>

<template>
    <div class="layout-footer">
        <img :src="logoUrl" alt="Logo" height="20" class="mr-2" />
        <span>{{ t('appFooter.power') }}</span>
        <a href="https://github.com/huoyijie/Goal" target="_blank">
            <span class="ml-2 text-2xl"><i class="pi pi-github"></i></span
        ></a>
    </div>
</template>
<style lang="scss" scoped></style>
