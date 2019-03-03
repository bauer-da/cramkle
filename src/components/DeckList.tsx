import React, { useEffect } from 'react'
import { compose, graphql, ChildProps } from 'react-apollo'
import { Caption } from '@material/react-typography'
import { Grid, Row, Cell } from '@material/react-layout-grid'

import { IDeck } from '../types/Deck'
import Deck from './Deck'
import decksQuery from '../graphql/decksQuery.gql'
import loadingMutation from '../graphql/topBarLoadingMutation.gql'

interface Data {
  topBar: {
    loading: boolean
  }
  decks: IDeck[]
}

const DeckList: React.FunctionComponent<ChildProps<{}, Data>> = ({
  data: { loading, decks = [] },
  mutate,
}) => {
  useEffect(() => {
    mutate({ variables: { loading } })
  }, [loading])

  if (loading) {
    return null
  }

  if (decks.length === 0) {
    return <Caption>You haven&apos;t created any decks yet</Caption>
  }

  return (
    <Grid>
      <Caption>Decks</Caption>
      <Row>
        {decks.map(deck => (
          <Cell key={deck.id}>
            <Deck {...deck} />
          </Cell>
        ))}
      </Row>
    </Grid>
  )
}

export default compose(
  graphql<{}, Data>(decksQuery),
  graphql<{}, Data>(loadingMutation)
)(DeckList)