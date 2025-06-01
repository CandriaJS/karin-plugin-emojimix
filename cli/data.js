import fs from 'node:fs/promises';
import axios from 'node-karin/axios';
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const filePath = fileURLToPath(import.meta.url).replace(/\\/g, '/')
const dirPath = path.resolve(filePath, '../../').replace(/\\/g, '/')
async function exists(path) {
  try {
    await fs.access(path);
    return true;
  } catch (err) {
    return false;
  }
}

async function main() {
  try {
    console.log('喵~ 正在读取元数据文件喵！'); 
    const metadata_original = dirPath  + '/metadata_original.json';
    if (!await exists(metadata_original)) {
      console.log('喵~ 未找到元数据文件喵！');
      const response = await axios.get('https://raw.githubusercontent.com/xsalazar/emoji-kitchen-backend/main/app/metadata.json');
      await fs.writeFile(metadata_original, JSON.stringify(response.data));
    }
    const data = JSON.parse(await fs.readFile(metadata_original, 'utf-8'));

    const new_data = [];

    for (const i in data.data) {
      if (data.data.hasOwnProperty(i)) {
        const combinations_dict = data.data[i].combinations;

        for (const a in combinations_dict) {
          if (combinations_dict.hasOwnProperty(a)) {
            const combination_list = combinations_dict[a];

            combination_list.forEach(item => {
              if (item.isLatest === true) {
                new_data.push({
                  leftEmojiCodepoint: item.leftEmojiCodepoint,
                  rightEmojiCodepoint: item.rightEmojiCodepoint,
                  date: item.date
                });
              }
            });
          }
        }
      }
    }

    console.log('喵~ 数据处理完成，正在保存到 metadata.json 文件喵！');
    await fs.writeFile(`${dirPath}/metadata.json`, JSON.stringify(new_data, null, 4), 'utf-8');

    console.log('喵~ 成功保存数据到 metadata.json 文件喵！');

  } catch (error) {
    console.error('喵~ 出错了喵！错误信息：', error);
  }
}

main();