<script setup>
defineProps(['authRole', 'modelValue', 'visible', 'yes']);
defineEmits(['update:modelValue', 'update:visible']);
</script>

<template>
    <Dialog v-if="authRole" :visible="visible" @update:visible="$emit('update:visible', $event)" class="col-12 lg:col-8" header="Role permissions" modal>
        <PickList :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)" listStyle="height:250px" dataKey="Code">
            <template #sourceheader> Available permissions</template>
            <template #targetheader> Selected permissions</template>
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

<style scoped lang="scss"></style>
