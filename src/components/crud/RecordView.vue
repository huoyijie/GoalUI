<script setup>
import CrudHelper from '@/helper/CrudHelper';

defineProps(['column', 'record']);

const crudHelper = new CrudHelper();
</script>

<template>
    <span class="p-column-title">{{ column.Name }}</span>
    <template v-if="crudHelper.isBool(column)">
        <Badge v-if="crudHelper.showPreloadField(column, record) == true" value="✓" severity="success"> </Badge>
        <Badge v-else value="x" severity="danger"></Badge>
    </template>
    <template v-else-if="crudHelper.isTime(column)">
        <Calendar :modelValue="crudHelper.showPreloadField(column, record)" showTime readonly />
    </template>
    <template v-else>
        {{ crudHelper.showPreloadField(column, record) }}
    </template>
</template>
