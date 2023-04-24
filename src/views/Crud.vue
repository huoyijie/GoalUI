<script setup>
import { FilterMatchMode, FilterOperator } from 'primevue/api';
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import CrudHelper from '@/helper/CrudHelper';
import CrudService from '@/service/CrudService';
import AuthService from '@/service/AuthService';
import { v4 as uuidv4 } from 'uuid';
import useValidate from '@vuelidate/core';
import { required, email, alphaNum, alpha, minLength, maxLength, minValue, maxValue } from '@/i18n/validators';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const { t } = useI18n();

const crudHelper = new CrudHelper();
const crudService = new CrudService();
const authService = new AuthService();

const group = ref(route.params.group);
const item = ref(route.params.item);
const authRole = computed(() => group.value == 'auth' && item.value == 'role');
const authUser = computed(() => group.value == 'auth' && item.value == 'user');

const dt = ref(null);
const filters = ref({});
const lazyParams = ref({});
const initLazyParams = (columns) => {
    filters.value = {};
    const { field, order } = getSort(columns);
    lazyParams.value = {
        first: 0,
        rows: dt.value.rows,
        sortField: field,
        sortOrder: order,
        filters: {}
    };
};
const datatable = ref({
    lazy: false,
    ctrl: false,
    columns: [],
    perms: {}
});
const selectedColumns = ref([]);
const totalRecords = ref(0);
const records = ref(null);
const record = ref({});
const dropdownData = ref({});
const multiSelectData = ref({});
const selectedRecords = ref(null);
const errors = ref({});

const traslateColumn = (col) => {
    const copy = { ...col };
    copy.label = t(columnPath(group.value, item.value, col));
    return copy;
};
const selectedOptions = computed(() => {
    return selectedColumns.value.map(traslateColumn);
});
const options = computed(() => {
    return datatable.value.columns.filter((col) => !crudHelper.isHidden(col)).map(traslateColumn);
});
const includes = (val, col) => {
    for (let v of val) {
        if (v.Name == col.Name) {
            return true;
        }
    }
    return false;
};
const onToggle = (val) => {
    selectedColumns.value = datatable.value.columns.filter((col) => !crudHelper.isHidden(col) && includes(val, col));
};

const resetState = () => {
    record.value = {};
    selectedRecords.value = null;
    errors.value = {};
};

const postProcess = (records) => {
    if (datatable.value.columns) {
        for (let c of datatable.value.columns) {
            if (crudHelper.isCalendar(c)) {
                for (let r of records) {
                    r[c.Name] = new Date(r[c.Name]);
                }
            }
        }
    }
};

const onLazyLoad = (event) => {
    if (datatable.value.lazy) {
        lazyParams.value = event;
        getRecordList(group.value, item.value, datatable.value);
    }
};

const onSearch = (event) => {
    filters.value['global'].value = event;
    if (datatable.value.lazy) {
        lazyParams.value.filters = filters.value;
        onLazyLoad(lazyParams.value);
    }
};

const getRecordList = async (g, i, data) => {
    const f = data.perms.get ? crudService.get : crudService.getMine;
    const recordList = await f(router, g, i, data.lazy && lazyParams.value);
    totalRecords.value = recordList.total;
    records.value = recordList.list;
    if (datatable.value != data) {
        // must update columns/group/item together with records
        datatable.value = data;
        selectedColumns.value = datatable.value.columns.filter((col) => !crudHelper.isHidden(col));
        group.value = g;
        item.value = i;
    }
    postProcess(records.value);
};

const crudGet = async (to) => {
    const g = to ? to.params.group : group.value;
    const i = to ? to.params.item : item.value;
    if (to) {
        resetState();
    }

    const data = (await crudService.datatable(router, g, i)) || {};
    if (!data.perms) {
        return;
    }

    loadDropdownData(g, i, data);
    loadMultiSelectData(data);

    if (data.lazy) {
        initLazyParams(data.columns);
    }

    initFilters(filterFields(data.columns));
    await getRecordList(g, i, data);
};

const filterFields = (columns) => {
    const fields = [];
    for (let column of columns) {
        if (crudHelper.isFilter(column)) {
            fields.push(column);
        }
    }
    return fields;
};

const initFilters = (filterFields) => {
    filters.value = {};
    filters.value.global = { value: null, matchMode: FilterMatchMode.CONTAINS };
    for (let column of filterFields) {
        let config = {};
        if (crudHelper.isSwitch(column)) {
            config = { value: null, matchMode: FilterMatchMode.EQUALS };
        } else if (crudHelper.isCalendar(column)) {
            config = { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] };
        } else if (crudHelper.isDropdownOptions(column)) {
            config = { value: null, matchMode: FilterMatchMode.EQUALS };
        } else if (crudHelper.isNumber(column)) {
            config = { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] };
        } else {
            config = { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] };
        }
        filters.value[crudHelper.filterField(column)] = config;
    }
};

const clearFilters = () => {
    initFilters(filterFields(datatable.value.columns));
    if (datatable.value.lazy) {
        lazyParams.value.filters = filters.value;
        onLazyLoad(lazyParams.value);
    }
};

const showFilterMatchModes = (c) => {
    if (crudHelper.isDropdownOptions(c)) {
        return false;
    }
    return true;
};

const globalFilterModel = computed(() => {
    if (filters.value.global) {
        return filters.value.global.value;
    }
    return null;
});

onMounted(() => {
    crudGet();
});
onBeforeRouteUpdate((to) => {
    crudGet(to);
});

const recordDialog = ref(false);
const btnSaveRecordClicked = ref(false);
const btnSaveRecordDisabled = computed(() => {
    const pk = primaryKey.value;
    if (record.value[pk]) {
        if (btnSaveRecordClicked.value) {
            return true;
        }
        for (let r of records.value) {
            if (r[pk] == record.value[pk]) {
                return JSON.stringify(r) == JSON.stringify(record.value);
            }
        }
        return true;
    } else {
        return btnSaveRecordClicked.value;
    }
});
const deleteRecordDialog = ref(false);
const deleteRecordsDialog = ref(false);
const pickPermsDialog = ref(false);
const pickRolesDialog = ref(false);
const btnPickPermsDisabled = ref(false);
const btnPickRolesDisabled = ref(false);

const pickPermsValue = ref([[], []]);
const pickPerms = async (pickRecord) => {
    record.value = pickRecord;
    let perms = await authService.perms(router, pickRecord[primaryKey.value]);
    pickPermsValue.value = perms;
    pickPermsDialog.value = true;
};
const changePerms = async () => {
    btnPickPermsDisabled.value = true;
    await authService.changePerms(router, record.value[primaryKey.value], pickPermsValue.value[1]);
    record.value = {};
    pickPermsDialog.value = false;
    btnPickPermsDisabled.value = false;
};

const pickRolesValue = ref([[], []]);
const pickRoles = async (pickRecord) => {
    record.value = pickRecord;
    let roles = await authService.roles(router, pickRecord[primaryKey.value]);
    pickRolesValue.value = roles;
    pickRolesDialog.value = true;
};
const changeRoles = async () => {
    btnPickRolesDisabled.value = true;
    await authService.changeRoles(router, record.value[primaryKey.value], pickRolesValue.value[1]);
    record.value = {};
    pickRolesDialog.value = false;
    btnPickRolesDisabled.value = false;
};

const primaryKey = computed(() => {
    if (datatable.value.columns) {
        for (let column of datatable.value.columns) {
            if (crudHelper.isPrimary(column)) {
                return column.Name;
            }
        }
    }
    return '';
});

const uniqueKeys = computed(() => {
    const keys = [];
    if (datatable.value.columns) {
        for (let column of datatable.value.columns) {
            if (crudHelper.isUnique(column)) {
                keys.push(column);
            }
        }
    }
    return keys;
});

const getSort = (columns) => {
    const res = {};
    if (columns) {
        for (let column of columns) {
            if (crudHelper.isPresort(column)) {
                res.field = column.Name;
                res.order = crudHelper.isDesc(column) ? -1 : 1;
            }
        }
    }
    return res;
};

const sort = computed(() => {
    return getSort(datatable.value.columns);
});

const uuids = computed(() => {
    const uuids = [];
    if (datatable.value.columns) {
        for (let column of datatable.value.columns) {
            if (crudHelper.isUuid(column)) {
                uuids.push(column);
            }
        }
    }
    return uuids;
});

const globalSearchFields = computed(() => {
    const fields = [];
    if (datatable.value.columns) {
        for (let column of datatable.value.columns) {
            if (crudHelper.isGlobalSearch(column)) {
                fields.push(column);
            }
        }
    }
    return fields;
});

const globalFilterFields = computed(() => {
    const fields = [];
    if (globalSearchFields.value.length > 0) {
        fields.push(crudHelper.filterField(globalSearchFields.value[0]));
    }
    return fields;
});

const rules = computed(() => {
    const rules = {};
    for (let column of datatable.value.columns) {
        if (column.ValidateRule) {
            rules[column.Name] = {};
            for (let rule of column.ValidateRule.split(',')) {
                if (rule === 'required') {
                    rules[column.Name].required = required;
                } else if (rule === 'alpha') {
                    rules[column.Name].alpha = alpha;
                } else if (rule === 'alphanum') {
                    rules[column.Name].alphaNum = alphaNum;
                } else if (rule === 'email') {
                    rules[column.Name].email = email;
                }
                if (rule.includes('=')) {
                    let parts = rule.split('=');
                    if (parts[0] === 'min') {
                        if (crudHelper.isString(column)) {
                            rules[column.Name].minLength = minLength(parts[1]);
                        } else {
                            rules[column.Name].minValue = minValue(parts[1]);
                        }
                    } else if (parts[0] === 'max') {
                        if (crudHelper.isString(column)) {
                            rules[column.Name].maxLength = maxLength(parts[1]);
                        } else {
                            rules[column.Name].maxValue = maxValue(parts[1]);
                        }
                    } else if (parts[0] === 'len') {
                        rules[column.Name].minLength = minLength(parts[1]);
                        rules[column.Name].maxLength = maxLength(parts[1]);
                    }
                }
            }
        }
    }
    return rules;
});

const dropdowns = (columns) => {
    const dds = [];
    for (let column of columns) {
        if (crudHelper.isDropdown(column)) {
            dds.push(column);
        }
    }
    return dds;
};

const loadDropdownData = async (g, i, data) => {
    for (let dropdown of dropdowns(data.columns)) {
        const bt = crudHelper.belongTo(dropdown);
        const ho = crudHelper.hasOne(dropdown);
        if (bt) {
            const recordList = await crudService.get(router, bt.Pkg, bt.Name);
            dropdownData.value[dropdown.Name] = recordList.list;
        } else if (ho) {
            const recordList = await crudService.get(router, ho.Pkg, ho.Name);
            dropdownData.value[dropdown.Name] = recordList.list;
        } else {
            dropdownData.value[dropdown.Name] = await crudService.select(router, g, i, dropdown.Name);
        }
    }
};

const multiSelects = (columns) => {
    const mss = [];
    for (let column of columns) {
        if (crudHelper.isMultiSelect(column)) {
            mss.push(column);
        }
    }
    return mss;
};

const loadMultiSelectData = async (data) => {
    for (let c of multiSelects(data.columns)) {
        const many2Many = crudHelper.many2Many(c);
        if (many2Many) {
            const recordList = await crudService.get(router, many2Many.Pkg, many2Many.Name);
            multiSelectData.value[c.Name] = recordList.list;
        }
    }
};

const openNew = async () => {
    record.value = {};
    errors.value = {};
    for (let c of uuids.value) {
        record.value[c.Name] = uuidv4().replaceAll('-', '');
    }
    recordDialog.value = true;
};

const saveRecord = async () => {
    btnSaveRecordClicked.value = true;
    errors.value = {};

    // validate forms
    const v$ = useValidate(rules.value, record.value);
    if (!(await v$.value.$validate())) {
        for (let err of v$.value.$errors) {
            errors.value[err.$property] = err.$message;
        }
        btnSaveRecordClicked.value = false;
        return;
    }

    // check unique keys
    for (let c of uniqueKeys.value) {
        let data = {};
        data[c.Name] = record.value[c.Name];
        let exist = await crudService.exist(router, group.value, item.value, data);
        if (exist) {
            if (exist[primaryKey.value] != record.value[primaryKey.value]) {
                errors.value[c.Name] = t('validations.used');
                btnSaveRecordClicked.value = false;
                return;
            }
        }
    }

    let res, msg;
    const pk = primaryKey.value;
    if (record.value[pk]) {
        res = await crudService.change(router, group.value, item.value, record.value);
        msg = t('crud.recordDialog.updated');
    } else {
        res = await crudService.add(router, group.value, item.value, record.value);
        msg = t('crud.recordDialog.created');
    }

    if (res) {
        await getRecordList(group.value, item.value, datatable.value);
        toast.add({ severity: 'success', summary: t('crud.recordDialog.successful'), detail: `${t(messagePath(group.value, item.value))}${msg}`, life: 3000 });
    }

    recordDialog.value = false;
    btnSaveRecordClicked.value = false;
    record.value = {};
    errors.value = {};
};

const changeRecord = async (changeRecord) => {
    record.value = { ...changeRecord };
    errors.value = {};
    recordDialog.value = true;
};

const confirmDeleteRecord = (delRecord) => {
    record.value = delRecord;
    deleteRecordDialog.value = true;
};

const deleteRecord = async () => {
    await crudService.delete(router, group.value, item.value, record.value);
    records.value = records.value.filter((val) => val[primaryKey.value] !== record.value[primaryKey.value]);
    deleteRecordDialog.value = false;
    record.value = {};
    toast.add({ severity: 'success', summary: t('crud.recordDialog.successful'), detail: `${t(messagePath(group.value, item.value))}${t('crud.recordDialog.deleted')}`, life: 3000 });
};

const exportCSV = () => {
    dt.value.exportCSV();
};

const confirmDeleteSelected = () => {
    deleteRecordsDialog.value = true;
};

const deleteSelectedRecords = async () => {
    await crudService.batchDelete(router, group.value, item.value, selectedRecords.value);
    records.value = records.value.filter((val) => !selectedRecords.value.includes(val));
    deleteRecordsDialog.value = false;
    selectedRecords.value = null;
    toast.add({ severity: 'success', summary: t('crud.recordDialog.successful'), detail: `${t(messagePath(group.value, item.value), 2)}${t('crud.recordDialog.deleted')}`, life: 3000 });
};

const messagePath = (group, item) => {
    return `group.${group}.${item}.label`;
};

const columnPath = (group, item, column) => {
    return `group.${group}.${item}.fields.${column.Name}`;
};

const headerStyle = (c) => {
    if (crudHelper.isPrimary(c)) {
        return 'width: 3rem';
    } else if (crudHelper.isCalendar(c)) {
        return 'width: 14%; min-width: 15rem;';
    } else {
        return 'width: 14%; min-width: 10rem;';
    }
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toast />
                <TopToolbar :crudPerms="datatable.perms" :selectedRecords="selectedRecords" @new-record="openNew" @delete-records="confirmDeleteSelected" @export="exportCSV($event)" />

                <DataTable
                    ref="dt"
                    :totalRecords="totalRecords"
                    :value="records"
                    v-model:selection="selectedRecords"
                    :dataKey="primaryKey"
                    :lazy="datatable.lazy"
                    :paginator="true"
                    :rows="10"
                    :sortField="sort.field"
                    :sortOrder="sort.order"
                    :globalFilterFields="globalFilterFields"
                    v-model:filters="filters"
                    filterDisplay="menu"
                    @page="onLazyLoad"
                    @sort="onLazyLoad"
                    @filter="onLazyLoad"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    :currentPageReportTemplate="`${t('crud.showing')} {first} ${t('crud.to')} {last}, ${t('crud.total')} {totalRecords} ${t(messagePath(group, item), 2)}`"
                    responsiveLayout="stack"
                    striped-rows
                >
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">{{ t('crud.manage') }}{{ t(messagePath(group, item)) }}</h5>
                            <MultiSelect v-if="datatable.ctrl" class="app-column-select mt-3 md:m-0" :modelValue="selectedOptions" :options="options" optionLabel="label" @update:modelValue="onToggle" />
                            <div class="flex-1"></div>
                            <div v-if="globalSearchFields.length > 0" class="p-inputgroup flex-1 mt-3 md:m-0">
                                <InputText :modelValue="globalFilterModel" @update:modelValue="onSearch" :placeholder="`${t('crud.search')}${t(columnPath(group, item, globalSearchFields[0]))}`" />
                                <Button type="button" icon="pi pi-times" outlined @click="clearFilters" />
                            </div>
                        </div>
                    </template>

                    <template #empty>{{ t('crud.empty') }}</template>

                    <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

                    <Column
                        v-for="c in selectedColumns"
                        :key="c.Name"
                        :field="crudHelper.filterField(c)"
                        :filterField="crudHelper.filterField(c)"
                        :showFilterMatchModes="showFilterMatchModes(c)"
                        :header="t(columnPath(group, item, c))"
                        :dataType="crudHelper.dataType(c)"
                        :sortable="crudHelper.isSortable(c)"
                        :headerStyle="headerStyle(c)"
                    >
                        <template #body="slotProps">
                            <RecordView :group="group" :item="item" :column="c" :record="slotProps.data" />
                        </template>
                        <template v-if="crudHelper.isFilter(c)" #filter="{ filterModel }">
                            <FilterView v-model="filterModel.value" :group="group" :item="item" :column="c" :dropdownData="dropdownData" />
                        </template>
                    </Column>

                    <Column header=" " headerStyle="min-width: 15rem;">
                        <template #body="slotProps">
                            <OperationGroup
                                :group="group"
                                :item="item"
                                :crudPerms="datatable.perms"
                                @pick-perms="pickPerms(slotProps.data)"
                                @pick-roles="pickRoles(slotProps.data)"
                                @change-record="changeRecord(slotProps.data)"
                                @delete-record="confirmDeleteRecord(slotProps.data)"
                            />
                        </template>
                    </Column>
                </DataTable>

                <RecordDialog
                    v-model:visible="recordDialog"
                    v-model:record="record"
                    v-model:errors="errors"
                    :group="group"
                    :item="item"
                    :columns="datatable.columns"
                    :pk="primaryKey"
                    :dropdownData="dropdownData"
                    :multiSelectData="multiSelectData"
                    @save-record="saveRecord"
                    :disabled="btnSaveRecordDisabled"
                />

                <PickPermsDialog :authRole="authRole" v-model:visible="pickPermsDialog" v-model="pickPermsValue" :disabled="btnPickPermsDisabled" :yes="changePerms" />

                <PickRolesDialog :authUser="authUser" v-model:visible="pickRolesDialog" v-model="pickRolesValue" :yes="changeRoles" :disabled="btnPickRolesDisabled" />

                <ConfirmDelDialog :group="group" :item="item" :record="record" :pk="primaryKey" v-model:visible="deleteRecordDialog" v-model="deleteRecordsDialog" @delete-record="deleteRecord" @delete-records="deleteSelectedRecords" />
            </div>
        </div>
    </div>
</template>

<style lang="scss">
.app-column-select {
    height: 1.25rem;
    border: none;
    background: transparent;
    .p-multiselect-label-container {
        display: none;
    }
}
</style>
