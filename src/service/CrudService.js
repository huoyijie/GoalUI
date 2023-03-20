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
        return crudFetch(router, group, item).then((data) => {
            for (let c of data.columns) {
                if (c.Type === 'Time') {
                    for (let r of data.records) {
                        r[c.Name] = new Date(r[c.Name]);
                    }
                }
            }
            return data;
        });
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
