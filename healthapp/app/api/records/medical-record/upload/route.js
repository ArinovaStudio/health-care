import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import MedicalRecord from '@/models/medicalRecord';
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

        const recordType = formData.get('recordType');
        const date = formData.get('date');
        const title = formData.get('title');
        const description = formData.get('description');

        // Create new medical record
        const medicalRecord = new MedicalRecord({
            userId: userId,
            recordType: recordType || null,
            date: date || null,
            title: title || null,
            description: description || null,
            fileUrl: savedFile.filename, 
            fileName: savedFile.originalName,
            fileType: savedFile.type,
            fileSize: savedFile.size,
            publicId: savedFile.publicId
        });

        await medicalRecord.save();

        return NextResponse.json({
            success: true,
            message: "Medical record uploaded successfully",
        }, { status: 201 });

    } catch (error) {
        console.error("Error uploading medical record:", error);

        // Delete uploaded file if record creation fails
        if (savedFile && savedFile.publicId) {
            await deleteFile(savedFile.publicId, savedFile.resourceType);
        }

        return NextResponse.json({
            success: false,
            message: error.message || "Error uploading medical record",
        }, { status: 500 });
    }
}