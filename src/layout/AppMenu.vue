<script setup>
import { ref, onBeforeMount } from 'vue';

import { useRouter } from 'vue-router';
import AppMenuItem from './AppMenuItem.vue';
import MenuService from '@/service/MenuService';

const router = useRouter();
const model = ref([]);
const menuService = new MenuService();

onBeforeMount(() => {
    menuService.getMenus(router).then((menus) => {
        model.value = menus;
    });
});
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
