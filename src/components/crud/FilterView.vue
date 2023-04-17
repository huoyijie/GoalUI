<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import CrudHelper from '@/helper/CrudHelper';

const { t } = useI18n();
const crudHelper = new CrudHelper();

const props = defineProps(['group', 'item', 'column', 'dropdownData', 'modelValue']);
const $emit = defineEmits(['update:modelValue']);

const adminOpLog = computed(() => {
    return props.group == 'admin' && props.item === 'operationlog';
});

const options = (column) => {
    const opts = [];
    for (let { label, value } of props.dropdownData[column.Name]) {
        if (adminOpLog.value) {
            switch (column.Name) {
                case 'Group': {
                    label = t(groupPath(label));
                    break;
                }
                case 'Item': {
                    label = t(groupPath(label));
                    value = value.split('.')[1];
                    break;
                }
                case 'Action': {
                    label = t(`action.${label}`);
                    break;
                }
            }
        } else {
            label = t(optionPath(props.group, props.item, column, label));
        }
        opts.push({ label, value });
    }
    return opts;
};

const groupPath = (group) => {
    return `group.${group}.label`;
};

const optionPath = (group, item, column, option) => {
    return `group.${group}.${item}.options.${column.Name}.${option}`;
};

const columnPath = (group, item, column) => {
    return `group.${group}.${item}.fields.${column.Name}`;
};
</script>

<template>
    <template v-if="crudHelper.isSwitch(column)">
        <label :for="`${column.Name}-filter`" class="font-bold mr-2">{{ t(columnPath(group, item, column)) }}</label>
        <TriStateCheckbox :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)" :inputId="`${column.Name}-filter`" />
    </template>
    <InputNumber v-else-if="crudHelper.isNumber(column)" :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)" :placeholder="`${t('crud.filterView.input')}${t(columnPath(group, item, column))}`" />
    <Calendar v-else-if="crudHelper.isCalendar(column)" :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)" dateFormat="mm/dd/yy" placeholder="mm/dd/yyyy" mask="99/99/9999" />
    <Dropdown
        v-else-if="crudHelper.isDropdownOptions(column)"
        :modelValue="modelValue"
        @update:modelValue="$emit('update:modelValue', $event)"
        :options="options(column)"
        optionLabel="label"
        optionValue="value"
        :placeholder="`${t('crud.recordDialog.select')}${t(columnPath(group, item, column))}`"
        :id="`${column.Name}-filter`"
    />
    <InputText v-else :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)" type="text" class="p-column-filter" :placeholder="`${t('crud.filterView.searchBy')}${t(columnPath(group, item, column))}`" />
</template>
