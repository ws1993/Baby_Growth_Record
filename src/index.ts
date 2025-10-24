import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import pinia from './stores';

// Vant UI 样式
import 'vant/lib/index.css';

// 全局样式
import './index.css';

const app = createApp(App);

app.use(router);
app.use(pinia);

app.mount('#root');
