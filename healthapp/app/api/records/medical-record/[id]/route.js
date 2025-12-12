import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import MedicalRecord from '@/models/medicalRecord';
import { verifyUser } from '@/lib/verifyUser';
import { deleteFile } from '@/lib/fileUpload';

export async function DELETE(req, { params }) {
    await dbConnect();
    const { userId, errorResponse } = await verifyUser(req);
    if (errorResponse) {
        return errorResponse;
    }

    try {
        const resolvedParams = await params;
        const recordId = resolvedParams.id;

        const medicalRecord = await MedicalRecord.findById(recordId);

        if (!medicalRecord) {
            return NextResponse.json({
                success: false,
                message: "Medical record not found",
            }, { status: 404 });
        }

        if (medicalRecord.userId.toString() !== userId) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized to delete this record",
            }, { status: 403 });
        }

        if (medicalRecord.publicId) {
            await deleteFile(medicalRecord.publicId);
        }

        await MedicalRecord.findByIdAndDelete(recordId);

        return NextResponse.json({
            success: true,
            message: "Medical record deleted successfully",
        }, { status: 200 });

    } catch (error) {
        console.error("Error deleting medical record:", error);
        return NextResponse.json({
            success: false,
            message: "Error deleting medical record",
            error: error.message,
        }, { status: 500 });
    }
}