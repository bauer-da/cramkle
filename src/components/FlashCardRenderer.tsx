import { Trans } from '@lingui/macro'
import classnames from 'classnames'
import type { ContentState, RawDraftContentState } from 'draft-js'
import {
  CompositeDecorator,
  Editor,
  EditorState,
  convertFromRaw,
} from 'draft-js'
import 'draft-js/dist/Draft.css'
import { useContext, useMemo } from 'react'
import * as React from 'react'
import ReactAudioPlayer from 'react-audio-player'

import styles from './FlashCardRenderer.module.css'
import { blockStyleFn } from './editor/BlockStyleControls'
import {
  findTagEntities,
  findTextInputEntities,
  findTextToSpeechEntities,
} from './editor/strategies'
import { VolumeUpIcon } from './icons/VolumeUpIcon'
import { Button } from './views/Button'
import { Divider } from './views/Divider'
import { Body2, Caption } from './views/Typography'
import TextInputFunction from './views/TextInputFunction'

export interface NoteValue {
  data: RawDraftContentState
  field: { id: string }
  id: string
}

interface Template {
  frontSide: RawDraftContentState | null
  backSide: RawDraftContentState | null
}

const noop = () => {}

interface ValuesContextType {
  noteValues: NoteValue[]
  showBackSide: boolean
}
const ValuesContext = React.createContext<ValuesContextType | undefined>(
  undefined
)

interface FlashCardValueProps {
  contentState: ContentState
  entityKey: string
}

interface FlashCardAudioPlayerProps {
  contentState: ContentState
  entityKey: string
}

const FlashCardAudioPlayer: React.FC<FlashCardAudioPlayerProps> = ({
  entityKey,
  contentState,
}) => {
  // TODO: Find a better way to handle audio requests
  const AudioApiUrl =
    'https://us-central1-slang-92215.cloudfunctions.net/vocabulary-getAudio'

  const [isAudioReady, setIsAudioReady] = React.useState(false)
  const [audioEl, setAudioEl] =
    React.useState<React.RefObject<HTMLAudioElement>>()
  const [audioUrl, setAudioUrl] = React.useState<string>()

  const data = contentState.getEntity(entityKey).getData()
  const values = useContext(ValuesContext)?.noteValues

  const value = useMemo(
    () => values?.find(({ field }) => field.id === data.fieldId),
    [values, data.fieldId]
  )
  const fieldValue = value?.data.blocks[0].text
  const languageCode = data.languageId

  React.useEffect(() => {
    const fetchURL = `${AudioApiUrl}?text=${fieldValue}&languageCode=${languageCode}`
    fetch(fetchURL)
      .then((res) => res.json())
      .then(
        (result) => {
          setAudioUrl(result.audioUrl)
        },
        (_) => {}
      )
  }, [])

  const playAudio = () => {
    audioEl?.current?.play()
  }

  return (
    <>
      <Button
        className="flex-shrink-0 "
        variation="outline"
        onClick={() => {
          playAudio()
        }}
        disabled={!isAudioReady}
      >
        <VolumeUpIcon className="mr-2 flex-shrink-0" />
        <Trans>Play</Trans>
      </Button>
      {audioUrl && (
        <ReactAudioPlayer
          src={audioUrl}
          autoPlay
          onLoadedMetadata={() => {
            setIsAudioReady(true)
          }}
          ref={(element) => {
            if (element) setAudioEl(element.audioEl)
          }}
        />
      )}
    </>
  )
}

interface FlashCardTextInputProps {
  contentState: ContentState
  entityKey: string
}

const FlashCardTextInput: React.FC<FlashCardTextInputProps> = ({
  entityKey,
  contentState,
}) => {
  const data = contentState.getEntity(entityKey).getData()
  const contextValues = useContext(ValuesContext)
  const noteValues = contextValues!.noteValues
  const showBackSide = contextValues!.showBackSide ?? false

  const value = useMemo(
    () => noteValues?.find(({ field }) => field.id === data.fieldId),
    [noteValues, data.fieldId]
  )
  const fieldValue = value!.data.blocks[0].text

  return <TextInputFunction value={fieldValue} showDifference={showBackSide} />
}

const FlashCardValue: React.FC<FlashCardValueProps> = ({
  entityKey,
  contentState,
  children,
}) => {
  const data = contentState.getEntity(entityKey).getData()

  const values = useContext(ValuesContext)!.noteValues

  const value = useMemo(
    () => values?.find(({ field }) => field.id === data.id),
    [values, data.id]
  )

  const editorState = useMemo(() => {
    if (!value || !value.data) {
      return null
    }

    const contentState = convertFromRaw(value.data)

    return EditorState.createWithContent(contentState)
  }, [value])

  if (!editorState) {
    return <>{children}</>
  }

  return <Editor editorState={editorState} onChange={noop} readOnly />
}

const decorators = new CompositeDecorator([
  {
    strategy: findTagEntities,
    component: FlashCardValue,
  },
  {
    strategy: findTextToSpeechEntities,
    component: FlashCardAudioPlayer,
  },
  {
    strategy: findTextInputEntities,
    component: FlashCardTextInput,
  },
])

interface PanelProps {
  hideLabel: boolean
  label: React.ReactNode
  templateContent: RawDraftContentState | null
  values: NoteValue[]
  emptyMessage: React.ReactNode
  showBackSide: boolean
}

const FlashCardPanel: React.FC<PanelProps> = ({
  hideLabel,
  label,
  templateContent,
  values,
  emptyMessage,
  showBackSide,
}) => {
  const editorState = useMemo(() => {
    if (!templateContent) {
      return EditorState.createEmpty()
    }

    const contentState = convertFromRaw(templateContent)

    return EditorState.createWithContent(contentState, decorators)
  }, [templateContent])

  return (
    <>
      {!hideLabel && (
        <Caption className="mb-2 text-txt text-opacity-text-secondary">
          {label}
        </Caption>
      )}
      {templateContent == null ? (
        <Body2 className="block my-2">{emptyMessage}</Body2>
      ) : (
        <ValuesContext.Provider value={{ noteValues: values, showBackSide }}>
          <Editor
            editorState={editorState}
            onChange={noop}
            blockStyleFn={blockStyleFn}
            readOnly
          />
        </ValuesContext.Provider>
      )}
    </>
  )
}

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  template: Template
  values: NoteValue[]
  hideLabels?: boolean
  hideBackSide?: boolean
}

const FlashCardRenderer: React.FC<Props> = ({
  template,
  values,
  hideLabels = false,
  hideBackSide = true,
  className = '',
  ...props
}) => {
  console.log(`template: ${JSON.stringify(template.frontSide)}`)
  return (
    <div
      {...props}
      className={classnames(styles.renderer, className, 'text-on-surface')}
    >
      <FlashCardPanel
        label={<Trans>Front side</Trans>}
        hideLabel={hideLabels}
        emptyMessage={<Trans>Front side template is empty</Trans>}
        values={values}
        templateContent={template.frontSide}
        showBackSide={!hideBackSide}
      />
      {!hideBackSide && (
        <>
          <Divider className="my-8" />
          <FlashCardPanel
            label={<Trans>Back side</Trans>}
            hideLabel={hideLabels}
            emptyMessage={<Trans>Back side template is empty</Trans>}
            values={values}
            templateContent={template.backSide}
            showBackSide={!hideBackSide}
          />
        </>
      )}
    </div>
  )
}

export default FlashCardRenderer
