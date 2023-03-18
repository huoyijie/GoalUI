<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount, computed } from 'vue';
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router';
import CrudService from '@/service/CrudService';
import { useToast } from 'primevue/usetoast';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const group = ref(route.params.group);
const item = ref(route.params.item);
const authRole = computed(() => group.value == 'auth' && item.value == 'role');
const records = ref(null);
const columns = ref(null);
const preloads = ref(null);
const recordDialog = ref(false);
const deleteRecordDialog = ref(false);
const deleteRecordsDialog = ref(false);
const record = ref({});
const selectedRecords = ref(null);
const dt = ref(null);
const filters = ref({});
const submitted = ref(false);
const crudService = new CrudService();
const changePermsDialog = ref(false);
const permsPicklistValue = ref([[], []]);
const pickPerms = async (pickRecord) => {
    changePermsDialog.value = true;
}
const changePerms = async (pickRecord) => {
    changePermsDialog.value = false;
};

onBeforeMount(() => {
    initFilters();
});
onMounted(() => {
    crudService.get(router, group.value, item.value).then((data) => {
        data ||= {};
        records.value = data.records;
        columns.value = data.columns;
        preloads.value = data.preloads;
    });
});
onBeforeRouteUpdate((to) => {
    group.value = to.params.group;
    item.value = to.params.item;
    crudService.get(router, group.value, item.value).then((data) => {
        data ||= {};
        records.value = data.records;
        columns.value = data.columns;
        preloads.value = data.preloads;
    });
});

const formatDate = (date) => {
    return new Date(date);
};

const showPreloadField = (column, data) => {
    if (preloads.value) {
        for (let preload of preloads.value) {
            if (column.Name === preload[0]) {
                return data[column.Name][preload[1]];
            }
        }
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

const openNew = () => {
    record.value = {};
    submitted.value = false;
    recordDialog.value = true;
};

const hideDialog = () => {
    recordDialog.value = false;
    submitted.value = false;
};

const saveRecord = async () => {
    submitted.value = true;
    let pk = null;
    for (let column of columns.value) {
        if (column.Primary) {
            pk = column.Name;
            continue;
        }
        if (!record.value[column.Name] || !record.value[column.Name].trim()) {
            return;
        }
    }

    let msg = null;
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
    toast.add({ severity: 'success', summary: 'Successful', detail: `${item.value} ${msg}`, life: 3000 });
    recordDialog.value = false;
    record.value = {};
};

const editRecord = (editRecord) => {
    record.value = editRecord;
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
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toast />
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <Button label="New" icon="pi pi-plus" class="p-button-success mr-2" @click="openNew" />
                            <Button label="Delete" icon="pi pi-trash" class="p-button-danger" @click="confirmDeleteSelected"
                                :disabled="!selectedRecords || !selectedRecords.length" />
                        </div>
                    </template>

                    <template v-slot:end>
                        <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" chooseLabel="Import"
                            class="mr-2 inline-block" />
                        <Button label="Export" icon="pi pi-upload" class="p-button-help" @click="exportCSV($event)" />
                    </template>
                </Toolbar>

                <DataTable ref="dt" :value="records" v-model:selection="selectedRecords" :dataKey="getPrimarykey()"
                    :paginator="true" :rows="10" :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    :currentPageReportTemplate="`Showing {first} to {last} of {totalRecords} ${item}`"
                    responsiveLayout="scroll">
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
                    <Column v-for="c in columns" :key="c.Name" :field="c.Name" :header="c.Name" :sortable="true"
                        headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">{{ c.Name }}</span>
                            <template v-if="c.Type === 'bool'">
                                <Badge v-if="showPreloadField(c, slotProps.data) == true" value="✓" severity="success">
                                </Badge>
                                <Badge v-else value="x" severity="danger"></Badge>
                            </template>
                            <template v-else-if="c.Type === 'Time'">
                                <Calendar :modelValue="formatDate(showPreloadField(c, slotProps.data))" showTime readonly />
                            </template>
                            <template v-else>
                                {{ showPreloadField(c, slotProps.data) }}
                            </template>
                        </template>
                    </Column>

                    <Column headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <Button v-if="authRole" icon="pi pi-key" class="p-button-rounded p-button-primary mr-2"
                                @click="pickPerms(slotProps.data)" />
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2"
                                @click="editRecord(slotProps.data)" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-warning mt-2"
                                @click="confirmDeleteRecord(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="recordDialog" :style="{ width: '450px' }" :header="`${item} Details`" :modal="true"
                    class="p-fluid">
                    <div v-for="c in columns" :key="c.Name" class="field">
                        <template v-if="!c.Primary">
                            <label :for="c.Name">{{ c.Name }}</label>
                            <InputText :id="c.Name" v-model.trim="record[c.Name]" required="true" autofocus
                                :class="{ 'p-invalid': submitted && !record[c.Name] }" />
                            <small class="p-invalid" v-if="submitted && !record[c.Name]">{{ c.Name }} is required.</small>
                        </template>
                    </div>
                    <template #footer>
                        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveRecord" />
                    </template>
                </Dialog>

                <Dialog v-if="authRole" v-model:visible="changePermsDialog" class="col-12 lg:col-8"
                    :header="`${item} Details`" :modal="true">
                    <PickList v-model="permsPicklistValue" listStyle="height:250px" dataKey="code">
                        <template #sourceheader> Available </template>
                        <template #targetheader> Selected </template>
                        <template #item="slotProps">
                            <div>{{ slotProps.item.name }}</div>
                        </template>
                    </PickList>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" class="p-button-text" @click="changePermsDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="changePerms(slotProps.data)" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteRecordDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="record">Are you sure you want to delete {{ item }} <Badge
                                :value="record[getPrimarykey()]"></Badge> ?</span>
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteRecordDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteRecord" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteRecordsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="record">Are you sure you want to delete the selected {{ item }}s?</span>
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteRecordsDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteSelectedRecords" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
