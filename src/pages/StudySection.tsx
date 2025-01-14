import { NetworkStatus, gql, useQuery } from '@apollo/client'
import { Trans } from '@lingui/macro'
import classNames from 'classnames'
import { useRef, useState } from 'react'
import * as React from 'react'
import { useNavigate } from 'react-router'

import DeckCard, { deckCardFragment } from '../components/DeckCard'
import type { DeckCard_deck } from '../components/__generated__/DeckCard_deck'
import {
  AlertDialog,
  AlertDialogDescription,
  AlertDialogLabel,
} from '../components/views/AlertDialog'
import { Button } from '../components/views/Button'
import { CircularProgress } from '../components/views/CircularProgress'
import { Container } from '../components/views/Container'
import { Body1, Body2, Headline1 } from '../components/views/Typography'
import styles from './StudySection.module.css'
import type { DecksToStudy } from './__generated__/DecksToStudy'

const DECKS_TO_STUDY_QUERY = gql`
  query DecksToStudy {
    decks(studyOnly: true) {
      id
      ...DeckCard_deck
    }
  }

  ${deckCardFragment}
`

const StudySection: React.FunctionComponent = () => {
  const navigate = useNavigate()
  const { data, loading, error, refetch, networkStatus } =
    useQuery<DecksToStudy>(DECKS_TO_STUDY_QUERY, {
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
    })
  const [selectedDeck, setSelectedDeck] = useState<DeckCard_deck | null>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)

  const handleDeckSelect = (deck: { id: string }) => {
    setSelectedDeck(data!.decks.find(({ id }) => deck.id === id)!)
  }

  const handleStudyDeck = () => {
    navigate(`/study/${selectedDeck!.slug}`)
  }

  if (loading && networkStatus !== NetworkStatus.refetch) {
    return (
      <div className="py-4">
        <span className="text-txt text-opacity-text-primary">
          <Trans>Loading decks</Trans>
        </span>
      </div>
    )
  }

  if (error || networkStatus === NetworkStatus.refetch) {
    return (
      <Container className="mt-0 md:mt-8 flex flex-col justify-center items-center text-center py-4">
        <Body1 className="text-txt text-opacity-text-primary">
          <Trans>
            An error has occurred when trying to get your decks to study.
          </Trans>
        </Body1>
        <Body2 className="text-txt text-opacity-text-secondary mt-2">
          <Trans>Check your internet connection and try again.</Trans>
        </Body2>

        <Button
          className="mt-4"
          variation="primary"
          disabled={loading}
          onClick={() => refetch()}
        >
          {loading ? (
            <CircularProgress className="align-middle" size={16} />
          ) : (
            <Trans>Try again</Trans>
          )}
        </Button>
      </Container>
    )
  }

  const { decks } = data!

  return (
    <>
      {selectedDeck !== null && (
        <AlertDialog
          isOpen
          onDismiss={() => setSelectedDeck(null)}
          leastDestructiveRef={cancelRef}
        >
          <AlertDialogLabel>
            <Trans>Study deck</Trans>
          </AlertDialogLabel>
          <AlertDialogDescription>
            <Trans>
              Do you want to start a study session of the deck{' '}
              {selectedDeck.title}?
            </Trans>
          </AlertDialogDescription>
          <div className="flex justify-end">
            <Button
              ref={cancelRef}
              onClick={() => setSelectedDeck(null)}
              variation="secondary"
            >
              <Trans>Cancel</Trans>
            </Button>
            <Button className="ml-2" onClick={handleStudyDeck}>
              <Trans>Start Session</Trans>
            </Button>
          </div>
        </AlertDialog>
      )}
      <Headline1 className="mt-6 text-txt text-opacity-text-primary">
        <Trans>Study today</Trans>
      </Headline1>
      {decks.length > 0 ? (
        <div className="mt-6 mb-4">
          <div className={classNames(styles.grid, 'grid gap-4')}>
            {decks.map((deck) => (
              <DeckCard
                key={deck.id}
                deck={deck}
                onClick={handleDeckSelect}
                showStudySessionDetails
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6 flex">
          <Body1 className="text-base text-txt text-opacity-text-primary">
            <Trans>You've finished studying your decks for now.</Trans>
          </Body1>
        </div>
      )}
    </>
  )
}

export default StudySection
