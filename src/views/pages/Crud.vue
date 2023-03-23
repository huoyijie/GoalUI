<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount, computed } from 'vue';
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router';
import CrudService from '@/service/CrudService';
import CrudHelper from '@/helper/CrudHelper';
import AuthService from '@/service/AuthService';
import { useToast } from 'primevue/usetoast';
import { v4 as uuidv4 } from 'uuid';
import useValidate from '@vuelidate/core';
import { required, email, alphaNum, alpha, minLength, maxLength, minValue, maxValue } from '@vuelidate/validators';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const group = ref(route.params.group);
const item = ref(route.params.item);
const authRole = computed(() => group.value == 'auth' && item.value == 'role');
const authUser = computed(() => group.value == 'auth' && item.value == 'user');
const authSession = computed(() => group.value == 'auth' && item.value == 'session');
const columns = ref(null);
const records = ref(null);
const errors = ref({});
const hasErr = (c) => {
    return !!errors.value[c.Name];
};
const showErr = (c) => {
    return errors.value[c.Name];
};
const clearErr = (c) => {
    delete errors.value[c.Name];
};
const recordDialog = ref(false);
const deleteRecordDialog = ref(false);
const deleteRecordsDialog = ref(false);
const record = ref({});
const selectedRecords = ref(null);
const dt = ref(null);
const filters = ref({});
const crudService = new CrudService();
const crudHelper = new CrudHelper();
const authService = new AuthService();
const pickPermsDialog = ref(false);
const pickPermsValue = ref([[], []]);
const pickPerms = async (pickRecord) => {
    record.value = pickRecord;
    let perms = await authService.perms(router, pickRecord[getPrimarykey()]);
    pickPermsValue.value = perms;
    pickPermsDialog.value = true;
};
const changePerms = async () => {
    await authService.changePerms(router, record.value[getPrimarykey()], pickPermsValue.value[1]);
    record.value = {};
    pickPermsDialog.value = false;
};
const pickRolesValue = ref([[], []]);
const pickRolesDialog = ref(false);
const pickRoles = async (pickRecord) => {
    record.value = pickRecord;
    let roles = await authService.roles(router, pickRecord[getPrimarykey()]);
    pickRolesValue.value = roles;
    pickRolesDialog.value = true;
};
const changeRoles = async () => {
    await authService.changeRoles(router, record.value[getPrimarykey()], pickRolesValue.value[1]);
    record.value = {};
    pickRolesDialog.value = false;
};
const crudPerms = ref({});
const crudGet = async () => {
    let { perms, cols } = await crudService.perms(router, group.value, item.value);
    crudPerms.value = perms;

    if (crudPerms.value.get) {
        records.value = await crudService.get(router, group.value, item.value);
    } else {
        records.value = null;
    }
    // must update columns together with records
    columns.value = cols;
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

const showPreloadField = (column, data) => {
    if (column.Preload) {
        return data[column.Name][column.PreloadField];
    }
    return data[column.Name];
};

const getPrimarykey = () => {
    if (columns.value) {
        for (let column of columns.value) {
            if (column.Primary) {
                return column.Name;
            }
        }
    }
};

const getUniquekey = () => {
    let keys = [];
    if (columns.value) {
        for (let column of columns.value) {
            if (column.Unique) {
                keys.push(column);
            }
        }
    }
    return keys;
};

const openNew = () => {
    record.value = {};
    errors.value = {};
    if (authSession.value) {
        record.value.Key = uuidv4().replaceAll('-', '');
    }
    recordDialog.value = true;
};

const hideDialog = () => {
    recordDialog.value = false;
    errors.value = {};
};

const saveRecord = async () => {
    errors.value = {};
    let rules = {};
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
    const v$ = useValidate(rules, record.value);
    if (!(await v$.value.$validate())) {
        for (let err of v$.value.$errors) {
            errors.value[err.$property] = err.$message;
        }
        return;
    }

    for (let c of getUniquekey()) {
        let data = {};
        data[c.Name] = record.value[c.Name];
        let exist = await crudService.exist(router, group.value, item.value, data);
        if (exist) {
            if (exist[getPrimarykey()] != record.value[getPrimarykey()]) {
                errors.value[c.Name] = 'Value is used';
                return;
            }
        }
    }

    let msg = null;
    const pk = getPrimarykey();
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

const editRecord = (editRecord) => {
    record.value = { ...editRecord };
    recordDialog.value = true;
};

const confirmDeleteRecord = (delRecord) => {
    record.value = delRecord;
    deleteRecordDialog.value = true;
};

const deleteRecord = async () => {
    await crudService.delete(router, group.value, item.value, record.value);
    records.value = records.value.filter((val) => val[getPrimarykey()] !== record.value[getPrimarykey()]);
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
    let ids = selectedRecords.value.map((val) => val[getPrimarykey()]);
    await crudService.batchDelete(router, group.value, item.value, ids);
    records.value = records.value.filter((val) => !selectedRecords.value.includes(val));
    deleteRecordsDialog.value = false;
    selectedRecords.value = null;
    toast.add({ severity: 'success', summary: 'Successful', detail: `${item.value}s Deleted`, life: 3000 });
};

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};

const isAutofocus = (c, idx) => {
    return idx == 1;
};

const isEditRecord = computed(() => {
    return !!record.value[getPrimarykey()];
});

const isSessionRDOnly = (c) => {
    if (!authSession.value) {
        return false;
    }
    return (isEditRecord.value && c.Name === 'UserID') || c.Name === 'Key';
};
const btnNewDisabled = computed(() => {
    return !crudPerms.value.post;
});
const btnChangeDisabled = computed(() => {
    return !crudPerms.value.put;
});
const btnPickPermsDisabled = computed(() => {
    return !crudPerms.value.put;
});
const btnPickRolesDisabled = computed(() => {
    return !crudPerms.value.put;
});
const btnDeleteDisabled = computed(() => {
    return !crudPerms.value.delete;
});
const btnBatchDeleteDisabled = computed(() => {
    return !crudPerms.value.delete || !selectedRecords.value || !selectedRecords.value.length;
});
const btnImportDisabled = computed(() => {
    return !crudPerms.value.post;
});
const btnExportDisabled = computed(() => {
    return !crudPerms.value.get;
});
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toast />
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <Button label="New" icon="pi pi-plus" class="p-button-success mr-2" @click="openNew" :disabled="btnNewDisabled" />
                            <Button label="Delete" icon="pi pi-trash" class="p-button-danger" @click="confirmDeleteSelected" :disabled="btnBatchDeleteDisabled" />
                        </div>
                    </template>

                    <template v-slot:end>
                        <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" chooseLabel="Import" class="mr-2 inline-block" :disabled="btnImportDisabled" />
                        <Button label="Export" icon="pi pi-upload" class="p-button-help" @click="exportCSV($event)" :disabled="btnExportDisabled" />
                    </template>
                </Toolbar>

                <DataTable
                    ref="dt"
                    :value="records"
                    v-model:selection="selectedRecords"
                    :dataKey="getPrimarykey()"
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
                                <span class="p-column-title">{{ c.Name }}</span>
                                <template v-if="crudHelper.isBool(c)">
                                    <Badge v-if="showPreloadField(c, slotProps.data) == true" value="✓" severity="success"> </Badge>
                                    <Badge v-else value="x" severity="danger"></Badge>
                                </template>
                                <template v-else-if="crudHelper.isTime(c)">
                                    <Calendar :modelValue="showPreloadField(c, slotProps.data)" showTime readonly />
                                </template>
                                <template v-else>
                                    {{ showPreloadField(c, slotProps.data) }}
                                </template>
                            </template>
                        </Column>
                    </template>

                    <Column headerStyle="min-width:15rem;">
                        <template #body="slotProps">
                            <Button v-if="authRole" icon="pi pi-key" class="p-button-rounded p-button-primary mr-2" @click="pickPerms(slotProps.data)" :disabled="btnPickPermsDisabled" />
                            <Button v-if="authUser" icon="pi pi-users" class="p-button-rounded p-button-primary mr-2" @click="pickRoles(slotProps.data)" :disabled="btnPickRolesDisabled" />
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editRecord(slotProps.data)" :disabled="btnChangeDisabled" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-warning" @click="confirmDeleteRecord(slotProps.data)" :disabled="btnDeleteDisabled" />
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="recordDialog" :style="{ width: '450px' }" :header="`${item} Details`" :modal="true" class="p-fluid">
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
                                v-model="record[c.Name]"
                                @focus="clearErr(c)"
                                :disabled="isSessionRDOnly(c)"
                                :autofocus="isAutofocus(c, idx)"
                                :class="{ 'p-invalid': hasErr(c) }"
                            >
                            </InputNumber>
                            <Calendar v-else-if="crudHelper.isTime(c)" :id="c.Name" v-model="record[c.Name]" @show="clearErr(c)" showTime showIcon :class="{ 'p-invalid': hasErr(c) }" />
                            <div v-else-if="crudHelper.isBool(c)">
                                <InputSwitch :id="c.Name" v-model="record[c.Name]" />
                            </div>
                            <Password v-else-if="crudHelper.isPassword(c)" :id="c.Name" v-model="record[c.Name]" @focus="clearErr(c)" :class="{ 'p-invalid': hasErr(c) }" :feedback="false" />
                            <InputText v-else :id="c.Name" v-model.trim="record[c.Name]" @focus="clearErr(c)" :disabled="isSessionRDOnly(c)" :autofocus="isAutofocus(c, idx)" :class="{ 'p-invalid': hasErr(c) }" />
                            <small>{{ showErr(c) }}</small>
                        </template>
                    </div>
                    <template #footer>
                        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveRecord" />
                    </template>
                </Dialog>

                <PickPermsDialog :authRole="authRole" v-model:visible="pickPermsDialog" v-model="pickPermsValue" :yes="changePerms" />

                <PickRolesDialog :authUser="authUser" v-model:visible="pickRolesDialog" v-model="pickRolesValue" :yes="changeRoles" />

                <ConfirmDelDialog :item="item" :record="record" :pk="getPrimarykey()" v-model:visible="deleteRecordDialog" v-model="deleteRecordsDialog" @delete-record="deleteRecord" @delete-records="deleteSelectedRecords" />
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
