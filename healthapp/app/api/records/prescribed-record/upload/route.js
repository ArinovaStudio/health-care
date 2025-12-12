import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import PrescribedRecord from '@/models/prescribedRecord';
import { verifyUser } from '@/lib/verifyUser';
import { saveFile, deleteFile } from '@/lib/fileUpload';

export async function POST(req) {
    await dbConnect();

    const { userId, errorResponse } = await verifyUser(req);
    if (errorResponse) {
        return errorResponse;
    }

    let savedFile = null;

    try {
        const formData = await req.formData();
        const file = formData.get('file');

        savedFile = await saveFile(file);

        const prescribedRecord = new PrescribedRecord({
            userId: userId,
            fileUrl: savedFile.filename,
            fileName: savedFile.originalName,
            fileType: savedFile.type,
            fileSize: savedFile.size,
            publicId: savedFile.publicId,
            description: formData.get('description') || null 
        });

        await prescribedRecord.save();

        return NextResponse.json({
            success: true,
            message: "Prescription uploaded successfully",
            data: prescribedRecord,
        }, { status: 201 });

    } catch (error) {
        console.error("Error uploading prescription:", error);

        if (savedFile && savedFile.publicId) {
            await deleteFile(savedFile.publicId, savedFile.resource_type);
        }

        return NextResponse.json({
            success: false,
            message: "Error uploading prescription",
            error: error.message,
        }, { status: 500 });
    }
}