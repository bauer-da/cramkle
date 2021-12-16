import type { ContentState } from 'draft-js'
import * as React from 'react'

import { KeyboardIcon } from '../icons/KeyboardIcon'

interface TextInputSpanProps {
  contentState: ContentState
  entityKey: string
}

const TextInputSpan: React.FunctionComponent<TextInputSpanProps> = ({
  entityKey,
  contentState,
}) => {
  const data = contentState.getEntity(entityKey).getData()
  const fieldName = data.fieldName

  return (
    <span className="px-5 py-1 mb-2 h-10 justify-center items-center shadow-md rounded-full">
      {fieldName}
      <KeyboardIcon className="ml-1 text-primary inline-block" />
    </span>
  )
}

export default TextInputSpan
