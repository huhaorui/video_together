<template>
  <a-layout style="min-height: 100vh">
    <LeftSides @choose_menu="return_url"></LeftSides>

    <a-layout>
      <a-layout-header style="background: #fff; padding: 0" />
      <a-layout-content style="margin: 0 16px">

        <div :style="{ padding: '24px', background: '#fff', minHeight: '360px' }">
          <room :video_url="video_url"/>
        </div>

      </a-layout-content>


      <a-layout-footer style="text-align: center">
        Ant Design ©2018 Created by Ant UED
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref } from "vue";
import room from "./views/room.vue";
import LeftSides from "@/components/LeftSides.vue";
const collapsed = ref(false);
const selectedKeys = ref(["1"]);
const video_url = ref("")

const return_url = (url) => {
  console.log(url)
  video_url.value = url
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
