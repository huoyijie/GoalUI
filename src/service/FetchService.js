const contextPath = 'http://127.0.0.1:8100/admin/';

export function doRawFetch(router, url, method, body) {
    method ||= 'GET';
    return fetch(contextPath + url, {
        method,
        mode: 'cors',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body
    }).then((res) => {
        if (res.status === 401) {
            router.push({ name: 'signin' });
            return;
        }
        if (res.status === 403) {
            router.push({ name: 'denied' });
            return;
        }
        return res.json();
    });
}

export default function doFetch(router, url, method, body) {
    return doRawFetch(router, url, method, body).then((d) => d && d.data);
}
