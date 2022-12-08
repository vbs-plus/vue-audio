// 批量引入组件❤
import VueAudio from './components/VueAudio/index.js';

const components = [VueAudio];

const install = function (Vue) {
  components.forEach((component) => {
    Vue.component(component.name, component);
  });
};
// 全部导出支持按需引入
export default {
  install, VueAudio
};
