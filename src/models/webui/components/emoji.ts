import { components } from 'node-karin'

import { Config } from '@/common'

export const emojiComponents = () => [
  components.accordion.create('access', {
    label: 'Emoji设置',
    children: [
      components.accordion.createItem('webui:access', {
        title: 'Emoji设置',
        subtitle: '用于设置Eemoji, 如是否开启emoji合成',
        children: [
          components.switch.create('enable', {
            label: 'emoji合成',
            description: '是否emoj合成功能',
            defaultSelected: Config.emoji.enable
          })
        ]
      })
    ]
  })
]
