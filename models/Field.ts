import { Schema, model, Document } from 'mongoose'

interface Field {
  name: string
}

interface FieldDocument extends Field, Document {}

const FieldSchema = new Schema<FieldDocument>({
  name: { type: String, required: true },
  modelId: {
    type: Schema.Types.ObjectId,
    ref: 'CardModel',
  },
})

export default model<FieldDocument>('Field', FieldSchema)
