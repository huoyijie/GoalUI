const contextPath = 'http://127.0.0.1:8100/';

const menuConfig = new Map();
menuConfig.set('Auth.Role', {
    icon: 'pi pi-fw pi-key',
    to: {
        name: 'crud',
        params: {
            group: 'auth',
            item: 'role'
        }
    }
});
menuConfig.set('Auth.Session', {
    icon: 'pi pi-fw pi-ticket',
    to: {
        name: 'crud',
        params: {
            group: 'auth',
            item: 'session'
        }
    }
});
menuConfig.set('Auth.User', {
    icon: 'pi pi-fw pi-users',
    to: {
        name: 'crud',
        params: {
            group: 'auth',
            item: 'user'
        }
    }
});

export default class MenuService {
    async getMenus(router) {
        let res = await fetch(contextPath + 'admin/menus', {
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (res.status === 401) {
            router.push({ name: 'signin' });
            return;
        }
        let jsonObj = await res.json();
        let menus = jsonObj.menus;
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
