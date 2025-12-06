import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import PrescribedRecord from '@/models/prescribedRecord';
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

        const record = await PrescribedRecord.findById(recordId);

        if (!record) {
            return NextResponse.json({
                success: false,
                message: "Prescription record not found",
            }, { status: 404 });
        }

        if (record.userId.toString() !== userId) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized to delete this record",
            }, { status: 403 });
        }

        if (record.fileUrl) {
            await deleteFile(record.fileUrl);
        }

        await PrescribedRecord.findByIdAndDelete(recordId);

        return NextResponse.json({
            success: true,
            message: "Prescription record deleted successfully",
        }, { status: 200 });

    } catch (error) {
        console.error("Error deleting prescription record:", error);
        return NextResponse.json({
            success: false,
            message: "Error deleting prescription record",
            error: error.message,
        }, { status: 500 });
    }
}