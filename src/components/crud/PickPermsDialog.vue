<script setup>
import { useI18n } from 'vue-i18n';

const i18n = useI18n();
const { t } = i18n;

defineProps(['authRole', 'modelValue', 'visible', 'yes']);
defineEmits(['update:modelValue', 'update:visible']);

const messagePath = (group, item) => {
    return item ? `group.${group}.${item}.label` : `group.${group}.label`;
};
</script>

<template>
    <Dialog v-if="authRole" :visible="visible" @update:visible="$emit('update:visible', $event)" class="col-12 lg:col-8" :header="t('crud.pickPermsDialog.header')" modal>
        <PickList :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)" listStyle="height:250px" dataKey="Code">
            <template #sourceheader>{{ t('crud.pickPermsDialog.srcHeader') }}</template>
            <template #targetheader>{{ t('crud.pickPermsDialog.targetHeader') }}</template>
            <template #item="slotProps">
                <div>{{ t(messagePath(slotProps.item.Group)) }}|{{ t(messagePath(slotProps.item.Group, slotProps.item.Item)) }}|{{ t(`action.${slotProps.item.Action}`) }}</div>
            </template>
        </PickList>
        <template #footer>
            <Button :label="t('crud.pickPermsDialog.cancel')" icon="pi pi-times" class="p-button-text" @click="$emit('update:visible', false)" />
            <Button :label="t('crud.pickPermsDialog.save')" icon="pi pi-check" class="p-button-text" @click="yes" />
        </template>
    </Dialog>
</template>

<style scoped lang="scss"></style>
