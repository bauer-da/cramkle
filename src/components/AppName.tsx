import classnames from 'classnames'
import * as React from 'react'

export const AppName: React.FC<React.HTMLAttributes<HTMLSpanElement>> = (
  props
) => {
  return (
    <span
      {...props}
      className={classnames(
        props.className,
        'text-txt text-opacity-text-primary text-xl font-medium tracking-wide antialiased'
      )}
    >
      Vocabulapp
    </span>
  )
}
