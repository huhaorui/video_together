<script setup>
import {reactive, ref, defineEmits, onMounted, watch, toRefs, toRaw} from "vue";
import axios from "axios";
import {useRoute} from "vue-router";

const formState = reactive({
  root_link: '',
});

const props = defineProps({
  curr_index: {
    type: Number,
  },
})
const {curr_index} = toRefs(props)

let file_list = ref([{}]);
let source_url = ref('')
let file_name = ref('')
let index = ref(0)
let selectedKeys = ref([])
let collapsed = ref(false)
let loading_file_flag = ref(true)

watch(curr_index, (newValue) => {
  newValue = toRaw(newValue);
  selectedKeys.value = [newValue.value];
});

const rename_file_by_rule = (directory_url) => {
  return axios.get(directory_url + 'rule.js')
      .then(response => {
        console.log(directory_url + 'rule.js存在');
        eval(response.data); // 直接执行 rule.js 文件内容
      })
      .catch(() => {
        console.log(directory_url + 'rule.js不存在或加载失败');
        document.crop_name = (name) => name; // 默认的函数
      });
};

const get_directory_detail = (url) => {
  file_list.value = []
  loading_file_flag.value = true
  url = url.substring(0, url.lastIndexOf('/') + 1)
  if (url.endsWith('/')) {
    axios.get(url).then(res => {
      let return_file_list = res.data;
      document.crop_name = (url) => rename_file_by_rule(url)
      document.crop_name(url)
          .then(() => {
            return_file_list.forEach(item => {
              item.show_name = document.crop_name(item.name);
            });
            return_file_list = return_file_list.filter(item => item.name !== 'rule.js')
            if (url.length - url.replaceAll('/', '').length === 3) { //如果有且只有三个'/'，则认为当前处于根目录
              file_list.value = return_file_list
            } else {
              file_list.value = [{'name': '../', 'type': 'directory', 'show_name': '⬅️ 返回上层'}, ...return_file_list]
            }
            loading_file_flag.value = false
          });
    }).catch(err => {
      console.error(err);
      // 处理错误
    });
  }
}

const emit = defineEmits(['choose_menu'])
const choose_menu = (index, show_name, url, type) => {
  if (url === undefined) {
    return;
  }
  let [protocol, relative_url] = url.split('://')
  let reformed_url = relative_url
  if (relative_url.indexOf("../") !== -1) {
    reformed_url = relative_url.split('../')[0].split('/').slice(0, -2).join('/') + '/'
  }
  reformed_url = protocol + '://' + reformed_url

  // 文件情况
  if (type === 'file') {
    document.title = show_name
    if (reformed_url.endsWith('/')) reformed_url = reformed_url.slice(0, -1)  // 历史遗留问题，确保文件结尾没有/
    formState.root_link = reformed_url
    let directory_url = reformed_url.slice(0, reformed_url.lastIndexOf("/") + 1)  // 目录的结尾必须是/
    if (file_list.value.length === 1) {  // 从地址栏进入时播放列表未知，补充获取播放列表
      get_directory_detail(directory_url)
    }

    const choose_menu_result = {   // 传递参数给父组件，用于处理自动播放
      "video_url": reformed_url,
      "play_list": file_list,
      "video_index": index
    }
    selectedKeys.value = [index]
    emit('choose_menu', choose_menu_result)
    return
  }

  // 目录情况
  formState.root_link = reformed_url
  get_directory_detail(reformed_url)
  selectedKeys.value = [index]
};


onMounted(() => {
  const route = useRoute();
  watch(() => route.query, (query) => {
    source_url.value = query.source_url;
    index.value = parseInt(query.index, 10);
    if (query.file_name) {
      file_name.value = query.file_name;
      choose_menu(index.value, query.file_name, query.source_url + query.file_name, 'file')
    } else {
      choose_menu(index.value, query.source_url, query.source_url, 'directory')
    }
  })
})

const concat_dir = (path, name, type) => {
  if (path.endsWith('/')) {
    return `${path}${name}${type === 'directory' ? '/' : ''}`
  } else {
    return `${path.substring(0, path.lastIndexOf('/'))}/${name}`
  }
}

</script>

<template>
  <a-layout-sider class="edit-sider" v-model:collapsed="collapsed" collapsible width="300px">
    <a-form layout="inline" :model="formState">
      <a-form-item style="padding-left: 6px;padding-top: 10px;padding-bottom: 4px">
        <a-input v-model:value="formState.root_link" placeholder="请输入地址" style="width: 200px;margin-right: 4px;"/>
        <a-button
            type="primary"
            html-type="submit"
            :disabled="formState.root_link === ''||!formState.root_link.endsWith('/')"
            @click="choose_menu(0, 'root', formState.root_link, '')"
            style="color: #f2f2f2"
        >
          确认
        </a-button>
      </a-form-item>
    </a-form>

    <div :style="{ overflow: 'auto', height: '100vh' }">
      <div v-for="(item,index) in file_list.length===0?[{}]:[]" :key="index"
           style="text-align: center;border-radius: 4px;padding: 30px 50px;margin: 20px 0;">
        <a-spin size="large" style="margin: auto"/>
      </div>
      <a-menu theme="dark" mode="inline" v-model:selectedKeys="selectedKeys"
              style="left: -4px;" v-if="!loading_file_flag.value"
      >
        <a-menu-item v-for="(item, index) in file_list" :key="index"
                     @click="choose_menu(index, item.show_name, concat_dir(formState.root_link , item.name ,item.type), item.type)">
          {{ item.show_name }}
        </a-menu-item>
      </a-menu>

    </div>

  </a-layout-sider>
</template>

<!--<style scoped>-->
<!--#components-layout-demo-side .logo {-->
<!--  height: 32px;-->
<!--  margin: 16px;-->
<!--  background: rgba(255, 255, 255, 0.3);-->
<!--}-->

<!--.site-layout .site-layout-background {-->
<!--  background: #fff;-->
<!--}-->

<!--[data-theme='dark'] .site-layout .site-layout-background {-->
<!--  background: #141414;-->
<!--}-->
<!--</style>-->

<script>
export default {
  setup() {

  }
};
</script>