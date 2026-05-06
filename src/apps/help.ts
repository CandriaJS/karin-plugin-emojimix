import { Render } from '@/common'
import { Version } from '@/root'
import type { HelpGroup } from '@puniyu/component'
import karin, { Message, segment } from 'node-karin'
import fs from 'node:fs'

export const help = karin.command(
  /^#?(?:柠糖emoji)(?:命令|帮助|菜单|help|说明|功能|指令|使用说明)$/i,
  async (e: Message) => {
    const emojiIcon = await fs.promises.readFile(
      `${Version.Plugin_Path}/resources/icons/emoji.svg`,
    )
    const List: HelpGroup = {
      name: '常用操作',
      list: [{ name: '[emoji1]+[emmji2]', desc: 'emoji合成', icon: emojiIcon }],
    }

    const helpList: HelpGroup[] = [List]

    if (e.isMaster) {
      const updateIcon = await fs.promises.readFile(
        `${Version.Plugin_Path}/resources/icons/update.svg`,
      )
      helpList.push({
        name: '管理命令',
        list: [
          {
            name: '#柠糖emoji(插件)更新',
            desc: '更新插件本体',
            icon: updateIcon,
          },
          {
            name: '#柠糖emoji更新emoji数据',
            desc: '更新emoji数据',
            icon: updateIcon,
          },
        ],
      })
    }
    const bg = await fs.promises.readFile(
      `${Version.Plugin_Path}/resources/background.webp`,
    )
    const img = await Render.help({
      title: '柠糖emoji帮助',
      groups: helpList,
      theme: {
        background: { type: 'Image', field0: bg },
      },
    })
    await e.reply(segment.image(`base64://${img.toString('base64')}`))
    return true
  },
  {
    name: '柠糖emoji:帮助',
    priority: -Infinity,
    event: 'message',
    permission: 'all',
  },
)
