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
    children: [{
      path: "chat/:type/:uid",
      component: () => import("@p/chat/index.vue")
    },
    {
      path: "dev/chat",
      component: () => import("@p/dev/chat.vue")
    }]
  },
  {
    path: "/main/address",
    component: () => import("@p/address/index.vue"),
    children: [{
      path: ':uid',
      component: () => import("@p/address/index/index.vue")
    }]
  },
  {
    path: "/p",
    component: () => import("@p/permiss/index.vue")
  },
  {
    path: "/main/setting/user",
    component: () => import("@p/setting/user/index.vue")
  },
  {
    path: "/main/setting/app",
    component: () => import("@p/setting/app/index.vue")
  },
  {
    path: "/main/dev",
    component: () => import("@p/dev/index.vue")
  },
  {
    path: "/main/dev/state",
    component: () => import("@p/dev/state.vue")
  },
  {
    path: "/main/chat/img/preview",
    component: () => import("@p/chat/preview/index.vue")
  }
];
export default routes;
