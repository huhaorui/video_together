<template>

  <v-app id="inspire">
    <!-- 顶边栏 -->
    <v-app-bar app color=#4CAF50 dark>
      <v-app-bar-nav-icon/>
      <v-toolbar-title>Video together</v-toolbar-title>
    </v-app-bar>

    <!--  中间content  -->
    <v-content>
      <component :is="activeItem"></component>
    </v-content>
  </v-app>
</template>

<script>

export default {
  components: {
    room: () => import('./views/room'),
  },
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
