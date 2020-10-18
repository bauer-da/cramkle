import classNames from 'classnames'
import React, { forwardRef } from 'react'

export interface TypographyProps<TElement extends HTMLElement>
  extends React.HTMLAttributes<TElement> {
  children?: React.ReactNode
  className?: string
}

function typography(Tag: keyof React.ReactHTML, baseClasses: string) {
  const Typography = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
    function Typography({ children, className = '', ...otherProps }, ref) {
      const classes = classNames(className, baseClasses)

      return (
        // @ts-ignore
        <Tag {...otherProps} className={classes} ref={ref}>
          {children}
        </Tag>
      )
    }
  )

  return Typography
}

export const Headline1 = typography('h1', 'text-3xl leading-normal font-medium')

export const Headline2 = typography('h2', 'text-2xl leading-normal font-medium')

export const Headline3 = typography('h3', 'text-xl leading-normal font-medium')

export const Headline4 = typography('h4', 'text-lg leading-normal font-medium')

export const Headline5 = typography(
  'h5',
  'text-base leading-normal font-medium'
)

export const Headline6 = typography('h6', 'text-sm leading-normal font-medium')

export const Body1 = typography('p', 'text-base')

export const Body2 = typography('p', 'text-secondary text-sm')

export const Caption = typography('span', 'text-secondary text-xs')

export const Overline = typography(
  'span',
  'text-xs uppercase tracking-widest font-medium'
)

export const Subtitle1 = typography('h6', 'font-normal')

export const Subtitle2 = typography('h6', 'text-sm font-medium')
