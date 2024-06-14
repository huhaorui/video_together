<script setup>
import {reactive, toRefs, defineProps} from 'vue';
import axios from "axios";

const props = defineProps({
  //子组件接收父组件传递过来的值
  video_url: String,
})
//使用父组件传递过来的值
const {video_url} = toRefs(props)

</script>

<template>
  <div style="padding-left: 20px;padding-right: 20px;">
    <video :src="video_url"
        id="movie" width="640" height="360" autoplay controls style="padding-bottom: 30px"/>
  </div>
</template>


<style scoped>

</style>


<script>
import {reactive} from "vue";

const formState = reactive({
  root_link: '',
});

export default {
  name: 'room',
  data: () => ({
    url: "https://video.router.huhaorui.com:8888/%E5%B0%91%E5%B9%B4%E6%B3%95%E5%BA%AD01.mp4",
    video: undefined,
    pauseing_update: false,
    id: 0,
    formState: {},
    play_list: {},
    index: 0
  }),
  methods: {
    enterUrl(url, index) {
      if (url.endsWith('.mp4')) {
        this.video.src = decodeURI(url)
        document.title = decodeURI(this.video.src.substring(this.video.src.lastIndexOf('/') + 1))
        this.index = index
      }  else {
        alert("暂不支持处理" + url)
      }
    }
  },
  mounted() {
    window.enterUrl = (url, index) => this.enterUrl(url, index)
    this.url = this.$route.query.url
    this.id = this.$route.query.id
    formState.root_link = this.$route.query.dir
    if (this.id === undefined) {
      this.id = this.url
    }
    console.log('url', this.url)
    console.log('formState.root_link', formState.root_link)
    this.video = document.getElementById("movie")
    this.video.src = this.url
    this.video.onseeked = () => {
      this.pauseing_update = true
      setTimeout(() => {
        this.pauseing_update = false
      }, 2000)
      this.$axios.post("/send", {
        movie: this.id === undefined ? this.video.src : this.id,
        video_time: this.video.currentTime,
        seek_time: new Date().getTime()
      })
    }
    this.video.onended = () => {
      this.index++
      console.log(this.play_list)
      this.video.src = this.play_list.get(this.index).url
      document.title = decodeURI(this.video.src.substring(this.video.src.lastIndexOf('/') + 1))
      this.pauseing_update = true
      setTimeout(() => {
        this.pauseing_update = false
      }, 3000)
    }
    this.video.onplay = () => {
      this.pauseing_update = true
      setTimeout(() => {
        this.pauseing_update = false
      }, 2000)
      this.$axios.post("/send", {
        movie: this.id === undefined ? this.video.src : this.id,
        video_time: this.video.currentTime,
        seek_time: new Date().getTime()
      })
    }
    setInterval(() => {
      if (!this.pauseing_update) {
        this.$axios.post("/receive", {movie: this.id === undefined ? this.video.src : this.id}).then(res => {
          let me_start_time = new Date().getTime() / 1000 - this.video.currentTime
          let remote_start_time = res.data.seek_time / 1000 - res.data.video_time
          if (!this.pauseing_update && !this.video.paused) {
            if (Math.abs(me_start_time - remote_start_time) > 5) {
              this.pauseing_update = true
              this.video.currentTime = new Date().getTime() / 1000 - res.data.seek_time / 1000 + res.data.video_time
              setTimeout(() => {
                this.pauseing_update = false
              }, 2000)
            }
          }
        })
      }
    }, 1000)
    if (formState.root_link !== "") {
      this.enter()
    }
  },
}
</script>


