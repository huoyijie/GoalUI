import doFetch from './FetchService';

export default class AuthService {
    signin(router, data) {
        doFetch(router, 'signin', 'POST', JSON.stringify(data)).then((username) => {
            localStorage.setItem('username', username);
            router.push({ name: 'dashboard' });
        });
    }
    signout(router) {
        doFetch(router, 'signout').then(() => {
            localStorage.removeItem('username');
            router.push({ name: 'signin' });
        });
    }
}
