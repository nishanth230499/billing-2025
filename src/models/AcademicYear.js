import mongoose from 'mongoose'

const academicYearSchema = mongoose.Schema({
  year: { type: String, required: true, unique: true, index: true },
  default: Boolean,
})

academicYearSchema.index({ default: 1, year: -1 })

export default mongoose.models.AcademicYear ||
  mongoose.model('AcademicYear', academicYearSchema, 'academic_year')
