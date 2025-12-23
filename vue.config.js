const { defineConfig } = require('@vue/cli-service')
import { VitePWA } from 'vite-plugin-pwa';

const pwaConfig = {
  strategies: 'generate',
  srcDir: 'src',
  filename: 'service-worker.js',
  injectRegister: true,
  registerType: 'autoUpdate',
  includeAssets: ['Myicon.svg', 'robots.txt', 'sitemap.xml'],
  manifest: {
    name: 'Icon Hub',
    short_name: 'IconHub',
    description: "个人 NAS 设备图标库",
    theme_color: '#ffffff',
    background_color: '#ffffff',
    display: 'standalone',
    scope: '/',
    start_url: '/',
    icons: [
      {
        "src": "icons/pwa-192x192.png",
        "sizes": "192x192",
        "type": "image/png"
      },
      {
        "src": "icons/pwa-512x512.png",
        "sizes": "512x512",
        "type": "image/png"
      }
    ]
  }
}
module.exports = defineConfig({
  //打包配置文件
  publicPath:  './',// 基本路径
  outputDir: "dist", // 输出文件目录
  assetsDir: "./assets", //放置生成的静态文件目录（js css img）
  productionSourceMap: false, // 生产环境是否生成 sourceMap 文件

  configureWebpack: {
    performance: {
      hints: "warning", // 警告 webpack 的性能提示
      maxEntrypointSize: 50000000, // 入口起点的最大体积
      maxAssetSize: 30000000, // 生成文件的最大体积
      // 只给出 js 文件的性能提示
      assetFilter: function (assetFilename) {
        return assetFilename.endsWith(".js");
      },
    },
  }, //修改favicon.ico
  pwa: {
    iconPaths: {
      favicon32: "Myicon.svg",
      favicon16: "Myicon.svg",
      appleTouchIcon: "Myicon.svg",
      maskIcon: "Myicon.svg",
      msTileImage: "Myicon.svg",
    },
  },
  plugin: [
    VitePWA(pwaConfig)
  ]
})
