<script setup>
import { ref } from 'vue';
const open = ref(false);
const playHistory = ref({})

const afterOpenChange = bool => {
	console.log('open', bool);
};
const showDrawer = () => {
	open.value = true;

	let storedHistory = localStorage.getItem('playHistory');
	if (storedHistory) {
		playHistory.value = JSON.parse(storedHistory);  // 通过 .value 来更新响应式数据
	}
	console.log(playHistory.value);  // 输出响应式变量的当前值
};
</script>

<template>
	<a-button type="primary" @click="showDrawer" style="height: 5%; margin-top: 30px;">查看历史播放情况</a-button>
	<a-drawer
		v-model:open="open"
		class="custom-class"
		root-class-name="root-class-name"
		:root-style="{ color: 'blue' }"
		style=""
		title="观看历史记录"
		placement="right"
		@after-open-change="afterOpenChange"
	>
		<div v-for="(items, path) in playHistory.value" :key="path">
			<h3>{{ decodeURIComponent(path) }}</h3>
			<div v-for="(item, index) in items" :key="index">
				<a :href="item.url"> {{ decodeURIComponent(item.name) }} </a>
			</div>
		</div>
	</a-drawer>
</template>

<style scoped>

</style>