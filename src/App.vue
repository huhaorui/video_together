<template>
  <a-layout style="min-height: 100vh">
    <LeftSides @choose_menu="return_url" :curr_index="curr_index"/>
    <a-float-button style="width: 64px;height: 64px" type="primary" @click="copy_share_link()">
      <template #icon>
        <ShareAltOutlined/>
      </template>
    </a-float-button>
    <a-layout>
      <a-layout-header style="background: #fff; padding: 0"/>
      <a-layout-content style="margin: 0 16px">

        <div :style="{ padding: '24px', background: '#fff', minHeight: '360px' }">
          <room :choose_video_obj="choose_video_obj" @return_index="update_index"/>
        </div>

      </a-layout-content>


      <a-layout-footer style="text-align: center">
        Ant Design ©2018 Created by Ant UED
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<script setup>
import {ref} from "vue";
import room from "./views/room.vue";
import LeftSides from "@/components/LeftSides.vue";
import {ShareAltOutlined} from '@ant-design/icons-vue';
import axios from "axios";
import { message } from 'ant-design-vue';



let choose_video_obj = ref({})
let curr_index = ref()

const return_url = (obj) => {
  choose_video_obj.value = obj
}
const update_index = (index) => {
  curr_index.value = index
}
const copy_share_link = () => {
  console.log(choose_video_obj)
  let video_url = choose_video_obj.value.video_url
  if (video_url === undefined) {
    return
  }
  let path = video_url.substring(0, video_url.lastIndexOf('/') + 1)
  let filename = video_url.substring(video_url.lastIndexOf('/') + 1)
  let index = choose_video_obj.value.video_index
  let url = '/?'
  if (path) {
    url = `${url}source_url=${path}`
  }
  if (filename) {
    url = `${url}&file_name=${filename}`
  }
  if (index) {
    url = `${url}&index=${index}`
  }
  axios.post('/share/shorten', {
    'longUrl': url
  }).then((res) => {
    navigator.clipboard.writeText(`${window.location.origin}/share/${res.data.shortUrl}`)
    message.info('This is a normal message');
    console.log()
  });
  console.log(url)
}
</script>

<style>
:global(.edit-sider) {
  flex: 0 0 auto;
}

#components-layout-demo-side .logo {
  height: 32px;
  margin: 16px;
  background: rgba(255, 255, 255, 0.3);
}

.site-layout .site-layout-background {
  background: #fff;
}

[data-theme="dark"] .site-layout .site-layout-background {
  background: #141414;
}
</style>


<script>
export default {
  props: {
    source: String
  },
  data: () => ({
    activeItem: 'room'
  }),
  watch: {},
  created() {
    this.activeItem = "room"
  }
}
</script>
