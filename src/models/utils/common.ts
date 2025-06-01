import fs from 'fs/promises'
import { base64, exists, karinPathBase, logger } from 'node-karin'
import path from 'path'

import { Config } from '@/common'
import { db } from '@/models'
import { Version } from '@/root'
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

    const emojiDataArray = res.data.map((item: { leftEmojiCodepoint: string, rightEmojiCodepoint: string, date: number }) => ({
      leftEmoji: item.leftEmojiCodepoint,
      rightEmoji: item.rightEmojiCodepoint,
      date: item.date
    }))

    await add_emoji(emojiDataArray, 'bulk')
  } catch (error) {
    logger.error(error)
    throw new Error(`初始化emoji失败: ${(error as Error).message}`)
  }
}

/**
 * 添加emoji信息，支持单个和批量添加。
 *
 * @param data 表情数据，可以是单个对象或对象数组
 * @param type 添加类型，'common'为单个添加，'bulk'为批量添加，默认为'common'
 * @returns 添加结果
 */
export async function add_emoji (
  data: { leftEmoji: string, rightEmoji: string, date: number } | { leftEmoji: string, rightEmoji: string, date: number }[],
  type: 'common' | 'bulk' = 'common'
): Promise<[Model, boolean | null] | void> {
  if (type === 'bulk' && Array.isArray(data)) {
    return await db.emoji.add_bulk(data)
  } else if (type === 'common' && !Array.isArray(data)) {
    return await db.emoji.add(data.leftEmoji, data.rightEmoji, data.date)
  } else {
    throw new Error('参数类型与操作类型不匹配')
  }
}

/**
 * 获取emoji信息。
 * @param leftEmoji 左边emoji
 * @param rightEmoji 右边emoji
 * @returns emoji信息
 */
export async function get_emoji (
  leftEmoji: string,
  rightEmoji: string
): Promise<Model | null> {
  return await db.emoji.get(leftEmoji, rightEmoji)
}

/**
 * 生成emoji图片
 * @param leftEmoji 左边emoji
 * @param rightEmoji 右边emoji
 * @param date 时间戳
 * @returns 返回生成的emoji图片的Base64编码
 */
export async function make_emoji (leftEmoji: string, rightEmoji: string, date: number): Promise<string> {
  try {
    if (!leftEmoji || !rightEmoji || !date) {
      throw new Error('左边表情或右边表情或日期不能为空')
    }
    const cachePath = path.join(karinPathBase, Version.Plugin_Name, 'data', 'emoji')
    const cacheFile = path.join(cachePath, `${leftEmoji}-${rightEmoji}-${date}.png`)
    if (Config.emoji.cache && await exists(cacheFile)) {
      return base64(cacheFile)
    }
    const url = `https://www.gstatic.com/android/keyboard/emojikitchen/${date}/u${leftEmoji}/u${leftEmoji}_u${rightEmoji}.png`
    const res = await Request.get(url, null, null, 'arraybuffer')
    if (Config.emoji.cache) {
      await fs.mkdir(cachePath, { recursive: true })
      await fs.writeFile(cacheFile, res.data)
      return await base64(cacheFile)
    }
    return await base64(res.data)
  } catch (error) {
    logger.error(error)
    throw new Error(`生成emoji失败: ${(error as Error).message}`)
  }
}
