import { emojiComponents } from './emoji'
import { otherComponents } from './other'

export const components = async () => {
  const results = await Promise.all([
    emojiComponents(),
    otherComponents()
  ])

  return results.flat()
}

export {
  emojiComponents,
  otherComponents
}
