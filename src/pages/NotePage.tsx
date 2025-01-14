import { gql, useMutation, useQuery } from '@apollo/client'
import { Trans, t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import type { ContentState, RawDraftContentState } from 'draft-js'
import { convertToRaw } from 'draft-js'
import { useCallback, useState } from 'react'
import * as React from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams } from 'react-router'

import BackButton from '../components/BackButton'
import FieldValueEditor from '../components/FieldValueEditor'
import FlashCardRenderer from '../components/FlashCardRenderer'
import FlashCardStatus from '../components/FlashCardStatus'
import PersistedEditor from '../components/editor/PersistedEditor'
import { Button } from '../components/views/Button'
import { Card } from '../components/views/Card'
import { Checkbox } from '../components/views/Checkbox'
import { Container } from '../components/views/Container'
import { Dialog } from '../components/views/Dialog'
import { Divider } from '../components/views/Divider'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '../components/views/Table'
import { Caption, Headline1, Headline2 } from '../components/views/Typography'
import { useTopBarLoading } from '../hooks/useTopBarLoading'
import type {
  NoteQuery,
  NoteQueryVariables,
  NoteQuery_note_flashCards,
  NoteQuery_note_values,
} from './__generated__/NoteQuery'
import type {
  UpdateFieldValue,
  UpdateFieldValueVariables,
} from './__generated__/UpdateFieldValue'

const DRAFT_CONTENT_FRAGMENT = gql`
  fragment DraftContent on ContentState {
    id
    blocks {
      key
      type
      text
      depth
      inlineStyleRanges {
        style
        offset
        length
      }
      entityRanges {
        key
        length
        offset
      }
      data
    }
    entityMap
  }
`

const NOTE_QUERY = gql`
  ${DRAFT_CONTENT_FRAGMENT}

  query NoteQuery($noteId: ID!) {
    note(id: $noteId) {
      id
      text
      deck {
        title
      }
      model {
        primaryField {
          id
        }
      }
      values {
        id
        data {
          ...DraftContent
        }
        field {
          id
          name
        }
      }
      flashCards {
        id
        active
        lapses
        due
        status
        template {
          name
          frontSide {
            ...DraftContent
          }
          backSide {
            ...DraftContent
          }
        }
      }
    }
  }
`

const UPDATE_FIELD_VALUE_MUTATION = gql`
  ${DRAFT_CONTENT_FRAGMENT}

  mutation UpdateFieldValue(
    $noteId: ID!
    $fieldId: ID!
    $data: ContentStateInput!
  ) {
    updateFieldValue(
      input: { noteId: $noteId, fieldId: $fieldId, data: $data }
    ) {
      fieldValue {
        id
        data {
          ...DraftContent
        }
      }
    }
  }
`

const FIELD_VALUE_CHANGE_DEBOUNCE = 1000 /* ms */

interface FieldValueDetailProps {
  noteId: string
  fieldValue: NoteQuery_note_values
}

const FieldValueDetail: React.FC<FieldValueDetailProps> = ({
  noteId,
  fieldValue,
}) => {
  const [updateFieldValueMutation, { loading, error }] = useMutation<
    UpdateFieldValue,
    UpdateFieldValueVariables
  >(UPDATE_FIELD_VALUE_MUTATION)

  const handleSave = useCallback(
    (contentState: ContentState, field: { id: string }) => {
      updateFieldValueMutation({
        variables: {
          noteId,
          fieldId: field.id,
          data: convertToRaw(contentState),
        },
      })
    },
    [noteId, updateFieldValueMutation]
  )

  return (
    <PersistedEditor
      title={
        <span className="text-txt text-opacity-text-primary">
          {fieldValue.field!.name}
        </span>
      }
      loading={loading}
      error={error}
      saveDebounceMs={FIELD_VALUE_CHANGE_DEBOUNCE}
      onSave={handleSave}
      errorMessage={t`An error has occurred when saving your note`}
      blockMessage={t`Your note is not saved, are you sure you want to exit the page?`}
    >
      {({ onChange }) => (
        <FieldValueEditor
          className="mb-4 mt-1"
          initialContentState={fieldValue.data}
          field={fieldValue.field!}
          onChange={onChange}
        />
      )}
    </PersistedEditor>
  )
}

const NotePage: React.FC = () => {
  const { slug: deckSlug, noteId } = useParams() as {
    slug: string
    noteId: string
  }
  const { data, loading } = useQuery<NoteQuery, NoteQueryVariables>(
    NOTE_QUERY,
    { variables: { noteId } }
  )
  const [flashCardPreview, setFlashCardPreview] =
    useState<NoteQuery_note_flashCards | null>(null)
  const { i18n } = useLingui()

  useTopBarLoading(loading)

  const handleShowFlashCardPreview = (flashCard: NoteQuery_note_flashCards) => {
    setFlashCardPreview(flashCard)
  }

  const handleCloseFlashCardPreview = () => {
    setFlashCardPreview(null)
  }

  if (loading) {
    return null
  }

  const { id, values, deck, flashCards, text } = data!.note!

  return (
    <>
      {flashCardPreview && (
        <Dialog isOpen onDismiss={handleCloseFlashCardPreview}>
          <FlashCardRenderer
            values={values.map(({ data, ...value }) => ({
              ...value,
              field: value.field!,
              data: data as RawDraftContentState,
            }))}
            hideBackSide={false}
            template={
              flashCardPreview.template as {
                frontSide: RawDraftContentState
                backSide: RawDraftContentState
              }
            }
          />
        </Dialog>
      )}
      <Helmet title={text!} />
      <Container className="py-4">
        <BackButton to={`/d/${deckSlug}`} />

        <div className="flex flex-col mb-8">
          <Caption className="mt-1 text-txt text-opacity-text-secondary">
            <Trans>Deck {deck!.title}</Trans>
          </Caption>
          <Headline1 className="text-txt text-opacity-text-primary font-bold">
            <Trans>Note details</Trans>
          </Headline1>
          <Headline2 className="mt-4 text-txt text-opacity-text-primary">
            {text || (
              <span className="text-txt text-opacity-text-secondary italic">
                <Trans>empty note</Trans>
              </span>
            )}
          </Headline2>
        </div>

        {values.map((value) => (
          <FieldValueDetail noteId={id} fieldValue={value} key={value.id} />
        ))}

        <Divider className="my-8" />

        <Headline2 className="font-bold text-txt text-opacity-text-primary">
          <Trans>Flashcards</Trans>
        </Headline2>

        <Card className="mt-4 mb-8 w-full">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className="w-0" />
                <TableCell>Template</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Lapses</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {flashCards.map((flashCard) => (
                <TableRow key={flashCard.id}>
                  <TableCell className="flex justify-center items-center">
                    <Checkbox checked={flashCard.active} />
                  </TableCell>
                  <TableCell>{flashCard.template?.name}</TableCell>
                  <TableCell>
                    <FlashCardStatus status={flashCard.status!} />
                  </TableCell>
                  <TableCell>{flashCard.lapses}</TableCell>
                  <TableCell>
                    {flashCard.due && i18n.date(new Date(flashCard.due), {})}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      onClick={() => handleShowFlashCardPreview(flashCard)}
                    >
                      <Trans>Preview</Trans>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </Container>
    </>
  )
}

export default NotePage
