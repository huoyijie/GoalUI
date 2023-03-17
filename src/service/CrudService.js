const contextPath = 'http://127.0.0.1:8100/';

const crudFetch = (group, item, method, body) => {
    return fetch(contextPath + `admin/${group}/${item}`, {
        method,
        mode: 'cors',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body
    })
        .then((res) => res.json())
        .then((d) => d.data);
};

export default class CrudService {
    get(group, item) {
        return crudFetch(group, item, 'GET');
    }
    add(group, item, record) {
        return crudFetch(group, item, 'POST', JSON.stringify(record));
    }
    change(group, item, record) {
        return crudFetch(group, item, 'PUT', JSON.stringify(record));
    }
}
