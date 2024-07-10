<script setup>
import {reactive, ref, defineEmits, onMounted, watch} from "vue";
import {DoubleLeftOutlined, DoubleRightOutlined} from '@ant-design/icons-vue';
import axios from "axios";
import {useRoute} from "vue-router";

const formState = reactive({
  root_link: '',
});
let file_list = ref([]);

const rename_file_by_rule = (directory_url) => {
  return axios.get(directory_url + 'rule.js')
      .then(response => {
        console.log(directory_url + 'rule.js存在');
        eval(response.data); // 直接执行 rule.js 文件内容
      })
      .catch(error => {
        console.log(directory_url + 'rule.js不存在或加载失败');
        document.crop_name = (name) => name; // 默认的函数
      });
};

const get_directory_detail = (url) => {
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
            file_list.value = [{'name': '../', 'type': 'directory', 'show_name': '../'}, ...return_file_list]
          });

    }).catch(err => {
      console.error(err);
      // 处理错误
    });
  }
}

const emit = defineEmits(['choose_menu'])
const choose_menu = (index, show_name, url, type) => {
  // todo 对url进行整形
  let [protocal, relative_url] = url.split('://')
  let reformed_url = relative_url
  if (relative_url.indexOf("../") !== -1) {
    reformed_url = relative_url.split('../')[0].split('/').slice(0, -2).join('/') + '/'
  }
  reformed_url = protocal + '://' + reformed_url

  // 文件情况
  if (type === 'file') {
    document.title = show_name
    if (reformed_url.endsWith('/')) reformed_url = reformed_url.slice(0, -1)  // 历史遗留问题，确保文件结尾没有/
    formState.root_link = reformed_url
    let directory_url = reformed_url.slice(0, reformed_url.lastIndexOf("/") + 1)  // 目录的结尾必须是/
    if (file_list.value.length === 0) {  // 从地址栏进入时播放列表未知，补充获取播放列表
      get_directory_detail(directory_url)
    }

    const choose_menu_result = {   // 传递参数给父组件，用于处理自动播放
      "video_url": reformed_url,
      "play_list": file_list,
      "video_index": index
    }
    emit('choose_menu', choose_menu_result)
    return
  }

  // 目录情况
  formState.root_link = reformed_url
  get_directory_detail(reformed_url)
};


let source_url = ref('')
let file_name = ref('')
let index = ref(0)
onMounted(() => {
  const route = useRoute();
  watch(() => route.query, (query) => {
    source_url.value = query.source_url;
    index.value = parseInt(query.index, 10);
    if (query.file_name) {
      file_name.value = query.file_name;
      choose_menu(index.value, query.file_name, query.source_url + query.file_name, 'file')
    } else  {
      choose_menu(index.value, query.source_url, query.source_url, 'directory')
    }
  })
})


</script>

<template>
  <a-layout-sider class="edit-sider" v-model:collapsed="collapsed" collapsible>
    <a-form layout="inline" :model="formState">
      <a-form-item style="padding-left: 6px;padding-top: 10px;">
        <a-input v-model:value="formState.root_link" placeholder="请输入地址" style="width: 120px;margin-right: 4px;"/>
        <a-button
            type="primary"
            html-type="submit"
            :disabled="formState.root_link === ''"
            @click="choose_menu(0, 'root', formState.root_link, '')"
            style="color: #f2f2f2"
        >
          确认
        </a-button>
      </a-form-item>
    </a-form>

    <div>
      <a-menu theme="dark" mode="inline"
              style="text-align: center;position: relative;left: -4px;">
        <a-menu-item v-for="(item, index) in file_list" :key="index"
                     @click="choose_menu(index, item.show_name, formState.root_link + item.name + '/', item.type)"
                     style="color: #f2f2f2">
          {{ item.show_name }}
        </a-menu-item>
      </a-menu>

      <div>
        <DoubleLeftOutlined style="color: #f2f2f2;float: left;padding-left: 18px;font-size: medium;"/>
        <DoubleRightOutlined style="color: #f2f2f2;float: right;padding-right: 18px;font-size: medium;"/>
      </div>
    </div>

  </a-layout-sider>
</template>

<style scoped>
#components-layout-demo-side .logo {
  height: 32px;
  margin: 16px;
  background: rgba(255, 255, 255, 0.3);
}

.site-layout .site-layout-background {
  background: #fff;
}
[data-theme='dark'] .site-layout .site-layout-background {
  background: #141414;
}
</style>

<script>
export default {
  setup() {

  }
};
</script>