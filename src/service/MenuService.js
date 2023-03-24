import doFetch from './FetchService';

const menuConfig = new Map();
menuConfig.set('auth.role', {
    icon: 'pi pi-fw pi-key',
    to: {
        name: 'crud',
        params: {
            group: 'auth',
            item: 'role'
        }
    }
});
menuConfig.set('auth.session', {
    icon: 'pi pi-fw pi-ticket',
    to: {
        name: 'crud',
        params: {
            group: 'auth',
            item: 'session'
        }
    }
});
menuConfig.set('auth.user', {
    icon: 'pi pi-fw pi-users',
    to: {
        name: 'crud',
        params: {
            group: 'auth',
            item: 'user'
        }
    }
});
menuConfig.set('admin.operationlog', {
    icon: 'pi pi-fw pi-save',
    to: {
        name: 'crud',
        params: {
            group: 'admin',
            item: 'operationlog'
        }
    }
});

export default class MenuService {
    async getMenus(router) {
        let menus = await doFetch(router, 'menus');
        menus ||= [];
        for (let menu of menus) {
            for (let item of menu.items) {
                let config = menuConfig.get(`${menu.label}.${item.label}`);
                item.icon = config.icon;
                item.to = config.to;
            }
        }
        return menus;
    }
}
