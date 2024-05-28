<template>
  <div style="padding-left: 20px;padding-right: 20px;">
    <video id="movie" width="640" height="360" autoplay controls/>
    <input type="text" id="url"/>
    <v-textarea
        label="URL"
        rows="1"
        v-model="dir_url"
    ></v-textarea>
    <v-btn
        color="primary"
        @click="enter"
    >
      确认
    </v-btn>
    <div id="choose" width="360" height="640"/>
  </div>
</template>

<style scoped>


</style>
<script>

export default {
  name: 'room',
  data: () => ({
    url: "https://video.router.huhaorui.com:8888/%E5%B0%91%E5%B9%B4%E6%B3%95%E5%BA%AD01.mp4",
    video: undefined,
    pauseing_update: false,
    id: 0,
    dir_url: "",
    play_list: {},
    index: 0
  }),
  methods: {
    enter() {
      console.log(this.dir_url)
      if (this.dir_url.endsWith('/')) {
        this.$http.get(this.dir_url).then(res => {
          this.play_list = new Map()
          let html = res.data
          const regex = /<a href="([^"]+)">([^<]+)<\/a>/g;
          let matches;
          let index = 1;
          while ((matches = regex.exec(html)) !== null) {
            const url = matches[1];
            const fileName = matches[2];
            this.play_list.set(index, {url, fileName});
            index++;
          }
          html = html.replaceAll(regex, '<a href="javascript:this.enterUrl(\'' + this.dir_url + '$1\')">$2</a>');
          console.log(this.play_list)
          this.play_list.forEach((v, k) => {
            html = html.replace(v.url + '\'', v.url + '\',' + k)
            this.play_list.set(k, {url: this.dir_url + v.url, fileName: v.fileName})
          })
          document.getElementById('choose').innerHTML = html
        })
      }
    },
    enterUrl(url, index) {
      if (url.endsWith('.mp4')) {
        this.video.src = decodeURI(url)
        document.title = decodeURI(this.video.src.substring(this.video.src.lastIndexOf('/') + 1))
        this.index = index
      } else if (url.endsWith('../')) {
        this.dir_url = this.dir_url.substring(0, this.dir_url.lastIndexOf('/'))
        this.dir_url = this.dir_url.substring(0, this.dir_url.lastIndexOf('/')) + '/'
        this.enter()
      } else if (url.endsWith('/')) {
        this.dir_url = url
        this.enter()
      } else {
        alert("暂不支持处理" + url)
      }
    }
  },
  mounted() {
    window.enterUrl = (url, index) => this.enterUrl(url, index)
    this.url = this.$route.query.url
    this.id = this.$route.query.id
    this.dir_url = this.$route.query.dir
    if (this.id === undefined) {
      this.id = this.url
    }
    console.log('url', this.url)
    console.log('dir_url', this.dir_url)
    this.video = document.getElementById("movie")
    this.video.src = this.url
    this.video.onseeked = () => {
      this.pauseing_update = true
      setTimeout(() => {
        this.pauseing_update = false
      }, 2000)
      this.$http.post("/send", {
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
      this.$http.post("/send", {
        movie: this.id === undefined ? this.video.src : this.id,
        video_time: this.video.currentTime,
        seek_time: new Date().getTime()
      })
    }
    setInterval(() => {
      if (!this.pauseing_update) {
        this.$http.post("/receive", {movie: this.id === undefined ? this.video.src : this.id}).then(res => {
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
    if (this.dir_url !== "") {
      this.enter()
    }
  },
}
</script>


