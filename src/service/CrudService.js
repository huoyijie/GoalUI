import { getURL } from '@/settings';
import doFetch from './FetchService';

const crudFetch = (router, group, item, method, body, path) => {
    return doFetch(router, getCrudPath(group, item, path), method, body);
};

export const getCrudPath = (group, item, path) => {
    let url = `crud/${group}/${item}`;
    if (path) {
        url += `/${path}`;
    }
    return url;
};

export const getCrudURL = (group, item, path) => {
    return getURL(getCrudPath(group, item, path));
};

export default class CrudService {
    get(router, group, item) {
        return crudFetch(router, group, item);
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
    columns(router, group, item) {
        return crudFetch(router, group, item, 'GET', null, 'columns');
    }
}
