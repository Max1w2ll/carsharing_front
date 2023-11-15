const path = require('path');
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: "/carsharing/",
  chainWebpack: config => {
    // Добавьте путь к вашему измененному файлу в resolve.alias
    config.resolve.alias.set('vue-simple-calendar', path.resolve(__dirname, 'src/components/vue-simple-calendar.umd.js'));
  }
});
