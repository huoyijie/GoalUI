import config from './app.config.json';
import menu from './app.menu.json';
import en from './locale.en.json';
import zh_CN from './locale.zh_CN.json';

export const appConfig = config;

export const menuConfig = {
    auth: {
        role: {
            icon: 'key'
        },
        session: {
            icon: 'ticket'
        },
        user: {
            icon: 'users'
        }
    },
    admin: {
        operationlog: {
            icon: 'save'
        }
    },
    ...menu
};

export const locale = {
    en,
    zh_CN
};
