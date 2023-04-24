<script setup>
import { computed } from 'vue';

const props = defineProps(['group', 'item', 'crudPerms']);
defineEmits(['pick-perms', 'pick-roles', 'change-record', 'delete-record']);

const authRole = computed(() => props.group == 'auth' && props.item == 'role');
const authUser = computed(() => props.group == 'auth' && props.item == 'user');

const btnChangeDisabled = computed(() => {
    return !props.crudPerms.put;
});
const btnPickPermsDisabled = computed(() => {
    return !props.crudPerms.put;
});
const btnPickRolesDisabled = computed(() => {
    return !props.crudPerms.put;
});
const btnDeleteDisabled = computed(() => {
    return !props.crudPerms.delete;
});
</script>

<template>
    <Button v-if="authRole" icon="pi pi-key" size="small" severity="primary" class="app-record-operation mr-2" @click="$emit('pick-perms')" :disabled="btnPickPermsDisabled"></Button>
    <Button v-if="authUser" icon="pi pi-users" size="small" severity="primary" class="app-record-operation mr-2" @click="$emit('pick-roles')" :disabled="btnPickRolesDisabled"></Button>
    <Button icon="pi pi-pencil" size="small" severity="success" class="app-record-operation mr-2" @click="$emit('change-record')" :disabled="btnChangeDisabled"></Button>
    <Button icon="pi pi-trash" size="small" severity="warning" class="app-record-operation" @click="$emit('delete-record')" :disabled="btnDeleteDisabled"></Button>
</template>

<style scoped lang="scss">
.app-record-operation {
    width: 2rem;
    height: 2rem;
    border: 0 none;
}
</style>
