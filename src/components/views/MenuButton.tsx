import type {
  MenuButtonProps,
  MenuItemProps,
  MenuLinkProps,
  MenuListProps,
} from '@reach/menu-button'
import {
  Menu,
  MenuButton as ReachMenuButton,
  MenuItem as ReachMenuItem,
  MenuLink as ReachMenuLink,
  MenuList as ReachMenuList,
} from '@reach/menu-button'
import type * as Polymorphic from '@reach/utils/polymorphic'
import classnames from 'classnames'
import type { ReactNode } from 'react'
import { forwardRef } from 'react'
import * as React from 'react'
import type { LinkProps } from 'react-router-dom'
import { Link } from 'react-router-dom'

import styles from './MenuButton.module.css'

export const MenuButton: React.FC<
  MenuButtonProps & { icon?: boolean; className?: string }
> = ({ children, icon = false, className = '', ...props }) => {
  return (
    <ReachMenuButton
      {...props}
      className={classnames(
        className,
        'relative outline-reset bg-surface border-0 border-none rounded py-3 px-3 cursor-pointer overflow-hidden hover:bg-secondary hover:bg-opacity-secondary focus:bg-secondary focus:bg-opacity-secondary',
        {
          'rounded-full': icon,
        }
      )}
    >
      {children}
    </ReachMenuButton>
  )
}

export const MenuList: React.FC<
  MenuListProps & { className?: string; style?: React.CSSProperties }
> = ({ children, className = '', ...props }) => {
  return (
    <ReachMenuList
      {...props}
      className={classnames(
        className,
        'mt-1 py-0 border-2 border-divider border-opacity-divider rounded-xl shadow-lg bg-surface'
      )}
    >
      <div className="py-2 h-full rounded-xl">{children}</div>
    </ReachMenuList>
  )
}

export const MenuItem = forwardRef(function MenuItem(
  { children, icon, ...props },
  ref
) {
  return (
    <ReachMenuItem
      {...props}
      ref={ref}
      className={classnames(
        props.className,
        styles.menuItem,
        'relative flex items-center px-3 py-2 m-2 bg-surface text-on-surface rounded overflow-hidden'
      )}
    >
      {icon}
      <div className={classnames({ 'ml-3': icon })}>{children}</div>
      <div
        className={classnames(
          styles.menuItemBackdrop,
          'absolute bg-primary opacity-0 top-0 left-0 right-0 bottom-0'
        )}
      />
    </ReachMenuItem>
  )
}) as Polymorphic.ForwardRefComponent<
  'div',
  MenuItemProps & { icon?: ReactNode }
>

export const MenuLink: React.FC<MenuLinkProps & LinkProps> = ({
  children,
  ...props
}) => {
  return (
    <ReachMenuLink {...props} className={classnames(styles.menuItem)} as={Link}>
      {children}
    </ReachMenuLink>
  )
}

export { Menu }
