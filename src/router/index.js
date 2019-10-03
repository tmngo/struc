import Vue from 'vue'
import Router from 'vue-router'
import Help from '@/components/Help'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/help',
      name: 'Help',
      component: Help
    },
  ]
})
