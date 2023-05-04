<script setup>
import { getCrudURL } from '@/service/CrudService';
import CrudHelper from '@/helper/CrudHelper';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const props = defineProps(['visible', 'group', 'item', 'record', 'columns', 'pk', 'dropdownData', 'multiSelectData', 'subDataTables', 'errors', 'disabled']);
const $emit = defineEmits(['update:visible', 'update:record', 'update:errors', 'save-record']);

const crudHelper = new CrudHelper();

const hasErr = (c, sub, idx) => {
    if (props.errors[c.Name] && idx < props.errors[c.Name].length) {
        return !sub || !!props.errors[c.Name][idx][sub.Name];
    }
    return false;
};
const showErr = (c, sub, idx) => {
    if (!sub) {
        if (typeof props.errors[c.Name] === 'string') {
            return props.errors[c.Name];
        }
    } else if (props.errors[c.Name] && idx < props.errors[c.Name].length) {
        return props.errors[c.Name][idx][sub.Name];
    }
    return null;
};
const clearErr = (c, sub, idx) => {
    let errors = props.errors;
    if (!sub) {
        delete errors[c.Name];
    } else if (errors[c.Name] && idx < errors[c.Name].length) {
        delete errors[c.Name][idx][sub.Name];
    }
    $emit('update:errors', errors);
};

const isEditRecord = computed(() => {
    return !!props.record[props.pk];
});

const selected = (c) => {
    let curValue = props.record[c.Name];
    const bt = crudHelper.belongTo(c);
    const ho = crudHelper.hasOne(c);
    if (bt) {
        curValue ||= {};
        for (let option of props.dropdownData[c.Name]) {
            if (curValue[bt.Field] === option[bt.Field]) {
                return option;
            }
        }
    } else if (ho) {
        curValue ||= {};
        for (let option of props.dropdownData[c.Name]) {
            if (curValue[ho.Field] === option[ho.Field]) {
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
    const bt = crudHelper.belongTo(column);
    const ho = crudHelper.hasOne(column);
    if (bt || ho) {
        return props.dropdownData[column.Name];
    }
    const opts = [];
    for (let { label, value } of props.dropdownData[column.Name]) {
        label = t(optionPath(props.group, props.item, column, label));
        opts.push({ label, value });
    }
    return opts;
};

const optionLabel = (c) => {
    const bt = crudHelper.belongTo(c);
    const ho = crudHelper.hasOne(c);
    if (bt) {
        return bt.Field;
    } else if (ho) {
        return ho.Field;
    } else {
        return 'label';
    }
};

const optionValue = (c) => {
    const bt = crudHelper.belongTo(c);
    const ho = crudHelper.hasOne(c);
    if (!(bt || ho)) {
        return 'value';
    }
};

const dropdownPlaceholder = (c) => {
    const bt = crudHelper.belongTo(c);
    const ho = crudHelper.hasOne(c);
    if (bt) {
        return `${t('crud.recordDialog.select')}${t(messagePath(bt.Pkg, bt.Name.toLowerCase()))}`;
    } else if (ho) {
        return `${t('crud.recordDialog.select')}${t(messagePath(ho.Pkg, ho.Name.toLowerCase()))}`;
    } else {
        return `${t('crud.recordDialog.select')}${t(columnPath(props.group, props.item, c))}`;
    }
};

const multiSelectPlaceholder = (c) => {
    return `${t('crud.recordDialog.selects')}${t(columnPath(props.group, props.item, c))}`;
};

const multiOptions = (column) => {
    if (crudHelper.many2Many(column)) {
        return props.multiSelectData[column.Name];
    }
};

const multiOptionLabel = (column) => {
    const m2m = crudHelper.many2Many(column);
    if (m2m) {
        return m2m.Field;
    } else {
        return 'label';
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

const addOne = (c) => {
    const items = props.record[c.Name];
    items.push({});
    updateRecord(c, items);
};

const deleteOne = (c, idx) => {
    if (props.record[c.Name].length > 1 || !crudHelper.isRequired(c)) {
        const items = props.record[c.Name].filter((_, i) => i !== idx);
        updateRecord(c, items);
    }
};

const updateSubRecord = (c, idx, sub, $event) => {
    let tmpRecord = props.record;
    if (crudHelper.isCalendar(sub)) {
        tmpRecord[c.Name][idx][sub.Name] = new Date($event);
    } else {
        tmpRecord[c.Name][idx][sub.Name] = $event;
    }
    $emit('update:record', tmpRecord);
};

const moveUp = (c, idx) => {
    if (idx > 0) {
        const items = props.record[c.Name];
        const it = items[idx - 1];
        items[idx - 1] = items[idx];
        items[idx] = it;
        updateRecord(c, items);
    }
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
                <MultiSelect
                    v-else-if="crudHelper.isMultiSelect(c)"
                    :options="multiOptions(c)"
                    :optionLabel="multiOptionLabel(c)"
                    :placeholder="multiSelectPlaceholder(c)"
                    :modelValue="record[c.Name]"
                    @update:modelValue="updateRecord(c, $event)"
                    :id="c.Name"
                    filter
                    display="chip"
                    @focus="clearErr(c)"
                    :disabled="isReadonly(c)"
                    :autofocus="idx == 1"
                    :class="{ 'p-invalid': hasErr(c) }"
                />
                <template v-else-if="crudHelper.isInlineMany(c)">
                    <Panel v-for="(it, idx) in record[c.Name]" :key="idx" :header="`${t(messagePath(crudHelper.hasMany(c).Pkg.toLowerCase(), crudHelper.hasMany(c).Name.toLowerCase()))} ${idx + 1}`" toggleable class="mb-2">
                        <template #icons>
                            <button v-if="idx !== 0" class="p-panel-header-icon p-link mr-2" @click="moveUp(c, idx)">
                                <span class="pi pi-chevron-up"></span>
                            </button>
                            <button v-if="record[c.Name].length > 1 || !crudHelper.isRequired(c)" class="p-panel-header-icon p-link mr-2" @click="deleteOne(c, idx)">
                                <span class="pi pi-trash"></span>
                            </button>
                        </template>
                        <div class="field" v-for="sub in subDataTables[c.Name]" :key="sub.Name">
                            <template v-if="!crudHelper.isPrimary(sub)">
                                <label :for="sub.Name">{{ t(columnPath(crudHelper.hasMany(c).Pkg.toLowerCase(), crudHelper.hasMany(c).Name.toLowerCase(), sub)) }}</label>
                                <InputText :id="sub.Name" :modelValue="it[sub.Name]" @update:modelValue="updateSubRecord(c, idx, sub, $event)" @focus="clearErr(c, sub, idx)" :class="{ 'p-invalid': hasErr(c, sub, idx) }" />
                                <small class="p-error">{{ showErr(c, sub, idx) }}</small>
                            </template>
                        </div>
                    </Panel>
                    <div class="text-right">
                        <Button icon="pi pi-plus" rounded severity="secondary" aria-label="Add" @click="addOne(c)" />
                    </div>
                </template>
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
