import Vue from 'vue'
import VueRouter from 'vue-router'


const Map = () => import('../components/Map')
const Import = () => import('../components/Import')
const Make_report = () => import('../components/Make_report')
const New_industry = () => import('../components/New_industry')
const Industry_statistics = () => import('../components/Industry_statistics')


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
  {
    path: '/statistics/:assessment_id/:industry_id',
    name: 'statistics',
    props: true,
    component: Industry_statistics
  },


]

const router = new VueRouter({
  mode: "hash",
  routes
})

export default router
