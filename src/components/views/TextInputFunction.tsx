import classnames from 'classnames'
import FastDiff from 'fast-diff'
import * as React from 'react'

import { Input } from './Input'

interface TextInputFunctionProps {
  value: string
  showDifference: boolean
}

const TextInputFunction: React.FunctionComponent<TextInputFunctionProps> = ({
  value,
  showDifference,
}) => {
  const [inputValue, setInputValue] = React.useState('')
  const diff = FastDiff(value, inputValue)

  if (showDifference) {
    return <Difference diff={diff} />
  }
  return (
    <Input
      placeholder="Type here"
      value={inputValue}
      onChange={(evt) => setInputValue(evt.target.value)}
    />
  )
}

interface DifferenceProps {
  diff: FastDiff.Diff[]
}

const Difference: React.FunctionComponent<DifferenceProps> = ({ diff }) => {
  const correctedWord = diff.map((element, index) => {
    return (
      <p
        key={index}
        className={classnames('inline ', {
          'bg-primary bg-opacity-25': element[0] === 0,
          'bg-red-1 bg-opacity-50 line-through': element[0] === 1,
          'bg-yellow-1 bg-opacity-50': element[0] === -1,
        })}
      >
        {element[1]}
      </p>
    )
  })
  return <div className="text-lg tracking-widest">{correctedWord}</div>
}

export default TextInputFunction
