import emojiRegex from 'emoji-regex'
import karin, { logger, Message } from 'node-karin'

import { Version } from '@/root'

/**
 * 获取emoji的 Unicode的编码
 * @param emoji emoji
 * @returns emoji的 Unicode的编码
 */
function getEmojiCodepoint (emoji: string): string {
  const codePoints = Array.from(emoji).map(char => char.codePointAt(0)?.toString(16).toUpperCase().padStart(4, '0'))
  return codePoints.join('-')
}

export const emoji = karin.command(/([\p{Emoji}]+)\s*\+\s*([\p{Emoji}]+)/u, async (e: Message) => {
  try {
    const [_, emoji1, emoji2] = e.msg.match(emoji.reg)!
    console.log(emoji1, emoji2)

    // 获取 emoji 的编码
    const emoji1Codepoint = getEmojiCodepoint(emoji1)
    const emoji2Codepoint = getEmojiCodepoint(emoji2)

    console.log(`Emoji 1 Codepoint: ${emoji1Codepoint}`)
    console.log(`Emoji 2 Codepoint: ${emoji2Codepoint}`)
  } catch (error) {
    logger.error(error)
    await e.reply(`[${Version.Plugin_AliasName}]: emoji合成失败: ${(error as Error).message}`)
  }
}, {
  name: '柠糖emoji:emoji合成',
  priority: -Infinity,
  event: 'message',
  permission: 'all'
})
