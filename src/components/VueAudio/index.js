import VueAudio from './src/index.vue';
VueAudio.install = function (Vue) {
  Vue.component(VueAudio.name, VueAudio);
};
export default VueAudio;
