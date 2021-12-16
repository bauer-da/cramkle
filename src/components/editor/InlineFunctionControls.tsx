import { t } from '@lingui/macro'
import * as React from 'react'

import type { TaggableEntry } from './TaggableEntry'
import TemplateEditorFunctionButton from './TemplateEditorFunctionButton'
import { FUNCTION_TAG_TYPE } from './constants'
import TextInputForm from './forms/TextInputForm'
import TextToSpeechForm from './forms/TextToSpeechForm'

const InlineFunctionControls: React.FunctionComponent<{
  fields: TaggableEntry[]
  handleFunction: (
    tag: FUNCTION_TAG_TYPE,
    data: Record<string, unknown>
  ) => void
}> = ({ handleFunction, fields }) => {
  const [openFormType, setOpenFormType] = React.useState<FUNCTION_TAG_TYPE>()

  return (
    <div className="text-sm flex">
      <TemplateEditorFunctionButton
        key={FUNCTION_TAG_TYPE.TEXT_TO_SPEECH}
        label={t`Text to Speech`}
        setOpenFormType={setOpenFormType}
        entityType={FUNCTION_TAG_TYPE.TEXT_TO_SPEECH}
      />
      <TemplateEditorFunctionButton
        key={FUNCTION_TAG_TYPE.TEXT_INPUT}
        label={t`Text Input`}
        setOpenFormType={setOpenFormType}
        entityType={FUNCTION_TAG_TYPE.TEXT_INPUT}
      />

      <TextToSpeechForm
        fields={fields}
        open={openFormType == FUNCTION_TAG_TYPE.TEXT_TO_SPEECH}
        onClose={() => setOpenFormType(undefined)}
        handleFunction={handleFunction}
      />
      <TextInputForm
        fields={fields}
        open={openFormType == FUNCTION_TAG_TYPE.TEXT_INPUT}
        onClose={() => setOpenFormType(undefined)}
        handleFunction={handleFunction}
      />
    </div>
  )
}

export default InlineFunctionControls
