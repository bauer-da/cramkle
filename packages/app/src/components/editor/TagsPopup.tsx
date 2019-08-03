import { SelectionState } from 'draft-js'
import React from 'react'

import TagSpan from './TagSpan'
import { findTagEntities } from './strategies'
import getSelectionRect from './getSelectionRect'
import Portal from '../Portal'
import TypeaheadView from '../views/TypeaheadView'
import { TaggableEntry } from './TaggableEntry'

export const decorators = [
  {
    strategy: findTagEntities,
    component: TagSpan,
  },
]

interface Props {
  tagEntries: TaggableEntry[]
  highlightedTag?: TaggableEntry
  onTagSelect: (tag: TaggableEntry) => void
  onTagHighlight: (tag: TaggableEntry) => void
  selection: SelectionState
  offset?: number
  characterOffset: number
}

const findRelativeParentElement = (
  element: HTMLElement
): HTMLElement | null => {
  if (!element) {
    return null
  }

  const position = window.getComputedStyle(element).getPropertyValue('position')
  if (position !== 'static') {
    return element
  }

  return findRelativeParentElement(element.parentElement)
}

const getStyleForSelectionRect = (
  selectionRect: ClientRect,
  offset: number
): object => {
  const parent = findRelativeParentElement(
    document.getElementById('portal-anchor')
  )

  const relativeRect = {
    scrollLeft: 0,
    scrollTop: 0,
    left: 0,
    top: 0,
  }

  if (parent) {
    relativeRect.scrollLeft = parent.scrollLeft
    relativeRect.scrollTop = parent.scrollTop

    const relativeParentRect = parent.getBoundingClientRect()
    relativeRect.left = selectionRect.left - relativeParentRect.left
    relativeRect.top = selectionRect.bottom - relativeParentRect.top
  } else {
    relativeRect.scrollTop =
      window.pageYOffset || document.documentElement.scrollTop
    relativeRect.scrollLeft =
      window.pageXOffset || document.documentElement.scrollLeft

    relativeRect.top = selectionRect.bottom
    relativeRect.left = selectionRect.left
  }

  const left = relativeRect.left + relativeRect.scrollLeft + offset
  const top = relativeRect.top + relativeRect.scrollTop + offset

  return {
    left,
    top,
  }
}

const TagsPopup: React.FunctionComponent<Props> = ({
  onTagSelect,
  onTagHighlight,
  tagEntries,
  highlightedTag,
  offset = 5,
  characterOffset,
  selection,
}) => {
  const selectionRect = getSelectionRect(characterOffset)

  const show =
    selection.isCollapsed() && selection.getHasFocus() && tagEntries.length

  if (!show) {
    return null
  }

  const style = getStyleForSelectionRect(selectionRect, offset)

  return (
    <Portal>
      <TypeaheadView
        style={style}
        highlightedEntry={highlightedTag}
        entries={tagEntries}
        onSelect={onTagSelect}
        onHighlight={onTagHighlight}
      />
    </Portal>
  )
}

export default TagsPopup