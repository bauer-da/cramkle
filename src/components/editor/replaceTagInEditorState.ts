import type { ContentState, SelectionState } from 'draft-js'
import { EditorState, Modifier } from 'draft-js'

import type { TaggableEntry, TaggableFunctionEntry } from './TaggableEntry'
import type { TAG_TYPE } from './constants'

const createTagEntity = (
  taggable: TaggableEntry,
  contentState: ContentState,
  tagType: TAG_TYPE
) => {
  console.log('Creating tag entity', taggable)
  return contentState.createEntity(tagType, 'IMMUTABLE', {
    id: taggable.id,
  })
}
const createFunctionEntity = (
  taggable: TaggableFunctionEntry,
  contentState: ContentState,
  tagType: TAG_TYPE
) => {
  const finalTaggableFunctionEntity = contentState.createEntity(
    tagType,
    'IMMUTABLE',
    {
      id: taggable.id,
      other: taggable.other,
    }
  )
  console.log('Creating function entity', finalTaggableFunctionEntity)
  return finalTaggableFunctionEntity
}

export function replaceTagInEditorState(
  taggable: TaggableEntry,
  editorState: EditorState,
  offset: number,
  tagType: TAG_TYPE
): EditorState {
  const selection = editorState.getSelection()
  const contentState = editorState.getCurrentContent()

  const anchorOffset = selection.getAnchorOffset()

  const begin = anchorOffset - offset
  const end = anchorOffset

  const textToShow = taggable.name
  const tagTextSelection = selection.merge({
    anchorOffset: begin,
    focusOffset: end,
  }) as SelectionState

  const contentStateWithEntity = createTagEntity(
    taggable,
    contentState,
    tagType
  )

  const entityKey = contentStateWithEntity.getLastCreatedEntityKey()

  const contentStateWithTag = Modifier.replaceText(
    contentStateWithEntity,
    tagTextSelection,
    textToShow,
    editorState.getCurrentInlineStyle(),
    entityKey
  )

  return EditorState.push(editorState, contentStateWithTag, 'insert-fragment')
}

export function replaceFunctionInEditorState(
  taggable: TaggableFunctionEntry,
  editorState: EditorState,
  offset: number,
  tagType: TAG_TYPE
): EditorState {
  const selection = editorState.getSelection()
  const contentState = editorState.getCurrentContent()

  const anchorOffset = selection.getAnchorOffset()

  const begin = anchorOffset - offset
  const end = anchorOffset

  const textToShow = taggable.name
  const tagTextSelection = selection.merge({
    anchorOffset: begin,
    focusOffset: end,
  }) as SelectionState

  const contentStateWithEntity = createFunctionEntity(
    taggable,
    contentState,
    tagType
  )

  const entityKey = contentStateWithEntity.getLastCreatedEntityKey()

  const contentStateWithTag = Modifier.replaceText(
    contentStateWithEntity,
    tagTextSelection,
    textToShow,
    editorState.getCurrentInlineStyle(),
    entityKey
  )

  return EditorState.push(editorState, contentStateWithTag, 'insert-fragment')
}
