import { Trans, t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { DialogContent } from '@reach/dialog'
import * as React from 'react'

import { Button } from '../../views/Button'
import { Dialog, DialogTitle } from '../../views/Dialog'
import { Listbox, ListboxOption } from '../../views/Listbox'
import type { TaggableEntry } from '../TaggableEntry'
import { FUNCTION_TAG_TYPE } from '../constants'

interface Props {
  open: boolean
  fields: TaggableEntry[]
  onClose: () => void
  handleFunction: (
    tag: FUNCTION_TAG_TYPE,
    data: Record<string, unknown>
  ) => void
}

const DEFAULT_OPTION = 'default'

const TextInput: React.FunctionComponent<Props> = ({
  fields,
  open,
  onClose,
  handleFunction,
}) => {
  const [fieldId, setFieldId] = React.useState<string>(DEFAULT_OPTION)

  const { i18n } = useLingui()

  const handleSubmit = () => {
    handleFunction(FUNCTION_TAG_TYPE.TEXT_INPUT, {
      fieldName: fields.find((f) => f.id == fieldId)?.name,
      fieldId,
    })
    onClose()
  }

  const isFormValid = fieldId !== DEFAULT_OPTION
  return (
    <Dialog
      isOpen={open}
      onDismiss={onClose}
      style={{ maxWidth: '320px', zIndex: 30 }}
      aria-labelledby="add-text-to-speech-dialog-title"
    >
      <DialogTitle id="add-text-to-speech-dialog-title">
        <Trans>Text Input</Trans>
      </DialogTitle>
      <DialogContent
        id="add-text-to-speech-dialog-content"
        style={{ maxWidth: 'fit-content', margin: '0', padding: '0' }}
        className="text-txt text-opacity-text-secondary text-sm"
      >
        <Trans>
          This function will add an input validator to the selected field. It
          will ask you to type the current fiend and compare your input.
        </Trans>
      </DialogContent>
      <div className="flex flex-col">
        <Listbox
          id="statistics-deck-listbox"
          className="mt-2 z-50"
          value={fieldId}
          onChange={setFieldId}
        >
          <ListboxOption value={DEFAULT_OPTION} disabled>
            {i18n._(t`Select a field`)}
          </ListboxOption>
          {fields.map((field) => (
            <ListboxOption key={field.id} value={field.id}>
              {field.name}
            </ListboxOption>
          ))}
        </Listbox>
        <Button
          disabled={!isFormValid}
          className="self-end mt-4"
          onClick={handleSubmit}
        >
          <Trans>Add</Trans>
        </Button>
      </div>
    </Dialog>
  )
}

export default TextInput
