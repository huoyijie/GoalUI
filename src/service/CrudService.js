import doFetch from './FetchService';

const crudFetch = (router, group, item, method, body, batch) => {
    let url = `${group}/${item}`;
    if (batch) {
        url += '/batch';
    }
    return doFetch(router, url, method, body);
};

export default class CrudService {
    get(router, group, item) {
        return crudFetch(router, group, item);
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
        return crudFetch(router, group, item, 'DELETE', JSON.stringify(ids), true);
    }
}
