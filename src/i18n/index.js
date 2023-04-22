import { createI18n } from 'vue-i18n';
import primeEn from './locales/primevue/en.json';
import primeZhCN from './locales/primevue/zh-CN.json';
import en from './locales/messages/en.json';
import zhCN from './locales/messages/zh-CN.json';
import LocaleService from '@/service/LocaleService';

const localeService = new LocaleService();
const locale = await localeService.getLocale();
en.group = { ...en.group, ...locale.en };
zhCN.group = { ...zhCN.group, ...locale['zh-CN'] };

const lang = localStorage.getItem('lang') || import.meta.env.VITE_DEFAULT_LANG || 'en';

const i18n = createI18n({
    legacy: false,
    locale: lang,
    fallbackLocale: 'en',
    datetimeFormats: {
        en: {
            date: {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            },
            time: {
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric'
            },
            datetime: {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric'
            }
        },
        'zh-CN': {
            date: {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric'
            },
            time: {
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric'
            },
            datetime: {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric'
            }
        }
    },
    messages: {
        en,
        'zh-CN': zhCN
    }
});
i18n.global.langs = [
    { name: 'EN', value: 'en' },
    { name: '简体中文', value: 'zh-CN' }
];
i18n.global.primevue = {
    messages: {
        en: primeEn,
        'zh-CN': primeZhCN
    }
};
const { primevue } = i18n.global;
primevue.locale = primevue.messages[lang];

i18n.global.setLang = (primevue, lang) => {
    const { messages } = i18n.global.primevue;
    primevue.config.locale = messages[lang];
    i18n.global.locale.value = lang;
    localStorage.setItem('lang', lang);
};

export default i18n;
