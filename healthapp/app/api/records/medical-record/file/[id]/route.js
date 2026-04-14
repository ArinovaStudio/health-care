import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import MedicalRecord from '@/models/medicalRecord';

export async function GET(req, { params }) {
    await dbConnect();

    try {
        const resolvedParams = await params;
        const recordId = resolvedParams.id;
        
        const record = await MedicalRecord.findById(recordId);
        if (!record) {
            return NextResponse.json({ success: false, message: "Record not found" }, { status: 404 });
        }

        if (record.fileUrl) {
            const cloudResponse = await fetch(record.fileUrl);
            if (!cloudResponse.ok) {
                return NextResponse.json({ success: false, message: "Error fetching from cloud" }, { status: 502 });
            }

            const fileBuffer = await cloudResponse.arrayBuffer();
            const contentType = cloudResponse.headers.get('content-type') || 'application/octet-stream';
            const inline = contentType.startsWith("image/") || contentType === "application/pdf";
            
            return new NextResponse(fileBuffer, {
                status: 200,
                headers: {
                    'Content-Type': contentType,
                    'Content-Disposition': `${inline ? "inline" : "attachment"}; filename="${encodeURIComponent(record.fileName)}"`,
                    'Content-Length': fileBuffer.byteLength.toString(),
                }
            });
        }

        return NextResponse.json({ success: false, message: "File URL missing" }, { status: 404 });
    } catch (error) {
        console.error("Direct File Access Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}