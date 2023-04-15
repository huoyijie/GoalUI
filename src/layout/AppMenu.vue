<script setup>
import { ref, onBeforeMount } from 'vue';

import { useRouter } from 'vue-router';
import AppMenuItem from './AppMenuItem.vue';
import MenuService from '@/service/MenuService';

const router = useRouter();
const menuService = new MenuService();

const home = {
    label: 'home',
    items: [{ label: 'dashboard', items: null, to: { name: 'dashboard' }, icon: 'pi pi-fw pi-home' }]
};
const menus = ref([]);

onBeforeMount(() => {
    menuService.getMenus(router).then((data) => {
        menus.value.push(home);
        for (let menu of data) {
            for (let item of menu.items) {
                item.icon = `pi pi-fw pi-${item.icon}`;
                item.to = {
                    name: 'crud',
                    params: {
                        group: `${menu.label}`,
                        item: `${item.label}`
                    }
                };
            }
        }
        menus.value.push(...data);
    });
});
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in menus" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
