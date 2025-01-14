import type { Reference, StoreObject } from '@apollo/client'
import { gql, useMutation } from '@apollo/client'
import { Trans, t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import classnames from 'classnames'
import { useRef, useState } from 'react'
import * as React from 'react'

import { useLatestRefEffect } from '../hooks/useLatestRefEffect'
import { DRAFT_CONTENT_FRAGMENT, MODEL_QUERY } from '../pages/ModelQuery'
import type {
  ModelQuery,
  ModelQueryVariables,
  ModelQuery_model_templates,
} from '../pages/__generated__/ModelQuery'
import type {
  CreateTemplate,
  CreateTemplateVariables,
} from './__generated__/CreateTemplate'
import type {
  DeleteTemplate,
  DeleteTemplateVariables,
} from './__generated__/DeleteTemplate'
import type {
  RenameTemplate,
  RenameTemplateVariables,
} from './__generated__/RenameTemplate'
import { AddTemplateIcon } from './icons/AddTemplateIcon'
import { ClearIcon } from './icons/ClearIcon'
import { DoneIcon } from './icons/DoneIcon'
import { EditIcon } from './icons/EditIcon'
import { TrashBinIcon } from './icons/TrashBinIcon'
import { WarningIcon } from './icons/WarningIcon'
import { Button } from './views/Button'
import { Dialog, DialogTitle } from './views/Dialog'
import { IconButton } from './views/IconButton'
import { Input } from './views/Input'
import { Body1, Body2, Caption } from './views/Typography'

const TEMPLATE_FRAGMENT = gql`
  fragment EditTemplatesDialog_template on Template {
    id
    name
    frontSide {
      ...DraftContent
    }
    backSide {
      ...DraftContent
    }
  }

  ${DRAFT_CONTENT_FRAGMENT}
`

const RENAME_TEMPLATE_MUTATION = gql`
  mutation RenameTemplate($templateId: ID!, $templateName: String!) {
    updateTemplate(input: { id: $templateId, name: $templateName }) {
      template {
        ...EditTemplatesDialog_template
      }
    }
  }

  ${TEMPLATE_FRAGMENT}
`

const CREATE_TEMPLATE_MUTATION = gql`
  mutation CreateTemplate($modelId: ID!, $templateName: String!) {
    addTemplateToModel(input: { modelId: $modelId, name: $templateName }) {
      template {
        ...EditTemplatesDialog_template
      }
    }
  }

  ${TEMPLATE_FRAGMENT}
`

const DELETE_TEMPLATE_MUTATION = gql`
  mutation DeleteTemplate($templateId: ID!) {
    removeTemplateFromModel(input: { templateId: $templateId }) {
      template {
        ...EditTemplatesDialog_template
      }
    }
  }

  ${TEMPLATE_FRAGMENT}
`

const EditTemplatesDialog: React.FC<{
  isOpen?: boolean
  onDismiss?: () => void
  templates: ModelQuery_model_templates[]
  modelId: string
}> = ({ isOpen = false, onDismiss, templates, modelId }) => {
  const { i18n } = useLingui()
  const inputRef = useRef<HTMLInputElement>(null)
  const [renameTemplate, { loading: editLoading }] = useMutation<
    RenameTemplate,
    RenameTemplateVariables
  >(RENAME_TEMPLATE_MUTATION)
  const [createTemplate, { loading: createLoading }] = useMutation<
    CreateTemplate,
    CreateTemplateVariables
  >(CREATE_TEMPLATE_MUTATION)
  const [deleteTemplate, { loading: deleteLoading }] = useMutation<
    DeleteTemplate,
    DeleteTemplateVariables
  >(DELETE_TEMPLATE_MUTATION)

  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(
    null
  )
  const [templateName, setTemplateName] = useState('')
  const [isDelete, setIsDelete] = useState(false)

  useLatestRefEffect(editingTemplateId, () => {
    inputRef.current?.focus()
  })

  const handleEditTemplate = (template?: ModelQuery_model_templates) => {
    setEditingTemplateId(template?.id ?? '')
    setTemplateName(template?.name ?? '')
    setIsDelete(false)
  }

  const clearEditTemplate = () => {
    setEditingTemplateId(null)
    setTemplateName('')
    setIsDelete(false)
  }

  const handleRenameTemplate = async () => {
    await renameTemplate({
      variables: { templateId: editingTemplateId!, templateName },
    })

    clearEditTemplate()
  }

  const handleDeleteTemplate = (template: ModelQuery_model_templates) => {
    setEditingTemplateId(template.id)
    setIsDelete(true)
  }

  const handleConfirmDeleteTemplate = async () => {
    await deleteTemplate({
      variables: {
        templateId: editingTemplateId!,
      },
      update: (cache, mutationResult) => {
        const data = cache.readQuery<ModelQuery, ModelQueryVariables>({
          query: MODEL_QUERY,
          variables: { id: modelId },
        })

        const template = mutationResult.data?.removeTemplateFromModel?.template

        if (template) {
          cache.modify({
            id: cache.identify(data!.model! as unknown as StoreObject)!,
            fields: {
              templates(existingTemplates = []) {
                return existingTemplates.filter(
                  (oldTemplate: Reference) =>
                    cache.identify(oldTemplate) !==
                    cache.identify(template as unknown as StoreObject)
                )
              },
            },
          })
        }
      },
    })

    clearEditTemplate()
  }

  const handleCreateTemplate = async () => {
    await createTemplate({
      variables: {
        modelId,
        templateName,
      },
      update: (cache, mutationResult) => {
        const data = cache.readQuery<ModelQuery, ModelQueryVariables>({
          query: MODEL_QUERY,
          variables: { id: modelId },
        })

        const template = mutationResult.data?.addTemplateToModel?.template

        if (template) {
          cache.modify({
            id: cache.identify(data!.model! as any)!,
            fields: {
              templates(existingTemplates = []) {
                const newTemplateRef = cache.writeFragment({
                  data: template,
                  fragment: TEMPLATE_FRAGMENT,
                  fragmentName: 'EditTemplatesDialog_template',
                })

                return [...existingTemplates, newTemplateRef]
              },
            },
          })
        }
      },
    })

    clearEditTemplate()
  }

  return (
    <Dialog
      isOpen={isOpen}
      onDismiss={onDismiss}
      aria-labelledby="edit-templates-dialog-title"
    >
      <DialogTitle id="edit-templates-dialog-title">
        <Trans>Templates</Trans>
      </DialogTitle>
      <Body2>
        <Trans>Templates of the current model</Trans>
      </Body2>

      <div className="mt-4 flex flex-col border-t border-divider border-opacity-divider">
        {templates.map((template) => (
          <div
            key={template.id}
            className={classnames(
              'w-full flex items-center justify-between border-b border-divider border-opacity-divider py-2 pr-2',
              {
                'pl-2': editingTemplateId !== template.id,
              }
            )}
          >
            {editingTemplateId === template.id && !isDelete ? (
              <>
                <Input
                  className="w-full min-w-0"
                  placeholder={i18n._(t`Template name`)}
                  ref={inputRef}
                  value={templateName}
                  disabled={editLoading}
                  onChange={({ target: { value } }) => setTemplateName(value)}
                />
                <div className="flex ml-2">
                  <IconButton
                    aria-label={i18n._(t`Cancel`)}
                    onClick={clearEditTemplate}
                    disabled={editLoading}
                  >
                    <ClearIcon />
                  </IconButton>
                  <IconButton
                    className="ml-2"
                    aria-label={i18n._(t`Rename template`)}
                    onClick={handleRenameTemplate}
                    disabled={editLoading || !templateName.length}
                  >
                    <DoneIcon />
                  </IconButton>
                </div>
              </>
            ) : editingTemplateId === template.id && isDelete ? (
              <>
                <div className="relative p-2">
                  <WarningIcon
                    className="text-yellow-1"
                    aria-label={i18n._(t`Warning`)}
                  />
                  <div className="bg-yellow-1 opacity-12 absolute top-0 left-0 right-0 bottom-0 rounded-full" />
                </div>
                <div className="flex flex-col w-full ml-3">
                  <Body1>
                    <Trans>
                      Are you sure you want to delete the template{' '}
                      <span className="font-medium">{template.name}</span>?
                    </Trans>
                  </Body1>
                  <Caption>
                    <Trans>
                      This action will delete all flashcards associated with
                      this template
                    </Trans>
                  </Caption>
                </div>
                <div className="flex ml-2">
                  <IconButton
                    aria-label={i18n._(t`Cancel`)}
                    onClick={clearEditTemplate}
                    disabled={deleteLoading}
                  >
                    <ClearIcon />
                  </IconButton>
                  <IconButton
                    className="ml-2"
                    aria-label={i18n._(t`Delete template`)}
                    onClick={handleConfirmDeleteTemplate}
                    disabled={deleteLoading}
                  >
                    <DoneIcon />
                  </IconButton>
                </div>
              </>
            ) : (
              <>
                <Body1>{template.name}</Body1>
                <div className="flex">
                  <IconButton
                    aria-label={i18n._(t`Rename ${template.name} template`)}
                    onClick={() => handleEditTemplate(template)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    className="ml-2"
                    aria-label={i18n._(t`Delete ${template.name} template`)}
                    onClick={() => handleDeleteTemplate(template)}
                  >
                    <TrashBinIcon />
                  </IconButton>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {editingTemplateId === '' ? (
        <div className="flex items-center justify-between pt-3 pr-2">
          <Input
            className="w-full min-w-0"
            ref={inputRef}
            placeholder={i18n._(t`New template name`)}
            value={templateName}
            onChange={(evt) => setTemplateName(evt.target.value)}
            disabled={createLoading}
          />

          <div className="flex ml-2">
            <IconButton
              aria-label={i18n._(t`Cancel`)}
              onClick={clearEditTemplate}
              disabled={createLoading}
            >
              <ClearIcon />
            </IconButton>
            <IconButton
              className="ml-2"
              aria-label={i18n._(t`Create template`)}
              onClick={handleCreateTemplate}
              disabled={createLoading || !templateName.length}
            >
              <DoneIcon />
            </IconButton>
          </div>
        </div>
      ) : (
        <Button className="mt-4" onClick={() => handleEditTemplate()}>
          <AddTemplateIcon className="mr-2" />
          <Trans>Add new</Trans>
        </Button>
      )}
    </Dialog>
  )
}

export default EditTemplatesDialog
