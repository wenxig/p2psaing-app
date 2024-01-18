import { createRouter, createWebHashHistory } from "vue-router";
import routes from "./routes";
import { nextTick } from "vue";

const router = createRouter({
  history: createWebHashHistory(),
  routes: routes,
});
router.afterEach((_to, from) => {
  console.log(_to, from, !from.path.startsWith('/main'));
  
  if (!from.path.startsWith('/main')) {
    nextTick(() => {
      window.ipc.toTop()
    })
  }
})
export default router;