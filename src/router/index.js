import Vue from 'vue'
import VueRouter from 'vue-router'
import VueGtag from 'vue-gtag'


const Map = () => import('../components/Map')
const Import = () => import('../components/Import')
const Make_report = () => import('../components/Make_report')
const New_industry = () => import('../components/New_industry')
const Industry_statistics = () => import('../components/Industry_statistics')
const General_config = () => import('../components/General_config')


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
    path: '/make_report/',
    name: 'report',
    component: Make_report
  },
  {
    path: '/make_report/:assessment_id/',
    name: 'report_prop',
    component: Make_report,
    props: true,

  },
  {
    path: '/statistics/:assessment_id/:industry_id',
    name: 'statistics',
    props: true,
    component: Industry_statistics
  },
  {
    path: '/configuration',
    name: 'general_configuration',
    component: General_config
  },

]

const router = new VueRouter({
  mode: "hash",
  routes
})

const getCookies = localStorage.getItem('cookie:accepted');
//const getCookies = localStorage.getItem('GA:accepted');

Vue.use(VueGtag, {
  config: {
    id: 'G-VFVWVGECE2'
  },
  bootstrap: getCookies === 'true',
  enabled: getCookies === 'true',
}, router);

export default router
