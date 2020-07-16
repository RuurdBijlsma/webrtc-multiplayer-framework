import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Test.vue'
import GameTest from "../views/GameTest";

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'GameTest',
    component: GameTest
  },
  {
    path: '/test',
    name: 'Home',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/Test.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
