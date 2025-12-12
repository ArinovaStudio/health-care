import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import PrescribedRecord from '@/models/prescribedRecord';
import EmergencyAccessKey from '@/models/emergencyAccessKey';
import { saveFile, deleteFile } from '@/lib/fileUpload';

export async function POST(req) {
    await dbConnect();

    let savedFile = null;

    try {
        const formData = await req.formData();
        const accessKey = formData.get('accessKey');
        const description = formData.get('description');
        const file = formData.get('file');

        if (!accessKey) {
            return NextResponse.json({
                success: false,
                message: "Access key missing",
            }, { status: 400 });
        }

        //  Find the access key in DB
        const accessData = await EmergencyAccessKey.findOne({ accessKey });

        if (!accessData) {
            return NextResponse.json({
                success: false,
                message: "Invalid or expired access key",
            }, { status: 401 });
        }

        const userId = accessData.userId;

        // Check for file validation error
        savedFile = await saveFile(file);

        const prescribedRecord = new PrescribedRecord({
            userId: userId,
            description: description || null,
            fileUrl: savedFile.filename,
            fileName: savedFile.originalName,
            fileType: savedFile.type,
            fileSize: savedFile.size,
            publicId: savedFile.publicId,
            uploadedBy: "Doctor",
        });

        await prescribedRecord.save();

        return NextResponse.json({
            success: true,
            message: "Prescription uploaded successfully",
            data: prescribedRecord,
        }, { status: 201 });

    } catch (error) {
        console.error("Error uploading prescription (Doctor):", error);

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