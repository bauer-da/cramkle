import classnames from 'classnames'
import React, { ReactNode, useRef, useState } from 'react'
import { TabController, useControlledTabIndex } from 'react-tab-controller'

import useId from '../../hooks/useId'

export const List: React.FC<React.HTMLAttributes<HTMLUListElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <TabController>
      <ul {...props} className={classnames(className, 'flex flex-col p-0')}>
        {children}
      </ul>
    </TabController>
  )
}

interface ListItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  icon?: ReactNode
}

export const ListItem: React.FC<ListItemProps> = ({
  icon,
  children,
  className,
  ...props
}) => {
  const id = useId()
  const ref = useRef<HTMLLIElement>(null)

  const [hover, setHover] = useState(false)

  const { tabIndex, onKeyDown } = useControlledTabIndex(ref, id)

  const handleMouseEnter = () => {
    setHover(true)
  }

  const handleMouseLeave = () => {
    setHover(false)
  }

  return (
    <li
      {...props}
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={classnames(
        className,
        'relative group z-10 flex items-center px-3 py-2 my-2 outline-reset rounded overflow-hidden focus:text-action-primary hover:text-action-primary transition-colors ease-in-out duration-200 cursor-pointer'
      )}
      tabIndex={tabIndex}
      onKeyDown={onKeyDown}
    >
      <div
        className={classnames('flex-shrink-0', {
          'text-secondary': !hover,
          'text-action-primary': hover,
        })}
      >
        {icon}
      </div>
      <span
        className={classnames('inline-block select-none', {
          'ml-6': !!icon,
        })}
      >
        {children}
      </span>
      <div className="absolute -z-1 top-0 left-0 right-0 bottom-0 bg-primary opacity-0 group-hover:opacity-12 group-focus:opacity-12 transition-opacity ease-in-out duration-200" />
    </li>
  )
}
