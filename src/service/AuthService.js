const contextPath = 'http://127.0.0.1:8100/';

export default class AuthService {
    signin(data) {
        return fetch(contextPath + 'admin/signin', {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then((res) => res.json())
            .then(() => {
                window.location.hash = '#/';
            });
    }
}
