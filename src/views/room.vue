<template>
  <div style="padding-left: 20px; padding-right: 20px;">
    <video ref="video" :src="video_url" id="movie" width="100%" height="100%" autoplay controls
           style="padding-bottom: 30px"></video>
  </div>
</template>

<script setup>
import {ref, onMounted, watch, toRefs, defineProps, toRaw, reactive} from 'vue';
import axios from 'axios';
import {useRoute} from 'vue-router';

const props = defineProps({
  choose_video_obj: {
    type: Object,
  },
});

const {choose_video_obj} = toRefs(props);
const index = ref(0);
const id = ref('');
let video_url = ref('');
const play_list = reactive([]);
const pauseing_update = ref(false);
const video = ref(null);
const formState = ref({});
const nosync = ref(undefined)

watch(choose_video_obj, (newValue) => {
  newValue = toRaw(newValue);
  index.value = newValue.video_index;
  video_url.value = newValue.video_url;
  play_list.value = newValue.play_list;
});

const onVideoEnded = () => {
  index.value++;
  const currentItem = play_list.value[index.value];
  video.value.src = video_url.value.substring(0, video_url.value.lastIndexOf('/')) + '/' + currentItem.name;
  document.title = decodeURI(currentItem.show_name);
  pauseing_update.value = true;
  setTimeout(() => {
    pauseing_update.value = false;
  }, 3000);
};

const onVideoSeeked = () => {
  pauseing_update.value = true;
  setTimeout(() => {
    pauseing_update.value = false;
  }, 2000);
  axios.post('/send', {
    movie: id.value === '' ? video.value.src : id.value,
    video_time: video.value.currentTime,
    seek_time: new Date().getTime(),
  });
};

const onVideoPlay = () => {
  pauseing_update.value = true;
  setTimeout(() => {
    pauseing_update.value = false;
  }, 2000);
  axios.post('/send', {
    movie: video_url.value,
    video_time: video.value.currentTime,
    seek_time: new Date().getTime(),
  });
};

const sync = () => {
  if (!pauseing_update.value && nosync.value === undefined) {
    axios.post("/receive", {movie: id.value === '' ? video.value.src : id.value}).then(res => {
      let me_start_time = new Date().getTime() / 1000 - video.value.currentTime
      let remote_start_time = res.data.seek_time / 1000 - res.data.video_time
      if (!pauseing_update.value && !video.value.paused) {
        if (Math.abs(me_start_time - remote_start_time) > 5) {
          pauseing_update.value = true
          video.value.currentTime = new Date().getTime() / 1000 - res.data.seek_time / 1000 + res.data.video_time
          setTimeout(() => {
            pauseing_update.value = false
          }, 2000)
        }
      }
    })
  }
}


onMounted(() => {
  video.value = document.getElementById('movie');
  video.value.onseeked = onVideoSeeked;
  video.value.onended = onVideoEnded;
  video.value.onplay = onVideoPlay;
  setInterval(() => {
    sync()
  }, 1000)
  const route = useRoute();
  watch(() => route.query, (query) => {
    video_url.value = query.url;
    video.value.src = video_url.value;
    formState.value.root_link = query.dir;
    nosync.value = query.nosync
    if (query.id) {
      id.value = query.id;
    }
  })
});
</script>

<style scoped>
</style>
