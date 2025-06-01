import { emojiType } from '@/types/config/emoji'
import { otherType } from '@/types/config/other'

export interface ConfigType {
  /** emoji配置文件 */
  emoji: emojiType
  /** 其他配置文件 */
  other: otherType
}
