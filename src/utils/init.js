// src/utils/init.js
import i18next from 'i18next';
import resources from '../locales/index.js';

export const initI18n = () => {
  const i18n = i18next.createInstance();

  return i18n.init({
    lng: 'ru',
    debug: true,
    resources,
  }).then(() => i18n);
};

export default initI18n;
