const contextPath = 'http://127.0.0.1:8100/';

export default class CrudService {
    get(router, group, item) {
        return fetch(contextPath + `admin/get/${group}/${item}/`, {
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then((res) => res.json())
            .then((d) => d.data);
    }
}
