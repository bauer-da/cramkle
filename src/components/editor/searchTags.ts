import type { ContentState, SelectionState } from 'draft-js'

import type { TaggableEntry } from './TaggableEntry'

const SYMBOL_REGEX =
  '\\.,\\+\\*\\?\\$\\@\\|#{}\\(\\)\\^\\-\\[\\]\\\\/!%\'"~=<>_:;'
const AT_SIGN = ['@', '\\uff20'].join('')
const SLASH_SIGN = ['/', '\\u002f'].join('')
const NOT_AT_OR_SYMBOL = '[^' + AT_SIGN + SYMBOL_REGEX + '\\s]'
const END = '(?:\\.[ |$]| |[' + SYMBOL_REGEX + ']|)'

const TAG_REGEX = new RegExp(
  '(?:^|\\s|[(\\/])([' +
    AT_SIGN +
    ']((?:' +
    NOT_AT_OR_SYMBOL +
    END +
    '){0,20}))$'
)

const FUNCTION_TAG_REGEX = new RegExp(
  '(?:^|\\s|[(\\/])([' +
    SLASH_SIGN +
    ']((?:' +
    NOT_AT_OR_SYMBOL +
    END +
    '){0,20}))$'
)

export function searchFieldTags(
  source: TaggableEntry[],
  selection: SelectionState,
  contentState: ContentState,
  callback: (
    taggableEntries: TaggableEntry[] | null,
    characterOffset: number
  ) => void
) {
  const anchorKey = selection.getAnchorKey()
  const anchorOffset = selection.getAnchorOffset()
  const block = contentState.getBlockForKey(anchorKey)
  const text = block.getText().slice(0, anchorOffset)

  const match = TAG_REGEX.exec(text)

  matchTaggableEntries(source, match, callback)
}

export function searchFunctionTags(
  source: TaggableEntry[],
  selection: SelectionState,
  contentState: ContentState,
  callback: (
    taggableEntries: TaggableEntry[] | null,
    characterOffset: number
  ) => void
) {
  const anchorKey = selection.getAnchorKey()
  const anchorOffset = selection.getAnchorOffset()
  const block = contentState.getBlockForKey(anchorKey)
  const text = block.getText().slice(0, anchorOffset)

  const match = FUNCTION_TAG_REGEX.exec(text)

  matchTaggableEntries(source, match, callback)
}

function matchTaggableEntries(
  source: TaggableEntry[],
  match: RegExpExecArray | null,
  callback: (
    taggableEntries: TaggableEntry[] | null,
    characterOffset: number
  ) => void
) {
  if (match !== null) {
    const matchStr = match[2].toLowerCase()
    const offset = match[1].length

    const taggableEntries = source.filter(({ name }) =>
      name.toLowerCase().includes(matchStr)
    )

    taggableEntries.sort(
      (a, b) =>
        matchStr.indexOf(b.name.toLowerCase()) -
        matchStr.indexOf(a.name.toLowerCase())
    )

    callback(taggableEntries, offset)
  } else {
    callback(null, 0)
  }
}
