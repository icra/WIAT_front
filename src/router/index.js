import Vue from 'vue'
import VueRouter from 'vue-router'
import Map from '../components/Map'
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Map
  },

]

const router = new VueRouter({
  routes
})

export default router
