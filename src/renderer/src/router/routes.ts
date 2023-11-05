import login from '@p/auth/index.vue';
import { RouteRecordRaw } from 'vue-router';
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: "/login",
    component: login
  },
  {
    path: "/login/byPassWord",
    component: () => import("@p/auth/byPassWord/index.vue")
  },
  {
    path: "/login/signup",
    component: () => import("@p/auth/signup/index.vue")
  },
  {
    path: "/main",
    component: () => import("@p/home/index.vue")
  },
  {
    path: "/main/address",
    component: () => import("@p/address/index.vue")
  },
  {
    path: "/p",
    component: () => import("@p/permiss/index.vue")
  },
  {
    path: "/main/userSetting",
    component: () => import("@p/setting/index.vue")
  }
];
export default routes;
