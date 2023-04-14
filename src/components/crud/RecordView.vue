<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { getMediaURL } from '@/settings';
import CrudHelper from '@/helper/CrudHelper';

const { t } = useI18n();
const crudHelper = new CrudHelper();

const props = defineProps(['group', 'item', 'column', 'record']);

const adminOpLog = computed(() => {
    return props.group == 'admin' && props.item === 'operationlog';
});

const logGroup = (c) => {
    return c.Name === 'Group';
};

const logItem = (c) => {
    return c.Name === 'Item';
};

const logAction = (c) => {
    return c.Name === 'Action';
};

const showOption = (column) => {
    const option = crudHelper.fieldValue(column, props.record);
    if (option) {
        return t(optionPath(props.group, props.item, column, option));
    }
};

const groupPath = (group) => {
    return `group.${group}.label`;
};

const itemPath = (group, item) => {
    return `group.${group}.${item}.label`;
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
        <Calendar :modelValue="crudHelper.fieldValue(column, record)" :showTime="crudHelper.isShowTime(column)" readonly class="text-right w-9" />
    </template>
    <template v-else-if="crudHelper.isFile(column)">
        <span class="text-right word-break w-9">
            <a :href="getMediaURL(crudHelper.fieldValue(column, record))" target="_blank" class="text-blue-600">
                {{ crudHelper.fieldValue(column, record) }}
            </a>
        </span>
    </template>
    <template v-else-if="adminOpLog && logGroup(column)">{{ t(groupPath(record.Group)) }}</template>
    <template v-else-if="adminOpLog && logItem(column)">{{ t(itemPath(record.Group, record.Item)) }}</template>
    <template v-else-if="adminOpLog && logAction(column)">{{ t(`action.${record.Action}`) }}</template>
    <template v-else-if="crudHelper.isDropdownOptions(column)">
        <span class="text-right word-break w-9">{{ showOption(column) }}</span>
    </template>
    <template v-else>
        <span class="text-right word-break w-9">{{ crudHelper.fieldValue(column, record) }}</span>
    </template>
</template>
