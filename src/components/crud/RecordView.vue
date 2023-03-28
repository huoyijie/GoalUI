<script setup>
import CrudHelper from '@/helper/CrudHelper';

defineProps(['column', 'record']);

const crudHelper = new CrudHelper();
</script>

<template>
    <span class="p-column-title">{{ column.Name }}</span>
    <template v-if="crudHelper.isBool(column)">
        <Badge v-if="crudHelper.fieldValue(column, record)" value="✓" severity="success"> </Badge>
        <Badge v-else value="x" severity="danger"></Badge>
    </template>
    <template v-else-if="crudHelper.isTime(column)">
        <Calendar :modelValue="crudHelper.fieldValue(column, record)" showTime readonly />
    </template>
    <template v-else>
        {{ crudHelper.fieldValue(column, record) }}
    </template>
</template>
