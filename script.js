const fs = require('fs');
const path = require('path');

// 生成导出文件
fs.readdir(path.join(__dirname, './src/components'), function (err, files) {
  if (err) {
    console.log('目录不存在');
    return;
  }
  let content = `// 批量引入组件❤\r\n`;
  let ex = [];
  // 处理导出代码
  files.forEach((item) => {
    // 读取目录名
    content += `import ${item} from './components/${item}/index.js';\r\n`;
    ex.push(item);
    // 单个注册组件
    const installText = `import ${item} from './src/index.vue';
${item}.install = function (Vue) {
  Vue.component(${item}.name, ${item});
};
export default ${item};\r\n`;
    fs.writeFile(path.join(__dirname, `./src/components/${item}/index.js`), installText, 'utf8', (err) => {
      if (err) throw err;
    });
  });

  content += `\r\nconst components = [${ex.join(', ')}];\r\n`;
  content += `\r\nconst install = function (Vue) {
  components.forEach((component) => {
    Vue.component(component.name, component);
  });
};
// 全部导出支持按需引入
export default {
  install, ${ex.join(`, `)}
};\r\n`;
  fs.writeFile(path.join(__dirname, './src/index.js'), content, 'utf8', (err) => {
    if (err) throw err;
  });
});
