import vuePlugin from 'rollup-plugin-vue';
import postcss from 'rollup-plugin-postcss';
export default {
  plugins: [
    vuePlugin(),
    postcss({
      extensions: ['.css', '.less'],
      extract: 'index.css',
    }),
  ],
  globals: {
    "Timeline": "Timeline"
  },
  input: 'src/index.js',
  output: {
    file: 'lib/index.umd.js',
    format: 'umd',
    name: 'vue-plugins',
  },
};
