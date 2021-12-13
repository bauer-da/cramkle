import classnames from 'classnames'
import type { DraftHandleValue, EditorProps, EditorState } from 'draft-js'
import { Editor, getDefaultKeyBinding } from 'draft-js'
import * as KeyCode from 'keycode-js'
import { useCallback, useEffect, useReducer, useRef } from 'react'
import * as React from 'react'

import { useBaseEditorControls } from './BaseEditorControls'
import { blockStyleFn } from './BlockStyleControls'
import styles from './TagEditor.module.css'
import type { TaggableEntry } from './TaggableEntry'
import TagsPopup from './TagsPopup'
// import FunctionsPopup from './FunctionsPopup'
import { TAG_TYPE } from './constants'
import {
  replaceFunctionInEditorState,
  replaceTagInEditorState,
} from './replaceTagInEditorState'
import { searchFieldTags, searchFunctionTags } from './searchTags'

interface Props
  extends Omit<
    EditorProps,
    | 'onChange'
    | 'editorState'
    | 'blockStyleFn'
    | 'keyBindingFn'
    | 'handleKeyCommand'
  > {
  fieldTagSource: TaggableEntry[]
  functionTagSource: TaggableEntry[]
  autoHighlight?: boolean
  autoUpdateHighlight?: boolean
}

interface TagTypeState {
  visibleTagEntries: TaggableEntry[]
  highlightedTag: TaggableEntry | null
  characterOffset: number
}
interface FunctionTagTypeState {
  visibleTagEntries: TaggableEntry[]
  highlightedTag: TaggableEntry | null
  characterOffset: number
}
interface State {
  fieldTags: TagTypeState
  functionTags: FunctionTagTypeState
}

type Action =
  | { type: 'reset' }
  | { type: 'reset_field_tags' }
  | { type: 'reset_function_tags' }
  | ({ type: 'update' } & State)
  | { type: 'update_tags_highlighted'; highlightedTag: TaggableEntry | null }
  | {
      type: 'update_functions_highlighted'
      highlightedTag: TaggableEntry | null
    }

const initialState: State = {
  fieldTags: {
    visibleTagEntries: [],
    highlightedTag: null,
    characterOffset: 0,
  },
  functionTags: {
    visibleTagEntries: [],
    highlightedTag: null,
    characterOffset: 0,
  },
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'update':
      return action
    case 'update_tags_highlighted':
      return {
        ...state,
        fieldTags: {
          ...state.fieldTags,
          highlightedTag: action.highlightedTag,
        },
      }
    case 'update_functions_highlighted':
      return {
        ...state,
        functionTags: {
          ...state.functionTags,
          highlightedTag: action.highlightedTag,
        },
      }
    case 'reset':
      return initialState
    case 'reset_field_tags':
      return {
        ...initialState,
        functionTags: state.functionTags,
      }
    case 'reset_function_tags':
      return {
        ...initialState,
        fieldTags: state.fieldTags,
      }
    default:
      return state
  }
}

const TagEditor: React.FunctionComponent<Props> = ({
  fieldTagSource,
  functionTagSource,
  autoHighlight = true,
  autoUpdateHighlight = true,
  onBlur,
  handleReturn: handleContentReturn,
  ariaAutoComplete = 'list',
  ...props
}) => {
  const baseContext = useBaseEditorControls()

  const {
    editorState,
    onChange,
    handleKeyCommand: baseHandleKeyCommand,
  } = baseContext

  const [{ fieldTags, functionTags }, dispatch] = useReducer(
    reducer,
    initialState
  )

  const prevEditorState = useRef(editorState)

  const onShowFieldTags = useCallback(
    (taggables, offset) => {
      if (taggables == null) {
        dispatch({ type: 'reset_field_tags' })
        return
      }

      let highlightedFieldTag = null

      if (!fieldTags.highlightedTag || autoHighlight) {
        if (autoUpdateHighlight) {
          highlightedFieldTag = taggables[0]
        } else {
          highlightedFieldTag = fieldTags.highlightedTag
        }
      }

      dispatch({
        type: 'update',
        fieldTags: {
          highlightedTag: highlightedFieldTag,
          visibleTagEntries: taggables,
          characterOffset: offset,
        },
        functionTags: { ...functionTags },
      })
    },
    [autoHighlight, autoUpdateHighlight, fieldTags.highlightedTag]
  )

  const onShowFunctionTags = useCallback(
    (taggables, offset) => {
      if (taggables == null) {
        dispatch({ type: 'reset_function_tags' })
        return
      }
      let highlighted = null

      if (!functionTags.highlightedTag || autoHighlight) {
        if (autoUpdateHighlight) {
          highlighted = taggables[0]
        } else {
          highlighted = functionTags.highlightedTag
        }
      }

      dispatch({
        type: 'update',
        fieldTags: { ...fieldTags },
        functionTags: {
          highlightedTag: highlighted,
          visibleTagEntries: taggables,
          characterOffset: offset,
        },
      })
    },
    [autoHighlight, autoUpdateHighlight, functionTags.highlightedTag]
  )

  useEffect(() => {
    if (prevEditorState.current === editorState) {
      return
    }

    prevEditorState.current = editorState

    const selection = editorState.getSelection()

    if (!selection.isCollapsed() || !selection.getHasFocus()) {
      return
    }

    const contentState = editorState.getCurrentContent()

    searchFieldTags(fieldTagSource, selection, contentState, onShowFieldTags)
    searchFunctionTags(
      functionTagSource,
      selection,
      contentState,
      onShowFunctionTags
    )
  }, [
    editorState,
    fieldTagSource,
    functionTagSource,
    onShowFieldTags,
    onShowFunctionTags,
  ])

  const handleFieldTagHighlight = useCallback((tag: TaggableEntry | null) => {
    dispatch({ type: 'update_tags_highlighted', highlightedTag: tag })
  }, [])

  const handleFunctionTagHighlight = useCallback(
    (tag: TaggableEntry | null) => {
      dispatch({ type: 'update_functions_highlighted', highlightedTag: tag })
    },
    []
  )

  const moveFieldSelectionUp = (tags: TagTypeState) => {
    if (!tags.visibleTagEntries.length) {
      return
    }

    const length = tags.visibleTagEntries.length
    const selectedIndex = tags.highlightedTag
      ? tags.visibleTagEntries.indexOf(tags.highlightedTag)
      : 0

    let highlighted = null

    if (selectedIndex > 0) {
      highlighted = tags.visibleTagEntries[selectedIndex - 1]
    } else {
      highlighted = tags.visibleTagEntries[length - 1]
    }

    if (fieldTags.highlightedTag) handleFieldTagHighlight(highlighted)
    if (functionTags.highlightedTag)
      handleFunctionTagHighlight(highlighted as TaggableEntry)
  }

  // const moveFunctionSelectionUp = (tags: TagTypeState) => {
  //   if (!tags.visibleTagEntries.length) {
  //     return
  //   }

  //   const length = tags.visibleTagEntries.length
  //   const selectedIndex = tags.highlightedTag
  //     ? tags.visibleTagEntries.indexOf(tags.highlightedTag)
  //     : 0

  //   let highlighted = null

  //   if (selectedIndex > 0) {
  //     highlighted = tags.visibleTagEntries[selectedIndex - 1]
  //   } else {
  //     highlighted = tags.visibleTagEntries[length - 1]
  //   }

  //   if (fieldTags.highlightedTag) handleFieldTagHighlight(highlighted)
  //   if (functionTags.highlightedTag)
  //     handleFunctionTagHighlight(highlighted as TaggableEntry)
  // }

  const moveSelectionDown = (tags: TagTypeState) => {
    if (!tags.visibleTagEntries.length) {
      return
    }

    const length = tags.visibleTagEntries.length
    const selectedIndex = tags.highlightedTag
      ? tags.visibleTagEntries.indexOf(tags.highlightedTag)
      : 0

    let highlighted = null

    if (selectedIndex < length - 1) {
      highlighted = tags.visibleTagEntries[selectedIndex + 1]
    } else {
      highlighted = tags.visibleTagEntries[0]
    }

    if (fieldTags.highlightedTag) handleFieldTagHighlight(highlighted)
    if (functionTags.highlightedTag)
      handleFunctionTagHighlight(highlighted as TaggableEntry)
  }

  const handleBlur = (evt: React.FocusEvent) => {
    dispatch({ type: 'reset' })
    onBlur?.(evt)
  }

  const handleFieldTagSelect = useCallback(
    (tag: TaggableEntry) => {
      const editorWithTags = replaceTagInEditorState(
        tag,
        editorState,
        fieldTags.characterOffset,
        TAG_TYPE.TAG
      )

      onChange(editorWithTags)
      dispatch({ type: 'reset' })
    },
    [fieldTags.characterOffset, editorState, onChange]
  )

  // Open popup on click and after that gather required data and then replace function editor

  const handleFunctionTagSelect = useCallback(
    (tag: TaggableEntry) => {
      const editorWithTags = replaceFunctionInEditorState(
        tag,
        editorState,
        functionTags.characterOffset,
        TAG_TYPE.FUNCTION
      )

      onChange(editorWithTags)
      dispatch({ type: 'reset' })
    },
    [functionTags.characterOffset, editorState, onChange]
  )

  const handleReturn = (
    evt: React.KeyboardEvent,
    editorState: EditorState
  ): DraftHandleValue => {
    if (fieldTags.highlightedTag) {
      handleFieldTagSelect(fieldTags.highlightedTag)
      return 'handled'
    } else if (functionTags.highlightedTag) {
      handleFunctionTagSelect(functionTags.highlightedTag)
      return 'handled'
    } else if (handleContentReturn) {
      return handleContentReturn(evt, editorState)
    }
    return 'not-handled'
  }

  const showingTags = !!fieldTags.visibleTagEntries?.length
  const showingFunctionTags = !!functionTags.visibleTagEntries?.length

  const keyBinder = (e: React.KeyboardEvent) => {
    if (showingTags || showingFunctionTags) {
      if (e.keyCode === KeyCode.KEY_TAB) {
        return 'handle-autocomplete'
      } else if (e.keyCode === KeyCode.KEY_ESCAPE) {
        return 'cancel-autocomplete'
      } else if (e.keyCode === KeyCode.KEY_UP) {
        return 'move-selection-up'
      } else if (e.keyCode === KeyCode.KEY_DOWN) {
        return 'move-selection-down'
      }
    }

    return getDefaultKeyBinding(e)
  }

  const handleKeyCommand = (
    command: string,
    editorState: EditorState,
    timestamp: number
  ): DraftHandleValue => {
    switch (command) {
      case 'handle-autocomplete':
        if (fieldTags.highlightedTag) {
          handleFieldTagSelect(fieldTags.highlightedTag)
        }
        if (functionTags.highlightedTag) {
          handleFunctionTagSelect(functionTags.highlightedTag)
        }
        return 'handled'
      case 'cancel-autocomplete':
        if (fieldTags.visibleTagEntries.length) {
          dispatch({ type: 'reset_field_tags' })
        }
        if (functionTags.visibleTagEntries.length) {
          dispatch({ type: 'reset_function_tags' })
        }
        return 'handled'
      case 'move-selection-up':
        if (fieldTags.highlightedTag) moveFieldSelectionUp(fieldTags)
        if (functionTags.highlightedTag) moveFieldSelectionUp(functionTags)
        return 'handled'
      case 'move-selection-down':
        if (fieldTags.highlightedTag) moveSelectionDown(fieldTags)
        if (functionTags.highlightedTag) moveSelectionDown(functionTags)
        return 'handled'
      default: {
        return (
          baseHandleKeyCommand?.(command, editorState, timestamp) ??
          'not-handled'
        )
      }
    }
  }

  const placeholder =
    editorState.getCurrentContent().getBlockMap().first().getType() !==
    'unstyled'
      ? undefined
      : props.placeholder

  return (
    <div className={classnames(styles.editor, 'bg-editor')}>
      {/* <p>{JSON.stringify(functionTags)}</p> */}
      <p>editorState: {JSON.stringify(editorState.getCurrentContent())}</p>

      <Editor
        {...props}
        placeholder={placeholder}
        ariaAutoComplete={ariaAutoComplete}
        ariaExpanded={showingTags}
        role="combobox"
        spellCheck
        editorState={editorState}
        onChange={onChange}
        onBlur={handleBlur}
        handleReturn={handleReturn}
        handleKeyCommand={handleKeyCommand}
        keyBindingFn={keyBinder}
        blockStyleFn={blockStyleFn}
        // blockRendererFn={}
      />

      <TagsPopup
        tagEntries={fieldTags.visibleTagEntries}
        selection={editorState.getSelection()}
        onTagSelect={handleFieldTagSelect}
        onTagHighlight={handleFieldTagHighlight}
        characterOffset={fieldTags.characterOffset}
        highlightedTag={fieldTags.highlightedTag}
      />
      {/* <FunctionsPopup
        tagEntries={functionTags.visibleTagEntries}
        selection={editorState.getSelection()}
        onTagSelect={handleFunctionTagSelect}
        onTagHighlight={handleFunctionTagHighlight}
        characterOffset={functionTags.characterOffset}
        highlightedTag={functionTags.highlightedTag}
      /> */}
      <TagsPopup
        tagEntries={functionTags.visibleTagEntries}
        selection={editorState.getSelection()}
        onTagSelect={handleFunctionTagSelect}
        onTagHighlight={handleFunctionTagHighlight}
        characterOffset={functionTags.characterOffset}
        highlightedTag={functionTags.highlightedTag}
      />
    </div>
  )
}

export default TagEditor
