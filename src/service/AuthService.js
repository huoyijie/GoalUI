import doFetch, { doRawFetch } from './FetchService';

export default class AuthService {
    signin(router, data) {
        return doRawFetch(router, 'signin', 'POST', JSON.stringify(data));
    }
    signout(router) {
        return doFetch(router, 'signout').then(() => {
            localStorage.removeItem('username');
            router.push({ name: 'signin' });
        });
    }
    perms(router, roleID) {
        return doFetch(router, `perms/${roleID}`).then((perms) => perms);
    }
    changePerms(router, roleID, perms) {
        return doFetch(router, `perms/${roleID}`, 'PUT', JSON.stringify(perms));
    }
    roles(router, userID) {
        return doFetch(router, `roles/${userID}`).then((roles) => roles);
    }
    changeRoles(router, userID, roles) {
        return doFetch(router, `roles/${userID}`, 'PUT', JSON.stringify(roles));
    }
    userinfo(router) {
        return doFetch(router, 'userinfo');
    }
    changePassword(router, data) {
        return doRawFetch(router, 'changepw', 'POST', JSON.stringify(data));
    }
}
