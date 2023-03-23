<script setup>
import { computed } from 'vue';

const props = defineProps(['crudPerms', 'selectedRecords']);
defineEmits(['new-record', 'delete-records', 'export']);

const btnNewDisabled = computed(() => {
    return !props.crudPerms.post;
});
const btnBatchDeleteDisabled = computed(() => {
    return !props.crudPerms.delete || !props.selectedRecords || !props.selectedRecords.length;
});
const btnImportDisabled = computed(() => {
    return !props.crudPerms.post;
});
const btnExportDisabled = computed(() => {
    return !props.crudPerms.get;
});
</script>

<template>
    <Toolbar class="mb-4">
        <template v-slot:start>
            <div class="my-2">
                <Button label="New" icon="pi pi-plus" class="p-button-success mr-2" @click="$emit('new-record')" :disabled="btnNewDisabled" />
                <Button label="Delete" icon="pi pi-trash" class="p-button-danger" @click="$emit('delete-records')" :disabled="btnBatchDeleteDisabled" />
            </div>
        </template>

        <template v-slot:end>
            <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" chooseLabel="Import" class="mr-2 inline-block" :disabled="btnImportDisabled" />
            <Button label="Export" icon="pi pi-upload" class="p-button-help" @click="$emit('export', $event)" :disabled="btnExportDisabled" />
        </template>
    </Toolbar>
</template>

<style scoped></style>
