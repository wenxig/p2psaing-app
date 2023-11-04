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
    component: () => import("@p/home/index.vue"),
    // children: [{
    //   path: "link/oao",
    //   component: () => import("@p/home/linker/oao.vue")
    // }, {
    //   path: "link/group",
    //   component: () => import("@p/home/linker/group.vue")
    // }]
  },
  {
    path: "/p",
    component: () => import("@p/permiss/index.vue")
  },
  {
    path: "/main/userSetting",
    component: () => import("@p/home/userSetting/index.vue")
  }
];
export default routes;
