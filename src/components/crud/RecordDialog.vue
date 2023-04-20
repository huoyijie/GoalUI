<script setup>
import { getCrudURL } from '@/service/CrudService';
import CrudHelper from '@/helper/CrudHelper';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const props = defineProps(['visible', 'group', 'item', 'record', 'columns', 'pk', 'dropdownData', 'errors', 'disabled']);
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
    let curValue = props.record[c.Name];
    const belongTo = crudHelper.belongTo(c);
    if (belongTo) {
        curValue ||= {};
        for (let option of props.dropdownData[c.Name]) {
            if (curValue[belongTo.Field] === option[belongTo.Field]) {
                return option;
            }
        }
    } else {
        for (let option of props.dropdownData[c.Name]) {
            if (curValue === option) {
                return option;
            }
        }
    }
    return curValue;
};

const options = (column) => {
    const opts = [];
    const belongTo = crudHelper.belongTo(column);
    if (belongTo) {
        return props.dropdownData[column.Name];
    }
    for (let { label, value } of props.dropdownData[column.Name]) {
        label = t(optionPath(props.group, props.item, column, label));
        opts.push({ label, value });
    }
    return opts;
};

const optionLabel = (c) => {
    const belongTo = crudHelper.belongTo(c);
    if (belongTo) {
        return belongTo.Field;
    } else {
        return 'label';
    }
};

const optionValue = (c) => {
    const belongTo = crudHelper.belongTo(c);
    if (!belongTo) {
        return 'value';
    }
};

const dropdownPlaceholder = (c) => {
    const belongTo = crudHelper.belongTo(c);
    if (belongTo) {
        return `${t('crud.recordDialog.select')}${t(messagePath(belongTo.Pkg, belongTo.Name.toLowerCase()))}`;
    } else {
        return `${t('crud.recordDialog.select')}${t(columnPath(props.group, props.item, c))}`;
    }
};

const isReadonly = (c) => {
    return crudHelper.isReadonly(c) || (crudHelper.isPostonly(c) && isEditRecord.value);
};

const updateRecord = (c, $event) => {
    let tmpRecord = props.record;
    if (crudHelper.isCalendar(c)) {
        tmpRecord[c.Name] = new Date($event);
    } else {
        tmpRecord[c.Name] = $event;
    }
    $emit('update:record', tmpRecord);
};

const onUpload = (c, res) => {
    clearErr(c);
    let tmpRecord = props.record;
    tmpRecord[c.Name] = JSON.parse(res).data;
    $emit('update:record', tmpRecord);
};

const messagePath = (group, item) => {
    return `group.${group}.${item}.label`;
};

const optionPath = (group, item, column, option) => {
    return `group.${group}.${item}.options.${column.Name}.${option}`;
};

const columnPath = (group, item, column) => {
    return `group.${group}.${item}.fields.${column.Name}`;
};
</script>

<template>
    <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" :style="{ width: '450px' }" :header="`${t(messagePath(group, item))}${t('crud.recordDialog.details')}`" modal class="p-fluid">
        <div v-for="(c, idx) in columns" :key="c.Name" class="field">
            <template v-if="!crudHelper.isPrimary(c)">
                <label :for="c.Name">{{ t(columnPath(group, item, c)) }}</label>
                <Dropdown
                    v-if="crudHelper.isDropdown(c)"
                    :modelValue="selected(c)"
                    @update:modelValue="updateRecord(c, $event)"
                    :options="options(c)"
                    :optionLabel="optionLabel(c)"
                    :optionValue="optionValue(c)"
                    :placeholder="dropdownPlaceholder(c)"
                    :id="c.Name"
                    filter
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
                    :showButtons="crudHelper.isShowButtons(c)"
                    :id="c.Name"
                    :modelValue="record[c.Name]"
                    @update:modelValue="updateRecord(c, $event)"
                    @focus="clearErr(c)"
                    :disabled="isReadonly(c)"
                    :autofocus="idx == 1"
                    :class="{ 'p-invalid': hasErr(c) }"
                >
                </InputNumber>
                <Calendar
                    v-else-if="crudHelper.isCalendar(c)"
                    :id="c.Name"
                    :modelValue="record[c.Name]"
                    @update:modelValue="updateRecord(c, $event)"
                    @show="clearErr(c)"
                    :showTime="crudHelper.isShowTime(c)"
                    :showIcon="crudHelper.isShowIcon(c)"
                    :class="{ 'p-invalid': hasErr(c) }"
                    :disabled="isReadonly(c)"
                    placeholder="mm/dd/yyyy hh:MM"
                />
                <div v-else-if="crudHelper.isSwitch(c)">
                    <InputSwitch :id="c.Name" :modelValue="record[c.Name]" @update:modelValue="updateRecord(c, $event)" :disabled="isReadonly(c)" />
                </div>
                <div v-else-if="crudHelper.isFile(c)" style="display: flex">
                    <InputText :id="c.Name" :modelValue="record[c.Name]" readonly :class="{ 'p-invalid': hasErr(c), 'w-9': true }" />
                    <FileUpload mode="basic" auto name="file" :url="getCrudURL(group, item, `upload/${c.Name}`)" :maxFileSize="10000000" :disabled="isReadonly(c)" @upload="onUpload(c, $event.xhr.response)" withCredentials class="ml-3" />
                </div>
                <Password v-else-if="crudHelper.isPassword(c)" :id="c.Name" :modelValue="record[c.Name]" @update:modelValue="updateRecord(c, $event)" @focus="clearErr(c)" :class="{ 'p-invalid': hasErr(c) }" :disabled="isReadonly(c)" />
                <InputText v-else :id="c.Name" :modelValue="record[c.Name]" @update:modelValue="updateRecord(c, $event)" @focus="clearErr(c)" :disabled="isReadonly(c)" :autofocus="idx == 1" :class="{ 'p-invalid': hasErr(c) }" />
                <small class="p-error">{{ showErr(c) }}</small>
            </template>
        </div>
        <template #footer>
            <Button :label="t('crud.recordDialog.cancel')" icon="pi pi-times" class="p-button-text" @click="$emit('update:visible', false)" />
            <Button :label="t('crud.recordDialog.save')" icon="pi pi-check" class="p-button-text" @click="$emit('save-record')" :disabled="disabled" />
        </template>
    </Dialog>
</template>
