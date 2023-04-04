<script setup>
import { useI18n } from 'vue-i18n';
import CrudHelper from '@/helper/CrudHelper';

const { t } = useI18n();
const crudHelper = new CrudHelper();

defineProps(['group', 'item', 'column', 'modelValue']);
const $emit = defineEmits(['update:modelValue']);

const columnPath = (group, item, column) => {
    return `group.${group}.${item}.${column.Name}`;
};
</script>

<template>
    <template v-if="crudHelper.isSwitch(column)">
        <label :for="`${column.Name}-filter`" class="font-bold mr-2">{{ t(columnPath(group, item, column)) }}</label>
        <TriStateCheckbox :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)" :inputId="`${column.Name}-filter`" />
    </template>
    <InputNumber v-else-if="crudHelper.isNumber(column)" :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)" :placeholder="`${t('crud.filterView.input')}${t(columnPath(group, item, column))}`" />
    <Calendar v-else-if="crudHelper.isCalendar(column)" :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)" dateFormat="mm/dd/yy" placeholder="mm/dd/yyyy" mask="99/99/9999" />
    <InputText v-else :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)" type="text" class="p-column-filter" :placeholder="`${t('crud.filterView.searchBy')}${t(columnPath(group, item, column))}`" />
</template>
