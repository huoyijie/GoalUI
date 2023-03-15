const contextPath = 'http://127.0.0.1:8100/';

export default class AuthService {
    signin(router, data) {
        fetch(contextPath + 'admin/signin', {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then((res) => res.json())
            .then((data) => {
                localStorage.setItem('username', data.Username);
                router.push('/');
            });
    }
    signout(router) {
        fetch(contextPath + 'admin/signout', {
            mode: 'cors',
            credentials: 'include'
        })
            .then((res) => res.json())
            .then(() => {
                localStorage.removeItem('username');
                router.push('/auth/signin');
            });
    }
}
