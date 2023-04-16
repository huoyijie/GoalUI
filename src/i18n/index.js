import { createI18n } from 'vue-i18n';
import messagesEn from './locale/messages/en';
import messagesZh_CN from './locale/messages/zh_CN';
import primeEn from './locale/prime/en';
import primeZh_CN from './locale/prime/zh_CN';

const messages = {
    en: primeEn,
    zh_CN: primeZh_CN
};

const lang = localStorage.getItem('lang') || import.meta.env.VITE_DEFAULT_LANG || 'en';

const i18n = createI18n({
    legacy: false,
    locale: lang,
    fallbackLocale: 'en',
    messages: {
        en: messagesEn,
        zh_CN: messagesZh_CN
    }
});
i18n.global.langs = [
    { name: 'EN', value: 'en' },
    { name: '简体中文', value: 'zh_CN' }
];
i18n.global.primevue = {
    locale: lang === 'en' ? primeEn : primeZh_CN
};

i18n.global.setLang = (primevue, lang) => {
    primevue.config.locale = messages[lang];
    i18n.global.locale.value = lang;
    localStorage.setItem('lang', lang);
};

export default i18n;
