import { db } from '@/models'
type Model = db.base.Model

export interface emojiType extends Model {
  /** 主键id */
  id: number
  /** 左边表情 */
  leftEmoji: string
  /** 右边表情 */
  rightEmoji: string
  /** 日期时间戳 */
  date: number
}
