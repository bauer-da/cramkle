// import type { SelectionState } from 'draft-js'
// import * as React from 'react'

// import Portal from '../Portal'
// import TypeaheadView from '../views/TypeaheadView'
// import TagSpan from './TagSpan'
// import FunctionSpan from './voice/VoiceSpan'
// // import type { TaggableFunctionEntry } from './TaggableEntry '
// import getSelectionRect from './getSelectionRect'
// import { findTagEntities, findFunctionEntities } from './strategies'
// import { TaggableFunctionEntry } from './TaggableEntry'

// export const decorators = [
//   // {
//   //   strategy: findTagEntities,
//   //   component: TagSpan,
//   // },
//   {
//     strategy: findFunctionEntities,
//     component: FunctionSpan,
//   },
// ]

// interface Props {
//   tagEntries: TaggableFunctionEntry[]
//   highlightedTag: TaggableFunctionEntry | null
//   onTagSelect: (tag: TaggableFunctionEntry) => void
//   onTagHighlight: (tag: TaggableFunctionEntry) => void
//   selection: SelectionState
//   offset?: number
//   characterOffset: number
// }

// const findRelativeParentElement = (
//   element: HTMLElement | null
// ): HTMLElement | null => {
//   if (element == null) {
//     return null
//   }

//   const position = window.getComputedStyle(element).getPropertyValue('position')
//   if (position !== 'static') {
//     return element
//   }

//   return findRelativeParentElement(element.parentElement)
// }

// const getStyleForSelectionRect = (
//   selectionRect: ClientRect | null,
//   offset: number
// ) => {
//   const parent = findRelativeParentElement(
//     document.getElementById('portal-anchor')
//   )

//   const relativeRect = {
//     scrollLeft: 0,
//     scrollTop: 0,
//     left: 0,
//     top: 0,
//   }

//   if (selectionRect && parent) {
//     relativeRect.scrollLeft = parent.scrollLeft
//     relativeRect.scrollTop = parent.scrollTop

//     const relativeParentRect = parent.getBoundingClientRect()
//     relativeRect.left = selectionRect.left - relativeParentRect.left
//     relativeRect.top = selectionRect.bottom - relativeParentRect.top
//   } else if (selectionRect) {
//     relativeRect.scrollTop =
//       window.pageYOffset || document.documentElement.scrollTop
//     relativeRect.scrollLeft =
//       window.pageXOffset || document.documentElement.scrollLeft

//     relativeRect.top = selectionRect.bottom
//     relativeRect.left = selectionRect.left
//   }

//   const left = relativeRect.left + relativeRect.scrollLeft + offset
//   const top = relativeRect.top + relativeRect.scrollTop + offset

//   return {
//     left,
//     top,
//   }
// }

// const FunctionsPopup: React.FunctionComponent<Props> = ({
//   onTagSelect,
//   onTagHighlight,
//   tagEntries,
//   highlightedTag,
//   offset = 5,
//   characterOffset,
//   selection,
// }) => {
//   const selectionRect = getSelectionRect(characterOffset)

//   const show =
//     selection.isCollapsed() && selection.getHasFocus() && tagEntries.length

//   if (!show) {
//     return null
//   }

//   const style = getStyleForSelectionRect(selectionRect, offset)

//   return (
//     <Portal>
//       <TypeaheadView
//         style={style}
//         highlightedEntry={highlightedTag}
//         entries={tagEntries}
//         // onSelect={(onTagSelect)}
//         onSelect={(tag) => {
//           console.log(`onSelect: ${tag.name}`)
//         }}
//         onHighlight={(onTagHighlight) => {
//           console.log(`onHighlight: ${onTagHighlight}`)
//         }}
//         // onHighlight={onTagHighlight}
//       />
//     </Portal>
//   )
// }

// export default FunctionsPopup
