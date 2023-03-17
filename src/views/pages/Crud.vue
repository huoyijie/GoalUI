<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
import { useRoute, onBeforeRouteUpdate } from 'vue-router';
import CrudService from '@/service/CrudService';
import { useToast } from 'primevue/usetoast';

const route = useRoute();
const toast = useToast();

const records = ref(null);
const columns = ref(null);
const preloads = ref(null);
const recordDialog = ref(false);
const deleteProductDialog = ref(false);
const deleteProductsDialog = ref(false);
const record = ref({});
const selectedProducts = ref(null);
const dt = ref(null);
const filters = ref({});
const submitted = ref(false);

let { group, item } = route.params;
const crudService = new CrudService();

onBeforeMount(() => {
    initFilters();
});
onMounted(() => {
    crudService.get(group, item).then((data) => {
        records.value = data.records;
        columns.value = data.columns;
        preloads.value = data.preloads;
    });
});
onBeforeRouteUpdate((to) => {
    group = to.params.group;
    item = to.params.item;
    crudService.get(group, item).then((data) => {
        records.value = data.records;
        columns.value = data.columns;
        preloads.value = data.preloads;
    });
});

// const formatCurrency = (value) => {
//     return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
// };

const formatDate = (date) => {
    return new Date(date);
};

const showPreloadField = (column, data) => {
    if (preloads.value != null) {
        for (let preload of preloads.value) {
            if (column.Name === preload[0]) {
                return data[column.Name][preload[1]];
            }
        }
    }
    return data[column.Name];
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
        await crudService.change(group, item, record.value, record.value[pk]);
        for (let i = 0; i < records.value.length; i++) {
            if (records.value[i][pk] == record.value[pk]) {
                records.value[i] = record.value;
            }
        }
        msg = 'Updated';
    } else {
        let res = await crudService.add(group, item, record.value);
        records.value ||= [];
        records.value.push(res);
        msg = 'Created';
    }
    toast.add({ severity: 'success', summary: 'Successful', detail: `${item} ${msg}`, life: 3000 });
    recordDialog.value = false;
    record.value = {};
    // if (record.value.name && record.value.name.trim() && record.value.price) {
    //     if (record.value.id) {
    //         record.value.inventoryStatus = record.value.inventoryStatus.value ? record.value.inventoryStatus.value : record.value.inventoryStatus;
    //         products.value[findIndexById(record.value.id)] = record.value;
    //         toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Updated', life: 3000 });
    //     } else {
    //         record.value.id = createId();
    //         record.value.code = createId();
    //         record.value.image = 'product-placeholder.svg';
    //         record.value.inventoryStatus = record.value.inventoryStatus ? record.value.inventoryStatus.value : 'INSTOCK';
    //         products.value.push(record.value);
    //         toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Created', life: 3000 });
    //     }
    //     recordDialog.value = false;
    //     record.value = {};
    // }
};

const editRecord = (editRecord) => {
    record.value = { ...editRecord };
    console.log(record);
    recordDialog.value = true;
};

const confirmDeleteProduct = (editRecord) => {
    record.value = editRecord;
    deleteProductDialog.value = true;
};

const deleteProduct = () => {
    products.value = products.value.filter((val) => val.id !== record.value.id);
    deleteProductDialog.value = false;
    record.value = {};
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 });
};

const exportCSV = () => {
    dt.value.exportCSV();
};

const confirmDeleteSelected = () => {
    deleteProductsDialog.value = true;
};
const deleteSelectedProducts = () => {
    products.value = products.value.filter((val) => !selectedProducts.value.includes(val));
    deleteProductsDialog.value = false;
    selectedProducts.value = null;
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Products Deleted', life: 3000 });
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
                                :disabled="!selectedProducts || !selectedProducts.length" />
                        </div>
                    </template>

                    <template v-slot:end>
                        <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" chooseLabel="Import"
                            class="mr-2 inline-block" />
                        <Button label="Export" icon="pi pi-upload" class="p-button-help" @click="exportCSV($event)" />
                    </template>
                </Toolbar>

                <DataTable ref="dt" :value="records" v-model:selection="selectedProducts" dataKey="ID" :paginator="true"
                    :rows="10" :filters="filters"
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
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2"
                                @click="editRecord(slotProps.data)" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-warning mt-2"
                                @click="confirmDeleteProduct(slotProps.data)" />
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

                <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="record">Are you sure you want to delete <b>{{ record.name }}</b>?</span>
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteProductDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteProduct" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteProductsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="record">Are you sure you want to delete the selected products?</span>
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteProductsDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteSelectedProducts" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import '@/assets/demo/styles/badges.scss';
</style>
