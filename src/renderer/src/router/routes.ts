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
    meta: { for: 'chat' },
    component: () => import("@p/home/index.vue"),
    children: [{
      path: "chat/:type/:uid",
      component: () => import("@p/chat/index.vue"),
      meta: { for: 'chat' }
    },
    {
      path: "dev/chat",
      component: () => import("@p/dev/chat.vue"),
      meta: { for: 'dev' }
    }]
  },
  {
    path: "/main/address",
    component: () => import("@p/address/index.vue"),
    meta: { for: 'address' },
    children: [{
      path: ':uid',
      meta: { for: 'address' },
      component: () => import("@p/address/index/index.vue")
    }, {
      path: 'check/:uid',
      meta: { for: 'address' },
      component: () => import("@p/address/index/check.c.vue")
    }]
  },
  {
    path: "/p",
    component: () => import("@p/permiss/index.vue")
  },
  {
    path: "/main/setting/user",
    meta: { for: 'setting' },
    component: () => import("@p/setting/user/index.vue")
  },
  {
    path: "/main/setting/app",
    component: () => import("@p/setting/app/index.vue"),
    meta: { for: 'setting' },
  },
  {
    path: "/main/dev",
    meta: { for: 'dev' },
    component: () => import("@p/dev/index.vue")
  },
  {
    path: "/main/chat/:type/preview",
    component: () => import("@p/chat/preview/index.vue"),
    meta: { for: 'chat' },
  }
];
export default routes;
