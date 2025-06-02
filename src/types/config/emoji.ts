export interface emojiType {
  /** 是否启用该功能 */
  enable: boolean
  /** 是否启用强制前缀，开启后强制使用[#柠糖emoji核合成]前缀触发 */
  prefix: boolean
  /** 是否开启缓存 */
  cache: boolean
  /** 代理镜像地址 */
  proxy_url: string
}
