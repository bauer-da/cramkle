// import { DraftDecoratorComponentProps } from 'draft-js'
import type { ContentState } from 'draft-js'
import * as React from 'react'
// import type DraftDecoratorComponentProps from 'draft-js'

//  import DraftDecoratorComponentProps

interface FunctionSpanProps {
  children?: React.ReactNode
  contentState: ContentState
  entityKey: string
}

// const FunctionSpan: React.FunctionComponent = (props: FunctionSpanProps) => {
// const FunctionSpan: React.FunctionComponent = (
//   props: DraftDecoratorComponentProps
// ) => {

const FunctionSpan: React.FunctionComponent<FunctionSpanProps> = ({
  children,
  entityKey,
  contentState,
}) => {
  const data = contentState.getEntity(entityKey).getData()

  return (
    <span className="relative">
      -F-{children}-F- Functional component
      {JSON.stringify(data)}
      <div className="absolute top-0 left-0 right-0 bottom-0 bg-yellow-1 opacity-25" />
    </span>
  )
}

export default FunctionSpan
