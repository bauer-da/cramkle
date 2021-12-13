import type { TaggableEntry } from './TaggableEntry'

export enum TAG_TYPE {
  TAG = 'TAG',
  FUNCTION = 'FUNCTION',
}

export const TEMPLATE_FUNCTIONS: TaggableEntry[] = [
  { id: 'voice', name: 'Voice' },
  { id: 'type', name: 'Type' },
]
