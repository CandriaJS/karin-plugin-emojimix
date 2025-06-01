import { components } from 'node-karin'

import { Config } from '@/common'

export const emojiComponents = () => [
  components.accordion.create('emoji', {
    label: 'Emoji设置',
    children: [
      components.accordion.createItem('webui:emoji', {
        title: 'Emoji设置',
        subtitle: '用于设置Eemoji, 如是否开启emoji合成',
        children: [
          components.switch.create('enable', {
            label: 'emoji合成',
            description: '是否emoj合成功能',
            defaultSelected: Config.emoji.enable
          }),
          components.switch.create('cache', {
            label: '缓存',
            description: '是否开启缓存已合成过的emoji图片',
            defaultSelected: Config.emoji.cache
          }),
          components.input.create('proxy_url', {
            label: '代理镜像资源地址',
            description: '用于初始化资源下载',
            defaultValue: Config.emoji.proxy_url
          })
        ]
      })
    ]
  })
]
