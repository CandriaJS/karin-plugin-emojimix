import { DataTypes, Op, sequelize } from '@/models/db/base'
import type { dbType } from '@/types'
type Model = dbType['emoji']

export const table = sequelize.define('emoji', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  leftEmoji: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  rightEmoji: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  freezeTableName: true,
  defaultScope: {
    raw: true
  }
})

await table.sync()

/**
 * 添加emoji信息。
 *
 * @param leftEmoji 左边表情
 * @param rightEmoji 右边表情
 * @param date 时间戳
 * @returns 添加结果
 */

export async function add (
  leftEmoji: string,
  rightEmoji: string,
  date: number
): Promise<[Model, boolean | null]> {
  const data = {
    leftEmoji,
    rightEmoji,
    date
  }
  return await table.upsert(data) as [Model, boolean | null]
}

/**
 * 获取emoji信息
 * @param leftEmoji 左边emoji
 * @param rightEmoji 右边emoji
 * @returns 表情的信息
 */
export async function get (
  leftEmoji: string,
  rightEmoji: string
): Promise<Model | null> {
  return await table.findOne({
    where: {
      leftEmoji,
      rightEmoji
    }
  }) as Model | null
}

/**
 * 获取表情信息列表
 * @returns 表情信息列表
 */
export async function getAll (): Promise<Model[]> {
  return await table.findAll() as Model[]
}

/**
 * 清空所有表情信息
 */
export async function clear (): Promise<void> {
  await table.destroy({
    truncate: true
  })
  await sequelize.query('DELETE FROM sqlite_sequence WHERE name = "emoji"')
}
