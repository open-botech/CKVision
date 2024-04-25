import { createI18n } from 'vue-i18n'
import zh from './zh'
import en from './en'

const i18n = createI18n({
  // 如果本地有语言标识就采用本地，没有就根据浏览器语言默认标识显示语言
  locale: localStorage.getItem('locale') || 'en',
  messages: {
    zh,
    en,
  },
})
export default i18n

// 语言切换功能
// import i18n from "@/i18n/index";

// function seleLanguage(index){
//   const idx = ['zh','en'][index] || navigator.language.slice(0, 2);
//   localStorage.setItem("locale",idx);
//   i18n.global.locale = idx;
// }
