/* scan_images.js (放在项目根目录) */
const fs = require('fs');
const path = require('path');

// ================= 配置区域 =================
// 1. 扫描目录: 这里指向 public/icon
const inputDir = path.join(__dirname, 'public/icon');

// 2. 输出文件: 这里指向 public/db.json
const outputFile = path.join(__dirname, 'public/db.json');
// ===========================================

function generateJson() {
  try {
    console.log(`🔍 正在扫描目录: ${inputDir}`);

    if (!fs.existsSync(inputDir)) {
      console.error(`❌ 错误: 找不到目录 ${inputDir}`);
      return;
    }

    const result = {};

    // 读取 icon 目录下的所有子项
    const items = fs.readdirSync(inputDir);

    // 遍历子项
    items.forEach(item => {
      const itemPath = path.join(inputDir, item);
      const stat = fs.statSync(itemPath);

      // 情况 A: 如果 item 是文件夹 (比如 Z_ALL)，则读取里面的图片
      if (stat.isDirectory()) {
        const files = fs.readdirSync(itemPath);
        const fileList = files
          .filter(f => !f.startsWith('.') && fs.statSync(path.join(itemPath, f)).isFile())
          .map(f => {
            const ext = path.extname(f);
            return {
              name: path.basename(f, ext),
              type: ext.replace('.', '')
            };
          });

        if (fileList.length > 0) {
          result[item] = fileList;
        }
      }
    });

    // 写入 public/db.json
    fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), 'utf-8');

    console.log(`✅ 成功! 数据已写入: ${outputFile}`);

  } catch (err) {
    console.error('❌ 发生错误:', err);
  }
}

generateJson();
