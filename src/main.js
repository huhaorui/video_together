import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css';


import axios from 'axios'


Vue.config.productionTip = false
Vue.prototype.$http = axios
Vue.use(Antd)
let vue = new Vue({
    router,
    store,
    render: h => h(App),
    vuetify,
    axios
})
vue.$mount('#app')
document.vue = vue
export default axios
