import { Editor, EditorProps, EditorState, DraftHandleValue } from 'draft-js'
import React, { useEffect, useReducer, useCallback, useRef } from 'react'

import MentionsPopup from './MentionsPopup'
import searchMentions from './searchMentions'
import replaceMentionInEditorState from './replaceMentionInEditorState'
import { MentionableEntry } from '../../model/MentionableEntry'

interface Props extends EditorProps {
  mentionSource: MentionableEntry[]
  autoHighlight?: boolean
  autoUpdateHighlight?: boolean
}

interface State {
  mentionableEntries: MentionableEntry[]
  highlightedMentionable: MentionableEntry
  characterOffset: number
}

type Action =
  | { type: 'reset' }
  | ({ type: 'update' } & State)
  | { type: 'update_highlighted'; highlightedMentionable: MentionableEntry }

const initialState: State = {
  mentionableEntries: [],
  highlightedMentionable: null,
  characterOffset: 0,
}

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'update':
      return {
        highlightedMentionable: action.highlightedMentionable,
        mentionableEntries: action.mentionableEntries,
        characterOffset: action.characterOffset,
      }
    case 'update_highlighted':
      return { ...state, highlightedMentionable: action.highlightedMentionable }
    case 'reset':
      return initialState
    default:
      return state
  }
}

const MentionsEditor: React.FunctionComponent<Props> = ({
  mentionSource,
  editorState,
  autoHighlight = true,
  autoUpdateHighlight = true,
  onChange,
  onUpArrow,
  onDownArrow,
  onTab,
  onEscape,
  onBlur,
  handleReturn: handleContentReturn,
  ariaAutoComplete = 'list',
  ...props
}) => {
  const [
    { highlightedMentionable, mentionableEntries, characterOffset },
    dispatch,
  ] = useReducer(reducer, initialState)

  const prevEditorState = useRef(editorState)

  const onShowMentions = useCallback(
    (mentionables, offset) => {
      if (mentionables === null) {
        dispatch({ type: 'reset' })
        return
      }

      let highlighted = null

      if (!highlightedMentionable || autoHighlight) {
        if (autoUpdateHighlight) {
          highlighted = mentionables[0]
        } else {
          highlighted = highlightedMentionable
        }
      }

      dispatch({
        type: 'update',
        highlightedMentionable: highlighted,
        mentionableEntries: mentionables,
        characterOffset: offset,
      })
    },
    [autoHighlight, autoUpdateHighlight, highlightedMentionable]
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

    searchMentions(mentionSource, selection, contentState, onShowMentions)
  }, [editorState, mentionSource, onShowMentions])

  const handleEscape = (evt: React.KeyboardEvent) => {
    onEscape && onEscape(evt)

    if (mentionableEntries.length) {
      evt.stopPropagation()
      dispatch({ type: 'reset' })
    }
  }

  const handleMentionHighlight = useCallback((mention: MentionableEntry) => {
    dispatch({ type: 'update_highlighted', highlightedMentionable: mention })
  }, [])

  const handleUpArrow = (evt: React.KeyboardEvent) => {
    if (mentionableEntries.length) {
      evt.preventDefault()

      const length = mentionableEntries.length
      const selectedIndex = mentionableEntries.indexOf(highlightedMentionable)

      let highlighted = null

      if (!highlightedMentionable) {
        highlighted = mentionableEntries[length - 1]
      } else if (selectedIndex > 0) {
        highlighted = mentionableEntries[selectedIndex - 1]
      }

      handleMentionHighlight(highlighted)
    } else {
      onUpArrow && onUpArrow(evt)
    }
  }

  const handleDownArrow = (evt: React.KeyboardEvent) => {
    if (mentionableEntries.length) {
      evt.preventDefault()

      const length = mentionableEntries.length
      const selectedIndex = mentionableEntries.indexOf(highlightedMentionable)

      let highlighted = null

      if (!highlightedMentionable) {
        highlighted = mentionableEntries[0]
      } else if (selectedIndex < length - 1) {
        highlighted = mentionableEntries[selectedIndex + 1]
      }

      handleMentionHighlight(highlighted)
    } else {
      onDownArrow && onDownArrow(evt)
    }
  }

  const handleBlur = (evt: React.FocusEvent) => {
    dispatch({ type: 'reset' })
    onBlur && onBlur(evt)
  }

  const handleMentionSelect = useCallback(
    (mention: MentionableEntry) => {
      const editorWithMention = replaceMentionInEditorState(
        mention,
        editorState,
        characterOffset
      )

      onChange(editorWithMention)
      dispatch({ type: 'reset' })
    },
    [characterOffset, editorState, onChange]
  )

  const handleTab = (evt: React.KeyboardEvent) => {
    if (highlightedMentionable) {
      evt.preventDefault()
      handleMentionSelect(highlightedMentionable)
    } else {
      onTab && onTab(evt)
    }
  }

  const handleReturn = (
    evt: React.KeyboardEvent,
    editorState: EditorState
  ): DraftHandleValue => {
    if (highlightedMentionable) {
      handleMentionSelect(highlightedMentionable)
      return 'handled'
    } else if (handleContentReturn) {
      return handleContentReturn(evt, editorState)
    }
    return 'not-handled'
  }

  const showingMentions = !!(mentionableEntries && mentionableEntries.length)

  return (
    <>
      {
        // @ts-ignore role does not exist on Editor props yet
        <Editor
          {...props}
          ariaAutoComplete={ariaAutoComplete}
          ariaHasPopup={showingMentions}
          ariaExpanded={showingMentions}
          role="combobox"
          spellCheck
          editorState={editorState}
          onChange={onChange}
          onUpArrow={handleUpArrow}
          onDownArrow={handleDownArrow}
          onTab={handleTab}
          onEscape={handleEscape}
          onBlur={handleBlur}
          handleReturn={handleReturn}
        />
      }
      <MentionsPopup
        mentionableEntries={mentionableEntries}
        selection={editorState.getSelection()}
        onMentionSelect={handleMentionSelect}
        onMentionHighlight={handleMentionHighlight}
        characterOffset={characterOffset}
        highlightedMentionable={highlightedMentionable}
      />
    </>
  )
}

export default MentionsEditor