import { createApp } from "vue";
import App from "./App.vue";
import { abort } from "./code/abort";
import { basic } from "./code/basic";
import { atomics } from "./code/atomics";
import { mutex } from "./code/mutex";
import { debug_mode } from "./code/debug_mode";
import { export_functions } from "./code/export_functions";

createApp(App).mount("#app");

basic()
  .then(() => {
    return abort();
  })
  .then(() => {
    return debug_mode();
  })
  .then(() => {
    return atomics();
  })
  .then(() => {
    return mutex();
  })
  .then(() => {
    return export_functions();
  })
  .then(() => {
    console.log("finish!");
  });
