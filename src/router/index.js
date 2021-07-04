import Vue from 'vue'
import VueRouter from 'vue-router'
import Map from '../components/Map'
import New_assessment from "../components/New_assessment";
import New_industry from "../components/New_industry";
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'map',
    component: Map
  },
  {
    path: '/add_assessment',
    name: 'new_assessment',
    component: New_assessment
  },
  {
    path: '/add_company/:assessment_id',
    name: 'new_industry',
    props: true,
    component: New_industry
  },

]

const router = new VueRouter({
  mode: "history",
  routes
})

export default router
