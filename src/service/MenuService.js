import doFetch from './FetchService';

const menuConfig = new Map([
    ['auth.role', { icon: 'key' }],
    ['auth.session', { icon: 'ticket' }],
    ['auth.user', { icon: 'users' }],
    ['admin.operationlog', { icon: 'save' }]
]);

export default class MenuService {
    async getMenus(router) {
        let menus = await doFetch(router, 'menus');
        menus ||= [];
        for (let menu of menus) {
            for (let item of menu.items) {
                let config = menuConfig.get(`${menu.label}.${item.label}`);
                if (config) {
                    item.icon = `pi pi-fw pi-${config.icon}`;
                }
                item.to = {
                    name: 'crud',
                    params: {
                        group: `${menu.label}`,
                        item: `${item.label}`
                    }
                };
            }
        }
        return menus;
    }
}
