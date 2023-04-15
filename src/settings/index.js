import en from './locale.en.json';
import zh_CN from './locale.zh_CN.json';

export function getURL(path) {
    return import.meta.env.VITE_SERVER_CONTEXT_PATH + path;
}

export function getMediaURL(path) {
    return import.meta.env.VITE_SERVER_MEDIA_PATH + path;
}

export const locale = {
    en,
    zh_CN
};
