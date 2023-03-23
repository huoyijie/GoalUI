<script setup>
defineProps(['authUser', 'visible', 'modelValue', 'yes']);
defineEmits(['update:visible', 'update:modelValue']);
</script>

<template>
    <Dialog v-if="authUser" :visible="visible" @update:visible="$emit('update:visible', $event)" class="col-12 lg:col-8" header="User roles" modal>
        <PickList :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)" listStyle="height:250px" dataKey="ID">
            <template #sourceheader> Available roles </template>
            <template #targetheader> Selected roles </template>
            <template #item="slotProps">
                <div>{{ slotProps.item.Name }}</div>
            </template>
        </PickList>
        <template #footer>
            <Button label="No" icon="pi pi-times" class="p-button-text" @click="$emit('update:visible', false)" />
            <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="yes" />
        </template>
    </Dialog>
</template>

<style scoped></style>
