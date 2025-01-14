import { gql, useMutation } from '@apollo/client'
import { Plural, Trans, t } from '@lingui/macro'
import { useRef, useState } from 'react'
import * as React from 'react'
import { useNavigate } from 'react-router'

import { MODELS_QUERY } from '../pages/ModelsSection'
import type { ModelsQuery } from '../pages/__generated__/ModelsQuery'
import {
  TIMEOUT_MEDIUM,
  pushErrorToast,
  pushSimpleToast,
} from '../toasts/pushToast'
import type {
  DeleteModelMutation,
  DeleteModelMutationVariables,
} from './__generated__/DeleteModelMutation'
import { TrashBinIcon } from './icons/TrashBinIcon'
import {
  AlertDialog,
  AlertDialogDescription,
  AlertDialogLabel,
} from './views/AlertDialog'
import { Button } from './views/Button'

interface Props {
  model: { id: string; templates: unknown[]; totalNotes: number }
}

const DELETE_MODEL_MUTATION = gql`
  mutation DeleteModelMutation($modelId: ID!) {
    deleteModel(input: { id: $modelId }) {
      model {
        id
      }
    }
  }
`

const DeleteModelButton: React.FunctionComponent<Props> = ({ model }) => {
  const navigate = useNavigate()
  const [mutate] = useMutation<
    DeleteModelMutation,
    DeleteModelMutationVariables
  >(DELETE_MODEL_MUTATION)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = () => {
    setDeleting(true)

    mutate({
      variables: { modelId: model.id },
      update: (cache, { data }) => {
        const deletedModelId = data?.deleteModel?.model?.id

        const cachedModelsQuery = cache.readQuery<ModelsQuery>({
          query: MODELS_QUERY,
        })

        const cardModels = cachedModelsQuery?.models

        if (cardModels && deletedModelId) {
          cache.writeQuery({
            query: MODELS_QUERY,
            data: {
              cardModels: cardModels.filter(
                (model) => model.id !== deletedModelId
              ),
            },
          })
        }
      },
    })
      .then(() => {
        navigate('/models')

        pushSimpleToast(t`Model deleted successfully`)
      })
      .catch(() => {
        setDeleting(false)

        pushErrorToast(
          {
            message: t`An error occurred when deleting the model`,
          },
          TIMEOUT_MEDIUM
        )
      })
  }

  const handleClose = () => {
    if (deleting) {
      return
    }

    setDialogOpen(false)
  }

  const handleClick = () => {
    setDialogOpen(true)
  }

  const cancelRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <Button
        className="flex-shrink-0"
        variation="outline"
        onClick={handleClick}
      >
        <TrashBinIcon className="mr-2 flex-shrink-0" />
        <Trans>Delete</Trans>
      </Button>
      <AlertDialog
        isOpen={dialogOpen}
        onDismiss={handleClose}
        leastDestructiveRef={cancelRef}
      >
        <AlertDialogLabel>
          <Trans>Delete model</Trans>
        </AlertDialogLabel>
        <AlertDialogDescription>
          <Trans>
            Are you sure you want to delete this model?{' '}
            <Plural
              value={model.totalNotes}
              one="There's # note"
              other="There're # notes"
            />{' '}
            and{' '}
            <Plural
              value={model.templates.length}
              one="# template"
              other="# templates"
            />{' '}
            associated with it.
          </Trans>
        </AlertDialogDescription>
        <div className="flex justify-end items-center">
          <Button
            onClick={handleClose}
            disabled={deleting}
            ref={cancelRef}
            variation="secondary"
          >
            Cancel
          </Button>
          <Button className="ml-3" onClick={handleDelete} disabled={deleting}>
            <Trans>Delete</Trans>
          </Button>
        </div>
      </AlertDialog>
    </>
  )
}

export default DeleteModelButton
