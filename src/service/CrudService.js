import { getURL } from '@/settings';
import doFetch from './FetchService';

const filterOn = (filter) => {
    if (filter.value != null) {
        return true;
    }

    if (filter.constraints) {
        for (let constraint of filter.constraints) {
            if (constraint.value != null) {
                return true;
            }
        }
    }

    return false;
};

const filters = (lazyParams) => {
    return Object.keys(lazyParams.filters)
        .filter((k) => filterOn(lazyParams.filters[k]))
        .map((k) => [k, lazyParams.filters[k]]);
};

const crudFetch = (router, group, item, method, body, path, params) => {
    return doFetch(router, getCrudPath(group, item, path, params), method, body);
};

export const getCrudPath = (group, item, path, params) => {
    let url = `crud/${group}/${item}`;
    if (path) {
        url += `/${path}`;
    }
    if (params) {
        url += `?${params}`;
    }
    return url;
};

export const getCrudURL = (group, item, path) => {
    return getURL(getCrudPath(group, item, path));
};

export default class CrudService {
    get(router, group, item, lazyParams) {
        const params = lazyParams ? `offset=${lazyParams.first}&limit=${lazyParams.rows}&sortField=${lazyParams.sortField || ''}&sortOrder=${lazyParams.sortOrder || 1}&filters=${encodeURIComponent(JSON.stringify(filters(lazyParams)))}` : '';

        return crudFetch(router, group, item, 'GET', null, null, params);
    }
    getMine(router, group, item) {
        return crudFetch(router, group, item, 'GET', null, 'mine');
    }
    add(router, group, item, record) {
        return crudFetch(router, group, item, 'POST', JSON.stringify(record));
    }
    change(router, group, item, record) {
        return crudFetch(router, group, item, 'PUT', JSON.stringify(record));
    }
    delete(router, group, item, record) {
        return crudFetch(router, group, item, 'DELETE', JSON.stringify(record));
    }
    batchDelete(router, group, item, ids) {
        return crudFetch(router, group, item, 'DELETE', JSON.stringify(ids), 'batch');
    }
    exist(router, group, item, record) {
        return crudFetch(router, group, item, 'POST', JSON.stringify(record), 'exist');
    }
    datatable(router, group, item) {
        return crudFetch(router, group, item, 'GET', null, 'datatable');
    }
}
