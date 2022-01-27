import Vue from 'vue'
import VueRouter from 'vue-router'
import Map from '../components/Map'
import New_industry from "../components/New_industry";
import Import from "../components/Import";
import Make_report from "../components/Make_report";
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'map',
    component: Map
  },
  {
    path: '/edit_industry/:assessment_id/:industry_id',
    name: 'edit_industry',
    props: true,
    component: New_industry
  },
  {
    path: '/import',
    name: 'import',
    component: Import
  },
  {
    path: '/make_report',
    name: 'report',
    component: Make_report
  },


]

const router = new VueRouter({
  mode: "hash",
  routes
})

export default router
