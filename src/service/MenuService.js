import doFetch from './FetchService';

export default class MenuService {
    async getMenus(router) {
        return await doFetch(router, 'menus');
    }
}
