import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recordType: {
        type: String,
        // required: true,
        enum: ['lab_report', 'prescription', 'discharge_summary', 'xray', 'scan', 'other']
    },
    date: {
        type: String,
        // required: true
    },
    title: {
        type: String,
        // required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    fileUrl: {
        type: String,
        // required: true
    },
    fileName: {
        type: String,
        // required: true
    },
    fileType: {
        type: String,
        // required: true,
        // Allowed file types as per the form
        enum: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx']
    },
    fileSize: {
        type: Number,  // in bytes
        // required: true,
        max: 10 * 1024 * 1024  // 10MB max as specified in the form
    },
    publicId: { 
        type: String,
        required: true
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    },
    lastModified: {
        type: Date,
        default: Date.now
    }
});

// Update lastModified timestamp before saving
medicalRecordSchema.pre('save', function(next) {
    this.lastModified = Date.now();
});

const MedicalRecord = mongoose.models.MedicalRecord || mongoose.model('MedicalRecord', medicalRecordSchema);

export default MedicalRecord;