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
    <Button v-if="authRole" icon="pi pi-key" class="p-button-rounded p-button-primary mr-2" @click="$emit('pick-perms')" :disabled="btnPickPermsDisabled" />
    <Button v-if="authUser" icon="pi pi-users" class="p-button-rounded p-button-primary mr-2" @click="$emit('pick-roles')" :disabled="btnPickRolesDisabled" />
    <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="$emit('change-record')" :disabled="btnChangeDisabled" />
    <Button icon="pi pi-trash" class="p-button-rounded p-button-warning" @click="$emit('delete-record')" :disabled="btnDeleteDisabled" />
</template>
