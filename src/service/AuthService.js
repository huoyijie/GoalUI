import doFetch from './FetchService';

export default class AuthService {
    signin(router, data) {
        return doFetch(router, 'signin', 'POST', JSON.stringify(data)).then((username) => {
            localStorage.setItem('username', username);
            router.push({ name: 'dashboard' });
        });
    }
    signout(router) {
        return doFetch(router, 'signout').then(() => {
            localStorage.removeItem('username');
            router.push({ name: 'signin' });
        });
    }
    perms(router, roleId) {
        return doFetch(router, `perms/${roleId}`).then((perms) => perms);
    }
}
