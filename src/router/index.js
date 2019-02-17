import Vue from 'vue'
import Router from 'vue-router'
import Weather from '@/views/Weather'

Vue.use(Router)

export default new Router({
  routes: [{
    path: '/',
    name: 'weather',
    component: Weather
  }]
})
