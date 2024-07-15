<template>
  <a-layout style="min-height: 100vh">
    <LeftSides @choose_menu="return_url" :curr_index="curr_index"/>

    <a-layout>
      <a-layout-header style="background: #fff; padding: 0" />
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
import {reactive, ref} from "vue";
import room from "./views/room.vue";
import LeftSides from "@/components/LeftSides.vue";
let choose_video_obj = ref({})
let curr_index = ref()

const return_url = (obj) => {
  choose_video_obj.value = obj
}
const update_index = (index) => {
  curr_index.value = index
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
