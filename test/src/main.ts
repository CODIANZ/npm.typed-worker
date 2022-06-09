import { createApp } from "vue";
import App from "./App.vue";
import { abort } from "./code/abort";
import { basic } from "./code/basic";
import { atomics } from "./code/atomics";
import { mutex } from "./code/mutex";
import { debug_mode } from "./code/debug_mode";

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
  });
