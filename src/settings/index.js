import config from './app.config.json';
import menu from './app.menu.json';
import en from './locale.en.json';
import zh_CN from './locale.zh_CN.json';

export const appConfig = config;

export function getURL(path) {
    return appConfig.serverContextPath + path;
}

export function getMediaURL(path) {
    return appConfig.serverMediaPath + path;
}

export const menuConfig = {
    home: {
        dashboard: {
            icon: 'house'
        }
    },
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
