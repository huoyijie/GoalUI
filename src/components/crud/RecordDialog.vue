<script setup>
import CrudHelper from '@/helper/CrudHelper';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const i18n = useI18n();
const { t } = i18n;

const props = defineProps(['visible', 'item', 'record', 'columns', 'pk', 'refList', 'errors']);
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

const selected = (c) => {
    let defOption = props.record[c.Ref.Name] || {};
    if (defOption) {
        for (let option of props.refList) {
            if (defOption[c.Ref.Field] === option[c.Ref.Field]) {
                return option;
            }
        }
    }
    return defOption;
};

const isReadonly = (c) => {
    return c.Readonly || (c.Postonly && isEditRecord.value);
};

const columnName = (c) => {
    if (c.Ref) {
        return c.Ref.Name;
    }
    return c.Name;
};

const updateRecord = (c, $event) => {
    let tmpRecord = props.record;
    if (c.Ref) {
        // todo hardcode `ID`
        tmpRecord[c.Name] = $event.ID;
        tmpRecord[c.Ref.Name] = $event;
    } else if (crudHelper.isTime(c)) {
        tmpRecord[c.Name] = new Date($event);
    } else {
        tmpRecord[c.Name] = $event;
    }
    $emit('update:record', tmpRecord);
};
</script>

<template>
    <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" :style="{ width: '450px' }" :header="`${item} ${t('crud.recordDialog.details')}`" modal class="p-fluid">
        <div v-for="(c, idx) in columns" :key="c.Name" class="field">
            <template v-if="!(c.Primary || c.Preload)">
                <label :for="c.Name">{{ columnName(c) }}</label>
                <Dropdown
                    v-if="crudHelper.isRef(c)"
                    :modelValue="selected(c)"
                    @update:modelValue="updateRecord(c, $event)"
                    :options="refList"
                    filter
                    :optionLabel="c.Ref.Field"
                    :placeholder="`Select a ${c.Ref.Name}`"
                    :id="c.Name"
                    @focus="clearErr(c)"
                    :disabled="isReadonly(c)"
                    :autofocus="idx == 1"
                    :class="{ 'p-invalid': hasErr(c) }"
                />
                <InputNumber
                    v-else-if="crudHelper.isNumber(c)"
                    :min="crudHelper.minVal(c)"
                    :max="crudHelper.maxVal(c)"
                    :minFractionDigits="crudHelper.minFractionDigits(c)"
                    :maxFractionDigits="crudHelper.maxFractionDigits(c)"
                    showButtons
                    :id="c.Name"
                    :modelValue="record[c.Name]"
                    @update:modelValue="updateRecord(c, $event)"
                    @focus="clearErr(c)"
                    :disabled="isReadonly(c)"
                    :autofocus="idx == 1"
                    :class="{ 'p-invalid': hasErr(c) }"
                >
                </InputNumber>
                <Calendar v-else-if="crudHelper.isTime(c)" :id="c.Name" :modelValue="record[c.Name]" @update:modelValue="updateRecord(c, $event)" @show="clearErr(c)" showTime showIcon :class="{ 'p-invalid': hasErr(c) }" :disabled="isReadonly(c)" />
                <div v-else-if="crudHelper.isBool(c)">
                    <InputSwitch :id="c.Name" :modelValue="record[c.Name]" @update:modelValue="updateRecord(c, $event)" :disabled="isReadonly(c)" />
                </div>
                <Password v-else-if="crudHelper.isPassword(c)" :id="c.Name" :modelValue="record[c.Name]" @update:modelValue="updateRecord(c, $event)" @focus="clearErr(c)" :class="{ 'p-invalid': hasErr(c) }" :disabled="isReadonly(c)" />
                <InputText v-else :id="c.Name" :modelValue="record[c.Name]" @update:modelValue="updateRecord(c, $event)" @focus="clearErr(c)" :disabled="isReadonly(c)" :autofocus="idx == 1" :class="{ 'p-invalid': hasErr(c) }" />
                <small class="p-error">{{ showErr(c) }}</small>
            </template>
        </div>
        <template #footer>
            <Button :label="t('crud.recordDialog.cancel')" icon="pi pi-times" class="p-button-text" @click="$emit('update:visible', false)" />
            <Button :label="t('crud.recordDialog.save')" icon="pi pi-check" class="p-button-text" @click="$emit('save-record')" />
        </template>
    </Dialog>
</template>
