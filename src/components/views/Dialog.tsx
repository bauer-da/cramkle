import type { DialogContentProps, DialogProps } from '@reach/dialog'
import {
  DialogContent as ReachDialogContent,
  DialogOverlay as ReachDialogOverlay,
} from '@reach/dialog'
import classnames from 'classnames'
import { forwardRef } from 'react'
import * as React from 'react'

type DialogTitleProps = React.HTMLAttributes<HTMLHeadingElement>

const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleProps>(
  function DialogTitle(props, ref) {
    return (
      <h2
        {...props}
        className={classnames(props.className, 'text-2xl mt-0 mb-4 normal')}
        ref={ref}
      />
    )
  }
)

const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  function DialogContent(props, ref) {
    return (
      <ReachDialogContent
        {...props}
        className={classnames(
          props.className,
          'bg-surface text-txt text-opacity-text-primary rounded shadow p-6 w-full max-w-xl md:max-w-3xl'
        )}
        ref={ref}
      />
    )
  }
)

const DialogOverlay: React.FC<DialogProps> = (props) => {
  return (
    <ReachDialogOverlay
      {...props}
      className={classnames(props.className, 'z-50 px-2 bg-dialog-overlay')}
    />
  )
}

const noop = () => {}

const Dialog = forwardRef<HTMLDivElement, DialogProps>(function Dialog(
  { isOpen, onDismiss = noop, initialFocusRef, allowPinchZoom, ...props },
  forwardedRef
) {
  return (
    <DialogOverlay
      initialFocusRef={initialFocusRef}
      allowPinchZoom={allowPinchZoom}
      isOpen={isOpen}
      onDismiss={onDismiss}
    >
      <DialogContent ref={forwardedRef} {...props} />
    </DialogOverlay>
  )
})

export { Dialog, DialogTitle, DialogContent, DialogOverlay }
