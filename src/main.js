// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import axios from 'axios'
import './assets/style/reset.css'

Vue.prototype.axios = axios
axios.defaults.baseURL = "http://127.0.0.1:5050"
axios.defaults.withCredentials = true

Vue.config.productionTip = false

Vue.filter('getAirLevel', function (val) {
  if (val <= 50) {
    return '优'
  } else if (val > 50 && val <= 150) {
    return '良'
  } else if (val > 150 && val <= 250) {
    return '中'
  } else return '差'
})

Vue.filter('getHours', function (val) {
  if (val > 24) {
    return val - 24
  } else return val
})


/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: {
    App
  },
  template: '<App/>'
})
