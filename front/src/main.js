import App from "@/App.vue";
import { createApp } from "vue";
import router from "@/router/index";
import "./main.css";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

const toastOptions = {
  pauseOnHover: false,
  draggable: false,
  maxToasts: 10,
};

const app = createApp(App);
app.use(router);
app.use(Toast, toastOptions);
app.mount("#app");
