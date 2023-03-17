<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router';
// import ProductService from '@/service/ProductService';
import CrudService from '@/service/CrudService';
import { useToast } from 'primevue/usetoast';
import { useLayout } from '@/layout/composables/layout';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const { contextPath } = useLayout();

const records = ref(null);
const columns = ref(null);
const preloads = ref(null);
// const products = ref(null);
const recordDialog = ref(false);
const deleteProductDialog = ref(false);
const deleteProductsDialog = ref(false);
// const record = ref({});
const record = ref({});
const selectedProducts = ref(null);
const dt = ref(null);
const filters = ref({});
const submitted = ref(false);
const statuses = ref([
    { label: 'INSTOCK', value: 'instock' },
    { label: 'LOWSTOCK', value: 'lowstock' },
    { label: 'OUTOFSTOCK', value: 'outofstock' }
]);

// const productService = new ProductService();
let { group, item } = route.params;
const crudService = new CrudService();

onBeforeMount(() => {
    initFilters();
});
onMounted(() => {
    crudService.get(router, group, item).then((data) => {
        records.value = data.records;
        columns.value = data.columns;
        preloads.value = data.preloads;
    });
    // productService.getProducts().then((data) => (products.value = data));
});
onBeforeRouteUpdate((to) => {
    group = to.params.group;
    item = to.params.item;
    crudService.get(router, group, item).then((data) => {
        records.value = data.records;
        columns.value = data.columns;
        preloads.value = data.preloads;
    });
});

const formatCurrency = (value) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

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
    // product.value = {};
    record.value = {};
    submitted.value = false;
    recordDialog.value = true;
};

const hideDialog = () => {
    recordDialog.value = false;
    submitted.value = false;
};

const saveProduct = () => {
    submitted.value = true;
    if (record.value.name && record.value.name.trim() && record.value.price) {
        if (record.value.id) {
            record.value.inventoryStatus = record.value.inventoryStatus.value ? record.value.inventoryStatus.value : record.value.inventoryStatus;
            products.value[findIndexById(record.value.id)] = record.value;
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Updated', life: 3000 });
        } else {
            record.value.id = createId();
            record.value.code = createId();
            record.value.image = 'product-placeholder.svg';
            record.value.inventoryStatus = record.value.inventoryStatus ? record.value.inventoryStatus.value : 'INSTOCK';
            products.value.push(record.value);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Created', life: 3000 });
        }
        recordDialog.value = false;
        record.value = {};
    }
};

const editProduct = (editProduct) => {
    record.value = { ...editProduct };
    console.log(record);
    recordDialog.value = true;
};

const confirmDeleteProduct = (editProduct) => {
    record.value = editProduct;
    deleteProductDialog.value = true;
};

const deleteProduct = () => {
    products.value = products.value.filter((val) => val.id !== record.value.id);
    deleteProductDialog.value = false;
    record.value = {};
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 });
};

const findIndexById = (id) => {
    let index = -1;
    for (let i = 0; i < records.value.length; i++) {
        if (records.value[i].id === id) {
            index = i;
            break;
        }
    }
    return index;
};

const createId = () => {
    let id = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 5; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
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
                    <!-- <Column field="code" header="Code" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                                                <template #body="slotProps">
                                                    <span class="p-column-title">Code</span>
                                                    {{ slotProps.data.code }}
                                                </template>
                                            </Column> -->
                    <Column v-for="c in columns" :key="c.Name" :field="c.Name" :header="c.Name" :sortable="true"
                        headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">{{ c.Name }}</span>
                            <template v-if="c.Type === 'bool'">
                                <Badge v-if="showPreloadField(c, slotProps.data) == true" value="✓" severity="success"></Badge>
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
                    <!-- <Column header="Image" headerStyle="width:14%; min-width:10rem;">
                                                <template #body="slotProps">
                                                    <span class="p-column-title">Image</span>
                                                    <img :src="contextPath + 'demo/images/product/' + slotProps.data.image"
                                                        :alt="slotProps.data.image" class="shadow-2" width="100" />
                                                </template>
                                            </Column>
                                            <Column field="price" header="Price" :sortable="true" headerStyle="width:14%; min-width:8rem;">
                                                <template #body="slotProps">
                                                    <span class="p-column-title">Price</span>
                                                    {{ formatCurrency(slotProps.data.price) }}
                                                </template>
                                            </Column>
                                            <Column field="category" header="Category" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                                                <template #body="slotProps">
                                                    <span class="p-column-title">Category</span>
                                                    {{ slotProps.data.category }}
                                                </template>
                                            </Column>
                                            <Column field="rating" header="Reviews" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                                                <template #body="slotProps">
                                                    <span class="p-column-title">Rating</span>
                                                    <Rating :modelValue="slotProps.data.rating" :readonly="true" :cancel="false" />
                                                </template>
                                            </Column>
                                            <Column field="inventoryStatus" header="Status" :sortable="true"
                                                headerStyle="width:14%; min-width:10rem;">
                                                <template #body="slotProps">
                                                    <span class="p-column-title">Status</span>
                                                    <span
                                                        :class="'product-badge status-' + (slotProps.data.inventoryStatus ? slotProps.data.inventoryStatus.toLowerCase() : '')">{{
                                                            slotProps.data.inventoryStatus }}</span>
                                                </template>
                                            </Column> -->
                    <Column headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2"
                                @click="editProduct(slotProps.data)" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-warning mt-2"
                                @click="confirmDeleteProduct(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="recordDialog" :style="{ width: '450px' }" :header="`${item} Details`" :modal="true"
                    class="p-fluid">
                    <div class="field">
                        <label for="name">Name</label>
                        <InputText id="name" v-model.trim="record.name" required="true" autofocus
                            :class="{ 'p-invalid': submitted && !record.name }" />
                        <small class="p-invalid" v-if="submitted && !record.name">Name is required.</small>
                    </div>
                    <div class="field">
                        <label for="description">Description</label>
                        <Textarea id="description" v-model="record.description" required="true" rows="3" cols="20" />
                    </div>

                    <div class="field">
                        <label for="inventoryStatus" class="mb-3">Inventory Status</label>
                        <Dropdown id="inventoryStatus" v-model="record.inventoryStatus" :options="statuses"
                            optionLabel="label" placeholder="Select a Status">
                            <template #value="slotProps">
                                <div v-if="slotProps.value && slotProps.value.value">
                                    <span :class="'product-badge status-' + slotProps.value.value">{{ slotProps.value.label
                                    }}</span>
                                </div>
                                <div v-else-if="slotProps.value && !slotProps.value.value">
                                    <span :class="'product-badge status-' + slotProps.value.toLowerCase()">{{
                                        slotProps.value }}</span>
                                </div>
                                <span v-else>
                                    {{ slotProps.placeholder }}
                                </span>
                            </template>
                        </Dropdown>
                    </div>

                    <div class="field">
                        <label class="mb-3">Category</label>
                        <div class="formgrid grid">
                            <div class="field-radiobutton col-6">
                                <RadioButton id="category1" name="category" value="Accessories" v-model="record.category" />
                                <label for="category1">Accessories</label>
                            </div>
                            <div class="field-radiobutton col-6">
                                <RadioButton id="category2" name="category" value="Clothing" v-model="record.category" />
                                <label for="category2">Clothing</label>
                            </div>
                            <div class="field-radiobutton col-6">
                                <RadioButton id="category3" name="category" value="Electronics" v-model="record.category" />
                                <label for="category3">Electronics</label>
                            </div>
                            <div class="field-radiobutton col-6">
                                <RadioButton id="category4" name="category" value="Fitness" v-model="record.category" />
                                <label for="category4">Fitness</label>
                            </div>
                        </div>
                    </div>

                    <div class="formgrid grid">
                        <div class="field col">
                            <label for="price">Price</label>
                            <InputNumber id="price" v-model="record.price" mode="currency" currency="USD" locale="en-US"
                                :class="{ 'p-invalid': submitted && !record.price }" :required="true" />
                            <small class="p-invalid" v-if="submitted && !record.price">Price is required.</small>
                        </div>
                        <div class="field col">
                            <label for="quantity">Quantity</label>
                            <InputNumber id="quantity" v-model="record.quantity" integeronly />
                        </div>
                    </div>
                    <template #footer>
                        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveProduct" />
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
