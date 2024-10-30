<template>
	<div style="max-width: 100%;height: auto;display: block">
		<video ref="video" :src="video_url" id="movie" autoplay controls
		       style="margin: auto;max-width: 90%;display: block"></video>
	</div>
</template>

<script setup>
import {ref, onMounted, watch, toRefs, defineProps, toRaw, reactive, defineEmits} from 'vue';
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

const emit = defineEmits(['return_index'])
const onVideoEnded = () => {
	index.value++;
	emit('return_index', index)
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
	axios.post('/send', {
		movie: id.value === '' ? video.value.src : id.value,
		video_time: video.value.currentTime,
		seek_time: new Date().getTime(),
	}).then(() => {
		pauseing_update.value = false;
	});
};

const onVideoPlay = () => {
	pauseing_update.value = true;
	axios.post('/send', {
		movie: id.value === '' ? video.value.src : id.value,
		video_time: video.value.currentTime,
		seek_time: new Date().getTime(),
	}).then(() => {
		pauseing_update.value = false;

		// TODO 记录播放记录到localStorage
		playHistory(video.value.src)

	});
};

const playHistory = (videoUrl) => {
	// console.log(videoUrl)  // http://localhost:5173/nas/%E5%93%86%E5%95%A6A%E6%A2%A6/2019%E5%B9%B4/548%E8%AF%9D%20%E7%A5%9E%E7%81%AF%E7%9A%84%E7%83%9F%E6%80%AA%20and%20%E8%83%96%E8%99%8E%E7%9A%84%E7%82%96%E8%8F%9C.mp4
	// 读取播放记录
	var urlParts = videoUrl.split('/');
	var videoName = decodeURIComponent(urlParts.pop());
	var dir = urlParts.join('/');

	let playHistory = localStorage.getItem('playHistory');
	if (playHistory) {
		playHistory = JSON.parse(playHistory);
	} else {
		playHistory = {}
	}
	// 加入此播放记录，并维持最近播放的五个项目  TODO 用clip后的名字
	var dirData = playHistory[dir]
	window.dirData=dirData
	window.name=decodeURIComponent(videoName)
	if (dirData) {
		if (dirData.every(item => item.name !== decodeURIComponent(videoName))) {  // 查重
			dirData.push({"name": videoName, "url": "?source_url=" + decodeURIComponent(dir) + "/&file_name=" + decodeURIComponent(videoName)});
			dirData.length > 5 && dirData.shift();
		}
	} else {
		playHistory[dir] = [{"name": decodeURIComponent(videoName), "url": "?source_url=" + decodeURIComponent(dir) + "/&file_name=" + decodeURIComponent(videoName)}]
	}

	// 存储
	localStorage.setItem('playHistory', JSON.stringify(playHistory));
	console.log(playHistory)

}

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
