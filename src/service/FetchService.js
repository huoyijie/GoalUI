import { getURL } from '@/settings';

export function doRawFetch(router, path, method, body) {
    method ||= 'GET';
    return fetch(getURL(path), {
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
        if (res.status === 500) {
            router.push({ name: 'error' });
            return;
        }
        return res.json();
    });
}

export default function doFetch(router, path, method, body) {
    return doRawFetch(router, path, method, body).then((d) => d && d.data);
}
