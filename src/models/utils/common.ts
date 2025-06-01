import { logger } from 'node-karin'

import { Config } from '@/common'
import { db } from '@/models'
import { dbType } from '@/types'

import Request from './request'

type Model = dbType['emoji']

/**
 * 异步判断是否在海外环境
 * @returns 如果在海外环境返回 true，否则返回 false
 * @throws 如果获取 IP 位置失败，则抛出异常
 */
export const isAbroad = async (): Promise<boolean> => {
  const urls = [
    'https://blog.cloudflare.com/cdn-cgi/trace',
    'https://developers.cloudflare.com/cdn-cgi/trace',
    'https://hostinger.com/cdn-cgi/trace',
    'https://ahrefs.com/cdn-cgi/trace'
  ]

  try {
    const responses = await Promise.all(
      urls.map((url) => Request.get(url, null, null, 'text'))
    )
    const traceTexts = responses.map((res) => res.data).filter(Boolean)
    const traceLines = traceTexts
      .flatMap((text: string) =>
        text.split('\n').filter((line: string) => line)
      )
      .map((line) => line.split('='))

    const traceMap = Object.fromEntries(traceLines)
    return traceMap.loc !== 'CN'
  } catch (error) {
    throw new Error(`获取 IP 所在地区出错: ${(error as Error).message}`)
  }
}

export async function init () {
  try {
    const resources_url = 'https://raw.githubusercontent.com/CandriaJS/karin-plugin-emojimix/main/metadata.json'
    const base_url = await isAbroad() ? resources_url : `https://gh-proxy.com/${resources_url}`
    const url = Config.emoji.proxy_url?.trim()
      ? `${Config.emoji.proxy_url.replace(/\/+$/, '')}/${resources_url}`
      : base_url
    const res = await Request.get(url, null, null, 'json')
    await Promise.all(
      res.data.map(async (item: { leftEmojiCodepoint: string, rightEmojiCodepoint: string, date: number }) => {
        await add_emoji(item.leftEmojiCodepoint, item.rightEmojiCodepoint, item.date)
      })
    )
  } catch (error) {
    logger.error(error)
    throw new Error(`初始化emoji失败: ${(error as Error).message}`)
  }
}

/**
 * 添加emoji信息。
 *
 * @param leftEmoji 左边表情
 * @param rightEmoji 右边表情
 * @param date 时间戳
 * @returns 添加结果
 */
export async function add_emoji (
  leftEmoji: string,
  rightEmoji: string,
  date: number
): Promise<[Model, boolean | null]> {
  return await db.emoji.add(leftEmoji, rightEmoji, date)
}
