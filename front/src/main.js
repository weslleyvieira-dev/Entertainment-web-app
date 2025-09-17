import App from "@/App.vue";
import { createApp } from "vue";
import router from "@/router/index";
import "./main.css";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import { createPinia } from "pinia";
import { bootstrapService } from "@/services/bootstrapService";

const toastOptions = {
  pauseOnHover: false,
  draggable: false,
  maxToasts: 10,
};

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);
app.use(Toast, toastOptions);
app.mount("#app");

bootstrapService();
