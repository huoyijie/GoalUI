<script setup>
import CrudHelper from '@/helper/CrudHelper';
import { computed } from 'vue';

const props = defineProps(['visible', 'group', 'item', 'record', 'columns', 'pk', 'errors']);
const $emit = defineEmits(['update:visible', 'update:record', 'update:errors', 'save-record']);

const crudHelper = new CrudHelper();

const hasErr = (c) => {
    return !!props.errors[c.Name];
};
const showErr = (c) => {
    return props.errors[c.Name];
};
const clearErr = (c) => {
    let errors = props.errors;
    delete errors[c.Name];
    $emit('update:errors', errors);
};

const isEditRecord = computed(() => {
    return !!props.record[props.pk];
});
const authSession = computed(() => props.group == 'auth' && props.item == 'session');
const isSessionRDOnly = (c) => {
    if (!authSession.value) {
        return false;
    }
    return (isEditRecord.value && c.Name === 'UserID') || c.Name === 'Key';
};

const updateRecord = (c, $event) => {
    let tmpRecord = props.record;
    tmpRecord[c.Name] = $event;
    $emit('update:record', tmpRecord);
};
</script>

<template>
    <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" :style="{ width: '450px' }" :header="`${item} Details`" modal class="p-fluid">
        <div v-for="(c, idx) in columns" :key="c.Name" class="field">
            <template v-if="!(c.Primary || c.Preload)">
                <label :for="c.Name">{{ c.Name }}</label>
                <InputNumber
                    v-if="crudHelper.isNumber(c)"
                    :min="crudHelper.minVal(c)"
                    :max="crudHelper.maxVal(c)"
                    :minFractionDigits="crudHelper.minFractionDigits(c)"
                    :maxFractionDigits="crudHelper.maxFractionDigits(c)"
                    showButtons
                    :id="c.Name"
                    :modelValue="record[c.Name]"
                    @update:modelValue="updateRecord(c, $event)"
                    @focus="clearErr(c)"
                    :disabled="isSessionRDOnly(c)"
                    :autofocus="idx == 1"
                    :class="{ 'p-invalid': hasErr(c) }"
                >
                </InputNumber>
                <Calendar v-else-if="crudHelper.isTime(c)" :id="c.Name" :modelValue="record[c.Name]" @update:modelValue="updateRecord(c, $event)" @show="clearErr(c)" showTime showIcon :class="{ 'p-invalid': hasErr(c) }" />
                <div v-else-if="crudHelper.isBool(c)">
                    <InputSwitch :id="c.Name" :modelValue="record[c.Name]" @update:modelValue="updateRecord(c, $event)" />
                </div>
                <Password v-else-if="crudHelper.isPassword(c)" :id="c.Name" :modelValue="record[c.Name]" @update:modelValue="updateRecord(c, $event)" @focus="clearErr(c)" :class="{ 'p-invalid': hasErr(c) }" :feedback="false" />
                <InputText v-else :id="c.Name" :modelValue="record[c.Name]" @update:modelValue="updateRecord(c, $event)" @focus="clearErr(c)" :disabled="isSessionRDOnly(c)" :autofocus="idx == 1" :class="{ 'p-invalid': hasErr(c) }" />
                <small>{{ showErr(c) }}</small>
            </template>
        </div>
        <template #footer>
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="$emit('update:visible', false)" />
            <Button label="Save" icon="pi pi-check" class="p-button-text" @click="$emit('save-record')" />
        </template>
    </Dialog>
</template>
