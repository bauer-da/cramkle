import type { ContentBlock, ContentState } from 'draft-js'

import { TAG_TYPE } from './constants'

type Callback = (s: number, e: number) => void

export const findTagEntities = (
  contentBlock: ContentBlock,
  callback: Callback,
  contentState: ContentState
) => {
  contentBlock.findEntityRanges((character) => {
    const entityKey = character.getEntity()
    return (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === TAG_TYPE.TAG
    )
  }, callback)
}

export const findFunctionEntities = (
  contentBlock: ContentBlock,
  callback: Callback,
  contentState: ContentState
) => {
  contentBlock.findEntityRanges((character) => {
    const entityKey = character.getEntity()
    return (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === TAG_TYPE.FUNCTION
    )
    // return 'Text'
  }, callback)
  // const HANDLE_REGEX = /\#[\w\u0590-\u05ff]+/g

  // findWithRegex(HANDLE_REGEX, contentBlock, callback)
}

// function findWithRegex(
//   regex: RegExp,
//   contentBlock: ContentBlock,
//   callback: Callback
// ) {
//   const text = contentBlock.getText()
//   let matchArr, start
//   while ((matchArr = regex.exec(text)) !== null) {
//     start = matchArr.index
//     console.log(`Regex match: ${matchArr[0]}`)
//     callback(start, start + matchArr[0].length)
//   }
// }
