import Vue from 'vue'
import VueI18n from 'vue-i18n'
import elZh from 'element-ui/lib/locale/lang/zh-CN'
import zhCN from './zh-CN'

Vue.use(VueI18n)

const messages = {
    'zh-CN': {
        ...zhCN,
        ...elZh,
    }
}
/*国际化默认设置为中文 自行调整*/
function getLanguage() {
    return 'zh-CN';
}

const i18n = new VueI18n({
    locale: getLanguage(),
    messages,
})

export default i18n
