import { gql, useQuery } from '@apollo/client'
import { Trans, plural } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { useCallback, useRef, useState } from 'react'
import * as React from 'react'
import { Helmet } from 'react-helmet-async'
import { useLocation, useNavigate, useParams } from 'react-router'
import { Link } from 'react-router-dom'

import BackButton from '../components/BackButton'
import InstallPublishedDeckButton from '../components/InstallPublishedDeckButton'
import PublishedNotesTable from '../components/PublishedNotesTable'
import { Container } from '../components/views/Container'
import {
  Body1,
  Body2,
  Caption,
  Headline1,
  Headline2,
  Headline3,
  Headline5,
} from '../components/views/Typography'
import { useLatestRefEffect } from '../hooks/useLatestRefEffect'
import { usePaginationParams } from '../hooks/usePaginationParams'
import { useTopBarLoading } from '../hooks/useTopBarLoading'
import type {
  PublishedDeckQuery,
  PublishedDeckQueryVariables,
} from './__generated__/PublishedDeckQuery'

export const PUBLISHED_DECK_QUERY = gql`
  query PublishedDeckQuery(
    $slug: String!
    $page: Int!
    $size: Int!
    $search: String
  ) {
    publishedDeck(slug: $slug) {
      id
      slug
      title
      description
      published
      totalNotes
      totalFlashcards
      isDeckInstalled
      owner {
        username
      }
      notes(page: $page, size: $size, search: $search) {
        totalCount
        edges {
          node {
            text
            id
            model {
              name
            }
            flashCards {
              id
              active
              status
              due
              template {
                name
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
        pageCursors {
          first {
            cursor
            page
            isCurrent
          }
          around {
            cursor
            page
            isCurrent
          }
          last {
            cursor
            page
            isCurrent
          }
          previous {
            cursor
            page
            isCurrent
          }
        }
      }
    }
  }
`

const PublishedDeckPage: React.FunctionComponent = () => {
  const { i18n } = useLingui()
  const { slug } = useParams() as { slug: string }
  const location = useLocation()
  const navigate = useNavigate()
  const { paginationParams, pageSize, onPaginationChange } =
    usePaginationParams()

  const [searchInputValue, setSearchInputValue] = useState(() => {
    const searchParams = new URLSearchParams(location.search)

    if (searchParams.has('search')) {
      return searchParams.get('search')
    }

    return ''
  })

  const [searchVariable, setSearchVariable] = useState(searchInputValue)

  const { data, loading, error } = useQuery<
    PublishedDeckQuery,
    PublishedDeckQueryVariables
  >(PUBLISHED_DECK_QUERY, {
    variables: { slug, search: searchVariable, ...paginationParams },
    fetchPolicy: 'cache-and-network',
  })

  const searchDebounceRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const handleSearchSubmit = useCallback(
    (search = searchInputValue, skipHistoryPush = false) => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current)
      }

      const searchParams = new URLSearchParams(location.search)

      searchParams.set('search', search)
      searchParams.set('page', '1')

      if (!skipHistoryPush) {
        navigate(location.pathname + '?' + searchParams.toString())
      }

      setSearchVariable(search)
    },
    [navigate, location.pathname, location.search, searchInputValue]
  )

  useLatestRefEffect(location.search, (latestLocationSearch) => {
    const searchParams = new URLSearchParams(latestLocationSearch)

    const search = searchParams.has('search') ? searchParams.get('search') : ''

    setSearchInputValue(search)
    handleSearchSubmit(search, true)
  })

  const handleSearchChange: React.ChangeEventHandler<HTMLInputElement> =
    useCallback(
      (evt) => {
        const search = evt.target.value
        setSearchInputValue(search)
        if (searchDebounceRef.current) {
          clearTimeout(searchDebounceRef.current)
        }

        searchDebounceRef.current = setTimeout(() => {
          handleSearchSubmit(search)
        }, 500)
      },
      [handleSearchSubmit]
    )

  useTopBarLoading(loading)

  if (!data && !error) {
    return null
  }
  if (data?.publishedDeck == null) {
    return (
      <div className="flex flex-col items-center justify-center p-4 sm:px-0">
        <Headline2 className="text-center sm:text-left text-txt text-opacity-text-primary">
          <Trans>Deck not found</Trans>
        </Headline2>
        <Link className="mt-8 sm:mt-4 text-primary" to="/marketplace">
          <Trans>Go to the Marketplace</Trans>
        </Link>
      </div>
    )
  }

  const deck = data.publishedDeck
  const publisherUsername = deck?.owner?.username

  return (
    <>
      <Helmet title={deck.title} />
      <Container className="py-4">
        <BackButton to="/marketplace" />

        <div className="flex flex-col mb-8">
          <div className="flex flex-col md:flex-row justify-between items-baseline">
            <Headline1 className="text-txt text-opacity-text-primary">
              <Trans>Deck details</Trans>
            </Headline1>

            <div className="flex items-center">
              <InstallPublishedDeckButton
                deckId={deck.id}
                isDeckInstalled={deck.isDeckInstalled}
              />
            </div>
          </div>
          <Headline2 className="mt-4 text-txt text-opacity-text-primary">
            {deck.title}
          </Headline2>
          <Headline5 className="mb-3 text-opacity-text-secondary">
            by {publisherUsername}
          </Headline5>
          {deck.description && (
            <Body1 className="mt-2 whitespace-pre-line text-txt text-opacity-text-primary">
              {deck.description}
            </Body1>
          )}{' '}
          <Body2 className="mt-4">
            {i18n._(
              plural(deck.totalNotes, { one: '# note', other: '# notes' })
            )}
            <span className="inline-block mx-1">&middot;</span>
            {i18n._(
              plural(deck.totalFlashcards, {
                one: '# flashcard',
                other: '# flashcards',
              })
            )}
          </Body2>
        </div>

        <Headline3 className="text-txt text-opacity-text-primary">
          <Trans>Notes</Trans>{' '}
          <Caption className="ml-1">
            <Trans>({deck.notes?.totalCount ?? 0} notes)</Trans>
          </Caption>
        </Headline3>

        <div className="mt-4 mb-8">
          <PublishedNotesTable
            totalDeckNotes={deck.totalNotes}
            notes={
              deck.notes ?? {
                __typename: 'NoteConnection',
                totalCount: 0,
                edges: [],
                pageInfo: {
                  __typename: 'PageInfo',
                  endCursor: null,
                  hasNextPage: false,
                },
                pageCursors: {
                  __typename: 'PageCursors',
                  last: null,
                  first: null,
                  around: [],
                  previous: null,
                },
              }
            }
            onPaginationChange={onPaginationChange}
            pageSize={pageSize}
            searchQuery={searchInputValue ?? ''}
            onSearchChange={handleSearchChange}
            onSearchSubmit={handleSearchSubmit}
          />
        </div>
      </Container>
    </>
  )
}

export default PublishedDeckPage
