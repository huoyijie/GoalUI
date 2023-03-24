<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount, computed } from 'vue';
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import CrudService from '@/service/CrudService';
import AuthService from '@/service/AuthService';
import { v4 as uuidv4 } from 'uuid';
import useValidate from '@vuelidate/core';
import { required, email, alphaNum, alpha, minLength, maxLength, minValue, maxValue } from '@vuelidate/validators';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const crudService = new CrudService();
const authService = new AuthService();

const group = ref(route.params.group);
const item = ref(route.params.item);
const authRole = computed(() => group.value == 'auth' && item.value == 'role');
const authUser = computed(() => group.value == 'auth' && item.value == 'user');
const authSession = computed(() => group.value == 'auth' && item.value == 'session');

const dt = ref(null);
const filters = ref({});
const columns = ref(null);
const records = ref(null);
const record = ref({});
const selectedRecords = ref(null);
const errors = ref({});
const crudPerms = ref({});

const resetState = () => {
    record.value = {};
    selectedRecords.value = null;
    errors.value = {};
};

const crudGet = async () => {
    let { perms, cols } = await crudService.perms(router, group.value, item.value);
    crudPerms.value = perms;

    if (crudPerms.value.get) {
        records.value = await crudService.get(router, group.value, item.value);
    } else {
        records.value = await crudService.getMine(router, group.value, item.value);
    }
    // must update columns together with records
    columns.value = cols;
    resetState();
};

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};
onBeforeMount(() => {
    initFilters();
});
onMounted(() => {
    crudGet();
});
onBeforeRouteUpdate((to) => {
    group.value = to.params.group;
    item.value = to.params.item;
    crudGet();
});

const recordDialog = ref(false);
const deleteRecordDialog = ref(false);
const deleteRecordsDialog = ref(false);
const pickPermsDialog = ref(false);
const pickRolesDialog = ref(false);

const pickPermsValue = ref([[], []]);
const pickPerms = async (pickRecord) => {
    record.value = pickRecord;
    let perms = await authService.perms(router, pickRecord[primaryKey.value]);
    pickPermsValue.value = perms;
    pickPermsDialog.value = true;
};
const changePerms = async () => {
    await authService.changePerms(router, record.value[primaryKey.value], pickPermsValue.value[1]);
    record.value = {};
    pickPermsDialog.value = false;
};

const pickRolesValue = ref([[], []]);
const pickRoles = async (pickRecord) => {
    record.value = pickRecord;
    let roles = await authService.roles(router, pickRecord[primaryKey.value]);
    pickRolesValue.value = roles;
    pickRolesDialog.value = true;
};
const changeRoles = async () => {
    await authService.changeRoles(router, record.value[primaryKey.value], pickRolesValue.value[1]);
    record.value = {};
    pickRolesDialog.value = false;
};

const primaryKey = computed(() => {
    if (columns.value) {
        for (let column of columns.value) {
            if (column.Primary) {
                return column.Name;
            }
        }
    }
    return '';
});

const uniqueKeys = computed(() => {
    const keys = [];
    if (columns.value) {
        for (let column of columns.value) {
            if (column.Unique) {
                keys.push(column);
            }
        }
    }
    return keys;
});

const isEditRecord = computed(() => {
    return !!record.value[primaryKey.value];
});

const rules = computed(() => {
    const rules = {};
    for (let column of columns.value) {
        if (column.Primary || column.Preload) {
            continue;
        }
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
                        if (column.Type === 'string') {
                            rules[column.Name].minLength = minLength(parts[1]);
                        } else {
                            rules[column.Name].minValue = minValue(parts[1]);
                        }
                    } else if (parts[0] === 'max') {
                        if (column.Type === 'string') {
                            rules[column.Name].maxLength = maxLength(parts[1]);
                        } else {
                            rules[column.Name].maxValue = maxValue(parts[1]);
                        }
                    }
                }
            }
        }
    }
    return rules;
});

const openNew = () => {
    record.value = {};
    errors.value = {};
    if (authSession.value) {
        record.value.Key = uuidv4().replaceAll('-', '');
    }
    recordDialog.value = true;
};

const saveRecord = async () => {
    errors.value = {};

    // validate forms
    const v$ = useValidate(rules.value, record.value);
    if (!(await v$.value.$validate())) {
        for (let err of v$.value.$errors) {
            errors.value[err.$property] = err.$message;
        }
        return;
    }

    // check unique keys
    for (let c of uniqueKeys.value) {
        let data = {};
        data[c.Name] = record.value[c.Name];
        let exist = await crudService.exist(router, group.value, item.value, data);
        if (exist) {
            if (exist[primaryKey.value] != record.value[primaryKey.value]) {
                errors.value[c.Name] = 'Value is used';
                return;
            }
        }
    }

    let msg = null;
    const pk = primaryKey.value;
    if (record.value[pk]) {
        await crudService.change(router, group.value, item.value, record.value);
        for (let i = 0; i < records.value.length; i++) {
            if (records.value[i][pk] == record.value[pk]) {
                records.value[i] = record.value;
            }
        }
        msg = 'Updated';
    } else {
        let res = await crudService.add(router, group.value, item.value, record.value);
        records.value ||= [];
        records.value.push(res);
        msg = 'Created';
    }

    // todo reload username
    if (authSession.value && !isEditRecord.value) {
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }

    toast.add({ severity: 'success', summary: 'Successful', detail: `${item.value} ${msg}`, life: 3000 });

    recordDialog.value = false;
    record.value = {};
    errors.value = {};
};

const changeRecord = (changeRecord) => {
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
    toast.add({ severity: 'success', summary: 'Successful', detail: `${item.value} Deleted`, life: 3000 });
};

const exportCSV = () => {
    dt.value.exportCSV();
};

const confirmDeleteSelected = () => {
    deleteRecordsDialog.value = true;
};

const deleteSelectedRecords = async () => {
    let ids = selectedRecords.value.map((val) => val[primaryKey.value]);
    await crudService.batchDelete(router, group.value, item.value, ids);
    records.value = records.value.filter((val) => !selectedRecords.value.includes(val));
    deleteRecordsDialog.value = false;
    selectedRecords.value = null;
    toast.add({ severity: 'success', summary: 'Successful', detail: `${item.value}s Deleted`, life: 3000 });
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toast />
                <TopToolbar :crudPerms="crudPerms" :selectedRecords="selectedRecords" @new-record="openNew" @delete-records="confirmDeleteSelected" @export="exportCSV($event)" />

                <DataTable
                    ref="dt"
                    :value="records"
                    v-model:selection="selectedRecords"
                    :dataKey="primaryKey"
                    :paginator="true"
                    :rows="10"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    :currentPageReportTemplate="`Showing {first} to {last} of {totalRecords} ${item}`"
                    responsiveLayout="scroll"
                >
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Manage {{ item }}</h5>
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" placeholder="Search..." />
                            </span>
                        </div>
                    </template>

                    <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

                    <template v-for="c in columns" :key="c.Name">
                        <Column v-if="!c.Hidden" :field="c.Name" :header="c.Name" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                            <template #body="slotProps">
                                <RecordView :column="c" :record="slotProps.data" />
                            </template>
                        </Column>
                    </template>

                    <Column headerStyle="min-width:15rem;">
                        <template #body="slotProps">
                            <OperationGroup
                                :group="group"
                                :item="item"
                                :crudPerms="crudPerms"
                                @pick-perms="pickPerms(slotProps.data)"
                                @pick-roles="pickRoles(slotProps.data)"
                                @change-record="changeRecord(slotProps.data)"
                                @delete-record="confirmDeleteRecord(slotProps.data)"
                            />
                        </template>
                    </Column>
                </DataTable>

                <RecordDialog v-model:visible="recordDialog" v-model:record="record" v-model:errors="errors" :group="group" :item="item" :columns="columns" :pk="primaryKey" @save-record="saveRecord" />

                <PickPermsDialog :authRole="authRole" v-model:visible="pickPermsDialog" v-model="pickPermsValue" :yes="changePerms" />

                <PickRolesDialog :authUser="authUser" v-model:visible="pickRolesDialog" v-model="pickRolesValue" :yes="changeRoles" />

                <ConfirmDelDialog :item="item" :record="record" :pk="primaryKey" v-model:visible="deleteRecordDialog" v-model="deleteRecordsDialog" @delete-record="deleteRecord" @delete-records="deleteSelectedRecords" />
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
