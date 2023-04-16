import doFetch from './FetchService';

export default class LocaleService {
    async getLocale() {
        return await doFetch(null, 'locale');
    }
}
