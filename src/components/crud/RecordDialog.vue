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
    if (!sub) {
        return !!props.errors[c.Name];
    } else if (props.errors[c.Name] && props.errors[c.Name][idx]) {
        return !!props.errors[c.Name][idx][sub.Name];
    }
};
const showErr = (c, sub, idx) => {
    if (!sub) {
        if (typeof props.errors[c.Name] === 'string') {
            return props.errors[c.Name];
        }
    } else if (props.errors[c.Name] && props.errors[c.Name][idx]) {
        return props.errors[c.Name][idx][sub.Name];
    }
    return null;
};
const clearErr = (c, sub, idx) => {
    let errors = props.errors;
    if (!sub) {
        delete errors[c.Name];
    } else if (errors[c.Name] && errors[c.Name][idx]) {
        delete errors[c.Name][idx][sub.Name];
    }
    $emit('update:errors', errors);
};

const isEditRecord = computed(() => {
    return !!props.record[props.pk];
});

const selected = (c, sub, idx) => {
    const col = !sub ? c : sub;
    const opts = !sub ? props.dropdownData[c.Name] : props.dropdownData[c.Name][sub.Name];
    let curValue = !sub ? props.record[c.Name] : props.record[c.Name][idx][sub.Name];

    const one2one = crudHelper.belongTo(col) || crudHelper.hasOne(col);
    if (one2one) {
        curValue ||= {};
        for (let option of opts) {
            if (curValue[one2one.Field] === option[one2one.Field]) {
                return option;
            }
        }
    } else {
        for (let option of opts) {
            if (curValue === option) {
                return option;
            }
        }
    }
    return curValue;
};

const options = (c, sub) => {
    const col = !sub ? c : sub;
    const opts = !sub ? props.dropdownData[c.Name] : props.dropdownData[c.Name][sub.Name];
    const one2one = crudHelper.belongTo(col) || crudHelper.hasOne(col);
    if (one2one) {
        return opts;
    }
    const options = [];
    for (let { label, value } of opts) {
        const hasMany = crudHelper.hasMany(c);
        const g = hasMany ? hasMany.Pkg : props.group;
        const i = hasMany ? hasMany.Name.toLowerCase() : props.item;
        label = t(optionPath(g, i, col, label));
        options.push({ label, value });
    }
    return options;
};

const optionLabel = (c, sub) => {
    const col = !sub ? c : sub;
    const one2one = crudHelper.belongTo(col) || crudHelper.hasOne(col);
    if (one2one) {
        return one2one.Field;
    } else {
        return 'label';
    }
};

const optionValue = (c, sub) => {
    const col = !sub ? c : sub;
    const one2one = crudHelper.belongTo(col) || crudHelper.hasOne(col);
    if (!one2one) {
        return 'value';
    }
};

const dropdownPlaceholder = (c, sub) => {
    const col = !sub ? c : sub;
    const one2one = crudHelper.belongTo(col) || crudHelper.hasOne(col);
    if (one2one) {
        return `${t('crud.recordDialog.select')}${t(messagePath(one2one.Pkg, one2one.Name.toLowerCase()))}`;
    } else if (!sub) {
        return `${t('crud.recordDialog.select')}${t(columnPath(props.group, props.item, col))}`;
    } else {
        const hasMany = crudHelper.hasMany(c);
        if (hasMany) {
            return `${t('crud.recordDialog.select')}${t(columnPath(hasMany.Pkg, hasMany.Name.toLowerCase(), col))}`;
        }
    }
};

const multiSelectPlaceholder = (c, sub) => {
    const col = !sub ? c : sub;
    const g = !sub ? props.group : crudHelper.hasMany(c).Pkg;
    const i = !sub ? props.item : crudHelper.hasMany(c).Name.toLowerCase();
    return `${t('crud.recordDialog.selects')}${t(columnPath(g, i, col))}`;
};

const multiOptions = (c, sub) => {
    return !sub ? props.multiSelectData[c.Name] : props.multiSelectData[c.Name][sub.Name];
};

const multiOptionLabel = (c, sub) => {
    const col = !sub ? c : sub;
    const m2m = crudHelper.many2Many(col);
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

const onUpload = (c, res, idx, sub) => {
    clearErr(c, sub, idx);
    let tmpRecord = props.record;
    if (!sub) {
        tmpRecord[c.Name] = JSON.parse(res).data;
    } else {
        tmpRecord[c.Name][idx][sub.Name] = JSON.parse(res).data;
    }
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
    <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" :style="{ width: '500px' }" :header="`${t(messagePath(group, item))}${t('crud.recordDialog.details')}`" modal class="p-fluid">
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
                                <Dropdown
                                    v-if="crudHelper.isDropdown(sub)"
                                    :modelValue="selected(c, sub, idx)"
                                    @update:modelValue="updateSubRecord(c, idx, sub, $event)"
                                    :options="options(c, sub)"
                                    :optionLabel="optionLabel(c, sub)"
                                    :optionValue="optionValue(c, sub)"
                                    :placeholder="dropdownPlaceholder(c, sub)"
                                    :id="sub.Name"
                                    filter
                                    @focus="clearErr(c, sub, idx)"
                                    :class="{ 'p-invalid': hasErr(c, sub, idx) }"
                                />
                                <MultiSelect
                                    v-else-if="crudHelper.isMultiSelect(sub)"
                                    :options="multiOptions(c, sub)"
                                    :optionLabel="multiOptionLabel(c, sub)"
                                    :placeholder="multiSelectPlaceholder(c, sub)"
                                    :modelValue="it[sub.Name]"
                                    @update:modelValue="updateSubRecord(c, idx, sub, $event)"
                                    :id="sub.Name"
                                    filter
                                    display="chip"
                                    @focus="clearErr(c, sub, idx)"
                                    :class="{ 'p-invalid': hasErr(c, sub, idx) }"
                                />
                                <InputNumber
                                    v-else-if="crudHelper.isNumber(sub)"
                                    :min="crudHelper.minVal(sub)"
                                    :max="crudHelper.maxVal(sub)"
                                    :minFractionDigits="crudHelper.minFractionDigits(sub)"
                                    :maxFractionDigits="crudHelper.maxFractionDigits(sub)"
                                    :showButtons="crudHelper.isShowButtons(sub)"
                                    :id="sub.Name"
                                    :modelValue="it[sub.Name]"
                                    @update:modelValue="updateSubRecord(c, idx, sub, $event)"
                                    @focus="clearErr(c, sub, idx)"
                                    :class="{ 'p-invalid': hasErr(c, sub, idx) }"
                                />
                                <Calendar
                                    v-else-if="crudHelper.isCalendar(sub)"
                                    :id="sub.Name"
                                    :modelValue="it[sub.Name]"
                                    @update:modelValue="updateSubRecord(c, idx, sub, $event)"
                                    @show="clearErr(c, sub, idx)"
                                    :showTime="crudHelper.isShowTime(sub)"
                                    :showIcon="crudHelper.isShowIcon(sub)"
                                    :class="{ 'p-invalid': hasErr(c, sub, idx) }"
                                    placeholder="mm/dd/yyyy hh:MM"
                                />
                                <div v-else-if="crudHelper.isSwitch(sub)">
                                    <InputSwitch :id="sub.Name" :modelValue="it[sub.Name]" @update:modelValue="updateSubRecord(c, idx, sub, $event)" />
                                </div>
                                <div v-else-if="crudHelper.isFile(sub)" style="display: flex">
                                    <InputText :id="sub.Name" :modelValue="it[sub.Name]" readonly :class="{ 'p-invalid': hasErr(c, sub, idx), 'w-9': true }" />
                                    <FileUpload
                                        mode="basic"
                                        auto
                                        name="file"
                                        :url="getCrudURL(crudHelper.hasMany(c).Pkg, crudHelper.hasMany(c).Name, `upload/${sub.Name}`)"
                                        :maxFileSize="10000000"
                                        @upload="onUpload(c, $event.xhr.response, idx, sub)"
                                        withCredentials
                                        class="ml-3"
                                    />
                                </div>
                                <Password
                                    v-else-if="crudHelper.isPassword(sub)"
                                    :id="sub.Name"
                                    :modelValue="it[sub.Name]"
                                    @update:modelValue="updateSubRecord(c, idx, sub, $event)"
                                    @focus="clearErr(c, sub, idx)"
                                    :class="{ 'p-invalid': hasErr(c, sub, idx) }"
                                />
                                <InputText v-else :id="sub.Name" :modelValue="it[sub.Name]" @update:modelValue="updateSubRecord(c, idx, sub, $event)" @focus="clearErr(c, sub, idx)" :class="{ 'p-invalid': hasErr(c, sub, idx) }" />
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
