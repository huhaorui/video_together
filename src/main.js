import './assets/main.css'

import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import Antd from 'ant-design-vue';
import axios from 'axios'

const app = createApp(App)
app.use(router);
app.config.globalProperties.$axios = axios
app.use(Antd).mount('#app');
