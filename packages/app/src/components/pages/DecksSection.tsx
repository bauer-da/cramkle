import { t } from '@lingui/macro'
import { I18n } from '@lingui/react'
import Icon from '@material/react-material-icon'
import Fab from '@material/react-fab'
import classNames from 'classnames'
import React, { useState, useCallback } from 'react'

import DeckList from '../DeckList'
import AddDeckForm from '../forms/AddDeckForm'
import { useMobile } from '../MobileContext'

import styles from './DecksSection.css'

const DecksSection: React.FunctionComponent = () => {
  const [dialogOpen, setDialogOpen] = useState(false)

  const isMobile = useMobile()

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false)
  }, [])

  const handleDialogOpen = useCallback(() => {
    setDialogOpen(true)
  }, [])

  return (
    <>
      <DeckList />

      <AddDeckForm open={dialogOpen} onClose={handleDialogClose} />

      <div className={classNames(styles.fab, 'fixed')}>
        <I18n>
          {({ i18n }) => (
            <Fab
              icon={<Icon icon="add" aria-hidden="true" />}
              aria-label={i18n._(t`Add Deck`)}
              textLabel={!isMobile && i18n._(t`Add Deck`)}
              onClick={handleDialogOpen}
            />
          )}
        </I18n>
      </div>
    </>
  )
}

export default DecksSection
