<script setup>
import { useI18n } from 'vue-i18n';
import { getMediaURL } from '@/settings';
import CrudHelper from '@/helper/CrudHelper';

const { t } = useI18n();
const crudHelper = new CrudHelper();

defineProps(['adminOpLog', 'group', 'item', 'column', 'record']);

const adminOpLogAction = (c) => {
    return c.Name === 'Action';
};

const groupPath = (group) => {
    return `group.${group}.label`;
};

const itemPath = (group, item) => {
    return `group.${group}.${item}.label`;
};

const columnPath = (group, item, column) => {
    return `group.${group}.${item}.${column.Name}`;
};
</script>

<template>
    <span class="p-column-title">{{ t(columnPath(group, item, column)) }}</span>
    <template v-if="crudHelper.isSwitch(column)">
        <i class="pi" :class="{ 'pi-check-circle text-green-500 ': crudHelper.fieldValue(column, record), 'pi-times-circle text-red-500': !crudHelper.fieldValue(column, record) }"></i>
    </template>
    <template v-else-if="crudHelper.isCalendar(column)">
        <Calendar :modelValue="crudHelper.fieldValue(column, record)" :showTime="crudHelper.isShowTime(column)" readonly />
    </template>
    <template v-else-if="crudHelper.isFile(column)">
        <a :href="getMediaURL(crudHelper.fieldValue(column, record))" target="_blank" class="text-blue-600">{{ crudHelper.fieldValue(column, record) }}</a>
    </template>
    <template v-else-if="adminOpLog && adminOpLogAction(column)"> {{ t(groupPath(record.Group)) }}|{{ t(itemPath(record.Group, record.Item)) }}|{{ t(`action.${record.Action}`) }} </template>
    <template v-else>
        {{ crudHelper.fieldValue(column, record) }}
    </template>
</template>
