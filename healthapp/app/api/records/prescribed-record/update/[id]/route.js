import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import PrescribedRecord from '@/models/prescribedRecord';
import { verifyUser } from '@/lib/verifyUser';
import { saveFile, deleteFile } from '@/lib/fileUpload';

export async function PUT(req, { params }) {
    await dbConnect();

    const { userId, errorResponse } = await verifyUser(req);
    if (errorResponse) {
        return errorResponse;
    }

    let savedFile = null;

    try {
        const resolvedParams = await params;
        const recordId = resolvedParams.id;

        const formData = await req.formData();
        const file = formData.get('file');

        const record = await PrescribedRecord.findById(recordId);

        if (!record) {  
            return NextResponse.json({
                success: false,
                message: "Prescription record not found"
            }, { status: 404 });
        }

        if (record.userId.toString() !== userId) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized to update this record"
            }, { status: 403 });
        }

        if (file && typeof file !== 'string') {
            savedFile = await saveFile(file);
        }

        if (savedFile) {
            // If a new file uploaded, delete old file and update fields
            if (record.publicId) {
                await deleteFile(record.publicId);
            }

            record.fileUrl = savedFile.filename;
            record.fileName = savedFile.originalName;
            record.fileType = savedFile.type;
            record.fileSize = savedFile.size;
            record.publicId = savedFile.publicId;
        }

        await record.save();

        return NextResponse.json({
            success: true,
            message: "Prescription record updated successfully",
            data: record
        }, { status: 200 });

    } catch (error) {
        console.error("Error updating prescription record:", error);

        if (savedFile && savedFile.publicId) {
            await deleteFile(savedFile.publicId, savedFile.resource_type);
        }

        return NextResponse.json({
            success: false,
            message: "Error updating prescription record",
            error: error.message
        }, { status: 500 });
    }
}