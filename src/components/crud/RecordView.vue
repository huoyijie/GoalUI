<script setup>
import { useI18n } from 'vue-i18n';
import { getMediaURL } from '@/service/FetchService';
import CrudHelper from '@/helper/CrudHelper';

const { t, d } = useI18n();
const crudHelper = new CrudHelper();

const props = defineProps(['group', 'item', 'column', 'record']);

const showOption = (column) => {
    const option = crudHelper.fieldValue(column, props.record);
    if (option) {
        return t(optionPath(props.group, props.item, column, option));
    }
};

const optionPath = (group, item, column, option) => {
    return `group.${group}.${item}.options.${column.Name}.${option}`;
};
</script>

<template>
    <template v-if="crudHelper.isSwitch(column)">
        <i class="pi" :class="{ 'pi-check-circle text-green-500 ': crudHelper.fieldValue(column, record), 'pi-times-circle text-red-500': !crudHelper.fieldValue(column, record) }"></i>
    </template>
    <template v-else-if="crudHelper.isCalendar(column)">
        {{ d(crudHelper.fieldValue(column, record), crudHelper.isShowTime(column) ? 'datetime' : 'date') }}
    </template>
    <template v-else-if="crudHelper.isFile(column)">
        <span class="text-right w-9">
            <a :href="getMediaURL(crudHelper.fieldValue(column, record))" target="_blank" class="text-blue-600">
                {{ crudHelper.fieldValue(column, record) }}
            </a>
        </span>
    </template>
    <template v-else-if="crudHelper.isDropdownOptions(column)">
        <span class="text-right w-9">{{ showOption(column) }}</span>
    </template>
    <template v-else>
        <span class="text-right w-9">{{ crudHelper.fieldValue(column, record) }}</span>
    </template>
</template>
