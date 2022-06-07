import { createApp } from "vue";
import App from "./App.vue";
import { abort } from "./code/abort";
import { basic } from "./code/basic";
import { case_1 } from "./code/case_1";
import { debug_mode } from "./code/debug_mode";

createApp(App).mount("#app");

abort();
basic();
debug_mode();
case_1();
