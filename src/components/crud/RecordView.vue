<script setup>
import { useI18n } from 'vue-i18n';
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
        <Badge v-if="crudHelper.fieldValue(column, record)" value="✓" severity="success"> </Badge>
        <Badge v-else value="x" severity="danger"></Badge>
    </template>
    <template v-else-if="crudHelper.isCalendar(column)">
        <Calendar :modelValue="crudHelper.fieldValue(column, record)" :showTime="crudHelper.isShowTime(column)" readonly />
    </template>
    <template v-else-if="adminOpLog && adminOpLogAction(column)"> {{ t(groupPath(record.Group)) }}|{{ t(itemPath(record.Group, record.Item)) }}|{{ t(`action.${record.Action}`) }} </template>
    <template v-else>
        {{ crudHelper.fieldValue(column, record) }}
    </template>
</template>
