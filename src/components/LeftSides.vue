<script setup>
import {reactive, ref, defineEmits} from "vue";
import {DoubleLeftOutlined, DoubleRightOutlined} from '@ant-design/icons-vue';
import axios from "axios";

const formState = reactive({
  root_link: '',
});
let file_list = ref([]);


const emit = defineEmits(['choose_menu'])
const choose_menu = (index, show_name, url, type) => {
  // 对url进行整形
  let protocol = url.split('://')[0]
  let items = url.split('://')[1].split('/')
  let final_url = ""
  for (let i = items.length - 1; i >= 0; i--) {
    if (items[i] === '..') {  // 处理 ../
      i--;
      continue;
    }
    if (items[i] === '') {  // 处理//
      continue;
    }
    final_url = items[i] + '/' + final_url
  }
  final_url = protocol + "://" + final_url
  url = final_url


  if (type === 'file') {
    document.title = show_name
    const choose_menu_result = {
      "video_url": url.slice(0, -1),
      "play_list": file_list,
      "video_index": index
    }
    emit('choose_menu', choose_menu_result)
    return
  }
  formState.root_link = url
  if (url.endsWith('/')) {
    axios.get(url).then(res => {
      let temp_file_list = res.data;
      axios.get(url + 'rule.js').then(js => {
        eval(js.data)
        temp_file_list.forEach(item => item.show_name = document.crop_name(item.name))
        temp_file_list = temp_file_list.filter(item => item.name !== 'rule.js')
        file_list.value = [{'name': '../', 'type': 'directory', 'show_name': '../'}, ...temp_file_list]
        // console.log(file_list.value)
      }).catch(() => {
        temp_file_list.forEach(item => item.show_name = item.name)
        file_list.value = [{'name': '../', 'type': 'directory', 'show_name': '../'}, ...temp_file_list]
      })
    }).catch(err => {
      console.error(err);
      // 处理错误
    });
  }
};


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

</style>

<script>
export default {
  setup() {

  }
};
</script>