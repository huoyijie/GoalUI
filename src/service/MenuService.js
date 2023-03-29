import doFetch from './FetchService';
import { menuConfig } from '@/settings';

export default class MenuService {
    async getMenus(router) {
        let menus = await doFetch(router, 'menus');
        menus ||= [];
        for (let menu of menus) {
            for (let item of menu.items) {
                const config = (menuConfig[menu.label] || {})[item.label];
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
