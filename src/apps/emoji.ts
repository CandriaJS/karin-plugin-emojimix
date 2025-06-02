import emojiRegex from 'emoji-regex'
import karin, { logger, Message, segment } from 'node-karin'

import { Config } from '@/common'
import { utils } from '@/models'
import { Version } from '@/root'

const createRegex = () => {
  const regex = emojiRegex()
  const prefix = '#?柠糖emoji合成' + (Config.emoji.prefix ? '' : '?')
  const pattern = `(?:${prefix}\\s*)?\\s*(${regex.source})\\s*\\+\\s*(${regex.source})`
  return new RegExp(pattern)
}

/**
 * 获取emoji的 Unicode的编码
 * @param emoji emoji
 * @returns emoji的 Unicode的编码
 */
function getEmojiCodepoint (emoji: string): string {
  return emoji.codePointAt(0)?.toString(16) as string
}

export const emoji = karin.command(createRegex(), async (e: Message) => {
  try {
    if (!Config.emoji.enable) return false
    const [_, emoji1, emoji2] = e.msg.match(emoji.reg)!
    const emoji1Codepoint = getEmojiCodepoint(emoji1)
    const emoji2Codepoint = getEmojiCodepoint(emoji2)
    const info = await utils.get_emoji(emoji1Codepoint, emoji2Codepoint)
    if (!info) {
      await e.reply('暂不支持该emoji合成')
      return
    }
    const emojiImage = await utils.make_emoji(info.leftEmoji, info.rightEmoji, info.date)
    return await e.reply(segment.image(`base64://${emojiImage}`))
  } catch (error) {
    logger.error(error)
    await e.reply(`[${Version.Plugin_AliasName}]: emoji生成失败: ${(error as Error).message}`)
  }
}, {
  name: '柠糖emoji:emoji合成',
  priority: -Infinity,
  event: 'message',
  permission: 'all'
})
