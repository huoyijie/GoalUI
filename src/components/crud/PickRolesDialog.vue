<script setup>
import { useI18n } from 'vue-i18n';

const i18n = useI18n();
const { t } = i18n;

defineProps(['authUser', 'visible', 'modelValue', 'yes']);
defineEmits(['update:visible', 'update:modelValue']);
</script>

<template>
    <Dialog v-if="authUser" :visible="visible" @update:visible="$emit('update:visible', $event)" class="col-12 lg:col-8" :header="t('crud.pickRolesDialog.header')" modal>
        <PickList :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)" listStyle="height:250px" dataKey="ID">
            <template #sourceheader>{{ t('crud.pickRolesDialog.srcHeader') }}</template>
            <template #targetheader>{{ t('crud.pickRolesDialog.targetHeader') }}</template>
            <template #item="slotProps">
                <div>{{ slotProps.item.Name }}</div>
            </template>
        </PickList>
        <template #footer>
            <Button :label="t('crud.pickRolesDialog.cancel')" icon="pi pi-times" class="p-button-text" @click="$emit('update:visible', false)" />
            <Button :label="t('crud.pickRolesDialog.save')" icon="pi pi-check" class="p-button-text" @click="yes" />
        </template>
    </Dialog>
</template>

<style scoped></style>
