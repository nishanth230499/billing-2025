import mongoose from 'mongoose'

const firmSchema = mongoose.Schema({
  _id: { type: String, required: true },
  name: {
    type: String,
    required: true,
  },
  color: { type: String, required: true },
  icon: { type: String, required: true },
})

export default mongoose.models?.Firm ||
  mongoose.model('Firm', firmSchema, 'firm')
