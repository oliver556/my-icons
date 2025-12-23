const { defineConfig } = require('@vue/cli-service')
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
    name: 'My Icon',
    themeColor: '#409EFF',
    msTileColor: '#409EFF',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',
    manifestOptions: {
      name: 'My Icon 图标库',
      short_name: 'My Icon',
      description: '提供在线图标链接，用于个人NAS设备显示使用',
      start_url: './',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#409EFF',
      icons: [
        {
          src: './Myicon.svg',
          sizes: '192x192',
          type: 'image/svg+xml'
        },
        {
          src: './Myicon.svg',
          sizes: '512x512',
          type: 'image/svg+xml'
        }
      ]
    },
    iconPaths: {
      favicon32: "Myicon.svg",
      favicon16: "Myicon.svg",
      appleTouchIcon: "Myicon.svg",
      maskIcon: "Myicon.svg",
      msTileImage: "Myicon.svg",
    },
    // 配置 workbox
    workboxPluginMode: 'GenerateSW',
    workboxOptions: {
      // 跳过等待，立即激活新的 service worker
      skipWaiting: true,
      // 立即控制所有打开的页面
      clientsClaim: true,
      // 运行时缓存策略
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365 // 1年
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 30 // 30天
            }
          }
        },
        {
          urlPattern: /\.(?:js|css|html)$/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'static-resources',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 // 1天
            }
          }
        }
      ]
    }
  }
})
