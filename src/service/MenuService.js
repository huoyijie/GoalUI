const contextPath = 'http://127.0.0.1:8100/';

const iconMap = new Map();
iconMap.set('Auth.Role', 'pi pi-fw pi-key');
iconMap.set('Auth.Session', 'pi pi-fw pi-ticket');
iconMap.set('Auth.User', 'pi pi-fw pi-users');

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
                item.icon = iconMap.get(`${menu.label}.${item.label}`);
                // item.to = '/'
            }
        }
        return menus;
    }
}
