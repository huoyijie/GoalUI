<script setup>
import { useI18n } from 'vue-i18n';

const i18n = useI18n();
const { t } = i18n;

defineProps(['group', 'item', 'record', 'pk', 'visible', 'modelValue']);
defineEmits(['update:visible', 'update:modelValue', 'delete-record', 'delete-records']);

const messagePath = (group, item) => {
    return `group.${group}.${item}.label`;
};
</script>

<template>
    <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" :style="{ width: '450px' }" :header="t('crud.delDialog.confirm')" modal>
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="record">{{ t('crud.delDialog.confirmDelRecord') }}{{ t(messagePath(group, item)) }} <Badge :value="record[pk]"></Badge> ?</span>
        </div>
        <template #footer>
            <Button :label="t('crud.delDialog.no')" icon="pi pi-times" class="p-button-text" @click="$emit('update:visible', false)" />
            <Button :label="t('crud.delDialog.yes')" icon="pi pi-check" class="p-button-text" @click="$emit('delete-record')" />
        </template>
    </Dialog>

    <Dialog :visible="modelValue" @update:visible="$emit('update:modelValue', $event)" :style="{ width: '450px' }" :header="t('crud.delDialog.confirm')" modal>
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span>{{ t('crud.delDialog.confirmDelRecords') }}{{ t(messagePath(group, item), 2) }}?</span>
        </div>
        <template #footer>
            <Button :label="t('crud.delDialog.no')" icon="pi pi-times" class="p-button-text" @click="$emit('update:modelValue', false)" />
            <Button :label="t('crud.delDialog.yes')" icon="pi pi-check" class="p-button-text" @click="$emit('delete-records')" />
        </template>
    </Dialog>
</template>

<style scoped></style>
