import { createI18n } from 'vue-i18n';
import messagesEn from './locale/messages/en';
import messagesZh_CN from './locale/messages/zh_CN';

const lang = localStorage.getItem('lang') || 'zh_CN';

export default createI18n({
    legacy: false,
    locale: lang,
    fallbackLocale: 'en',
    messages: {
        en: messagesEn,
        zh_CN: messagesZh_CN
    }
});
