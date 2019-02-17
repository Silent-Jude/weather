<!--天气预报页面-->
<template>
  <div class="weather-app" :class="currentWeatherBG">
    <div class="header-wrap">
      <div class="header-left">
        <img src="../assets/images/icon.png">
      </div>
      <div class="header-right">
        <p class="warn-info">预警信息：{{warning}}</p>
        <p class="company">神木煤化工产业有限公司</p>
      </div>
    </div>

    <div class="main-wrap">
      <div class="current-info">
        <div class="location">
          <img src="../assets/images/location.png" class="icon">
          <p class="address">{{area}}</p>
        </div>
        <div class="current-weather">
          <p class="temp" v-if="hoursDetail[0]">
            {{hoursDetail[0].temp}}°
          </p>
          <img v-if="hoursDetail[0]" :src="hoursDetail[0].hours | getHoursWeatherIcon(hoursDetail[0].weather)" class="icon" @click="nextWeather">
        </div>
        <div class="other">
          <div class="wetness">
            <img src="../assets/images/wetness.png" class="icon">
            <p class="text">湿度：{{wetness}}%</p>
          </div>
          <div class="air">
            <img src="../assets/images/pm.png" class="icon">
            <p class="text">PM2.5：{{airQuality}} {{airQuality | getAirLevel}}</p>
          </div>
          <p>[{{updateTime}}:00更新]</p>
        </div>
      </div>

      <div class="hours-detail">
        <div class="hours-item" v-for="(item,i) of hoursDetail" :key="i">
          <div class="hours">{{item.hours | getHours}}</div>
          <img :src="item.hours | getHoursWeatherIcon(item.weather)" class="icon">
          <div class="weather">{{item.weather |getWeather}}</div>
          <div class="temp">{{item.temp}}°C</div>
        </div>
      </div>

      <div class="day-detail">
        <div class="day-item" v-for="(item,i) of dayDetail" :key="i">
          <div class="date" v-if="i==0">
            今天({{new Date(item.date).getMonth()+1}}/{{new Date(item.date).getDate()}})
          </div>
          <div class="date" v-else-if="i==1">
            明天({{new Date(item.date).getMonth()+1}}/{{new Date(item.date).getDate()}})
          </div>
          <div class="date" v-else>
            {{new Date(item.date).getDay()|getWeek}} ({{new Date(item.date).getMonth()+1}}/{{new Date(item.date).getDate()}})
          </div>
          <div class="weather">{{item.dayWeather |getWeather}}</div>
          <img :src="item.dayWeather | getDayWeatherIcon" class="icon">
          <img :src="item.nightWeather | getNightWeatherIcon" class="icon night">
          <div class="weather">{{item.nightWeather |getWeather}}</div>
        </div>
      </div>
      <div class="temp-canvas" ref="wrap">
        <canvas ref="canvas"></canvas>
      </div>
    </div>
  </div>

</template>

<script>
export default {
  components: {},
  data () {
    return {
      list: [],
      dayDetail: [],
      hoursDetail: [],
      wetness: '',
      updateTime: '',
      airQuality: '',
      area: '',
      warning: '',
      ctx: null
    }
  },

  computed: {
    currentWeatherBG () {
      if (this.hoursDetail.length) {
        switch (this.hoursDetail[0].weather) {
          case 0:
            return 'bg-sun'
            break
          case 1:
            return 'bg-cloud'
            break
          case 2:
            return 'bg-rain'
            break
          case 3:
            return 'bg-snow'
            break
        }
      }
    }
  },

  watch: {},

  created () {

  },
  mounted () {
    this.axios.get('/weatherList').then(res => {
      this.airQuality = res.data.airQuality;
      this.area = res.data.area;
      this.dayDetail = res.data.dayDetail
      this.hoursDetail = res.data.hoursDetail
      this.updateTime = res.data.updateTime
      this.warning = res.data.warning
      this.wetness = res.data.wetness
    }).then(this.initTempCanvas).catch(err => { console.log(err) })

    this.$refs.canvas.width = this.$refs.wrap.clientWidth
    this.$refs.canvas.height = this.$refs.wrap.clientHeight
    this.ctx = this.$refs.canvas.getContext('2d')
  },

  methods: {
    initTempCanvas () {
      var itemWidth = this.$refs.canvas.width * 0.13
      var distance = this.$refs.canvas.width * 0.09 / 6

      //最高温度画笔设置。

      this.ctx.strokeStyle = "#ffff73"
      this.ctx.lineWidth = 3
      this.ctx.beginPath()
      this.ctx.textAlign = "center";
      this.ctx.font = "16px 微软雅黑"

      //绘制最高温度图形。
      for (var i = 0; i < this.dayDetail.length; i++) {
        this.ctx.fillStyle = "#ffffff"
        var pointX = itemWidth * i + distance * i + itemWidth / 2
        var pointY = 70 - this.dayDetail[i].maxTemp
        if (i < this.dayDetail.length - 1) {
          var nextX = itemWidth * (i + 1) + distance * (i + 1) + itemWidth / 2
          var nextY = 70 - this.dayDetail[i + 1].maxTemp
        }
        this.ctx.moveTo(pointX, pointY)
        this.ctx.arc(pointX, pointY, 3, 0, 2 * Math.PI)
        this.ctx.fillText(this.dayDetail[i].maxTemp + '°C', pointX, pointY - 10)
        // this.ctx.clearRect((itemWidth + distance) * (i + 1), 0, itemWidth, 200)
        this.ctx.lineTo(nextX, nextY)
        this.ctx.arc(nextX, nextY, 3, 0, 2 * Math.PI)
      }
      this.ctx.closePath()
      this.ctx.fillStyle = "#ffff73"
      this.ctx.fill();
      this.ctx.stroke()

      //绘制最底温度图形。
      this.ctx.beginPath()
      this.ctx.strokeStyle = "#4BF6F6"
      for (var i = 0; i < this.dayDetail.length; i++) {
        this.ctx.fillStyle = "#ffffff"
        var pointX = itemWidth * i + distance * i + itemWidth / 2
        var pointY = 130 - this.dayDetail[i].minTemp
        if (i < this.dayDetail.length - 1) {
          var nextX = itemWidth * (i + 1) + distance * (i + 1) + itemWidth / 2
          var nextY = 130 - this.dayDetail[i + 1].minTemp
        }
        this.ctx.moveTo(pointX, pointY)
        this.ctx.arc(pointX, pointY, 3, 0, 2 * Math.PI)
        this.ctx.fillText(this.dayDetail[i].minTemp + '°C', pointX, pointY - 10)
        this.ctx.lineTo(nextX, nextY)
        this.ctx.arc(nextX, nextY, 3, 0, 2 * Math.PI)
      }
      this.ctx.closePath()
      this.ctx.fillStyle = "#4BF6F6"
      this.ctx.fill();
      this.ctx.stroke()



      console.log('画完了')
    },
    nextWeather () {
      this.hoursDetail[0].weather = Math.floor(Math.random() * 4)
    },
  },
  filters: {
    getHoursWeatherIcon (hours, weather) {
      if (hours >= 6 && hours <= 18) {//判断出白天。
        switch (weather) {
          case 0://晴天''
            return "/static/images/sun.png"
            break
          case 1://多云
            return '/static/images/cloud-sun.png'
            break
          case 2://雨
            return '/static/images/rain.png'
            break
          default://雪
            return '/static/images/snow.png'
            break
        }
      } else {
        switch (weather) {
          case 0://晴天
            return '/static/images/night-sun.png'
            break
          case 1://多云
            return '/static/images/cloud-night.png'
            break
          case 2://雨
            return '/static/images/rain-night.png'
            break
          default://雪
            return '/static/images/snow-night.png'
            break
        }
      }
    },
    getDayWeatherIcon (weather) {
      switch (weather) {
        case 0://晴天''
          return "/static/images/sun.png"
          break
        case 1://多云
          return '/static/images/cloud-sun.png'
          break
        case 2://雨
          return '/static/images/rain.png'
          break
        default://雪
          return '/static/images/snow.png'
          break
      }
    },
    getNightWeatherIcon (weather) {
      switch (weather) {
        case 0://晴天''
          return "/static/images/night-sun.png"
          break
        case 1://多云
          return '/static/images/cloud-night.png'
          break
        case 2://雨
          return '/static/images/rain-night.png'
          break
        default://雪
          return '/static/images/snow-night.png'
          break
      }
    },
    getWeather (val) {
      switch (val) {
        case 0:
          return '晴'
          break
        case 1:
          return '多云'
          break
        case 2:
          return '雨'
          break
        default:
          return '雪'
          break
      }
    },
    getWeek (val) {
      switch (val) {
        case 0:
          return '周日'
          break
        case 1:
          return '周一'
          break
        case 2:
          return '周二'
          break
        case 3:
          return '周三'
          break
        case 4:
          return '周四'
          break
        case 5:
          return '周五'
          break
        case 6:
          return '周六'
          break
      }
    }
  }
}

</script>
<style lang='stylus' scoped>
.bg-sun
  background url('/static/images/bg-sun.jpg') no-repeat 0 0 / cover
.bg-cloud
  background url('/static/images/bg-cloud.jpg') no-repeat 0 0 / cover
.bg-rain
  background url('/static/images/bg-rain.jpg') no-repeat 0 0 / cover
.bg-snow
  background url('/static/images/bg-snow.jpg') no-repeat 0 0 / cover
.weather-app
  width 100%
  height 1080px
  .header-wrap
    padding-left 30px
    padding-right 30px
    background rgba(0, 0, 0, 0.5)
    display flex
    justify-content space-between
    align-items center
    .header-right
      display flex
      justify-content space-around
      align-items center
      .warn-info
        padding 10px
        font-size 16px
        font-weight 700
        color #e00
        text-shadow 1px 0px 0px #fff, 0px 1px 0px #fff, 0px -1px 0px #fff, -1px 0px 0px #fff
        background rgba(0, 0, 0, 0.5)
      .company
        margin-left 30px
        color #fff
  .main-wrap
    color #fff
    width 80%
    margin 55px auto 0
    .current-info
      font-size 16px
      display flex
      flex-direction column
      .location
        display flex
        .icon
          width 12px
          height 100%
        .address
          margin-left 10px
      .current-weather
        margin-top 30px
        display flex
        align-items center
        .temp
          font-size 80px
          font-weight 700
        .icon
          margin-left 20px
          width 90px
      .other
        padding 20px 0
        display flex
        align-items center
        .wetness, .air
          display flex
          align-items center
          margin-right 40px
          .icon
            width 30px
            height 100%
            margin-right 10px
  .hours-detail
    background rgba(0, 0, 0, 0.5)
    height 160px
    display flex
    justify-content space-around
    .hours-item
      display flex
      flex-direction column
      justify-content space-around
      align-items center
      .icon
        width 25px
  .day-detail
    margin-top 16px
    display flex
    justify-content space-between
    .day-item
      height 430px
      flex 0 1 13%
      background rgba(0, 0, 0, 0.5)
      display flex
      flex-direction column
      align-items center
      .date
        margin-top 15px
      .weather
        margin-top 20px
        margin-bottom 20px
      .icon
        width 45px
      .night
        margin-top 200px
  .temp-canvas
    margin-top -298px
    height 200px
</style>