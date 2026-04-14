import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import PrescribedRecord from '@/models/prescribedRecord';
import { verifyUser } from '@/lib/verifyUser';

export async function GET(req, { params }) {
    await dbConnect();

    try {
        const resolvedParams = await params;
        const recordId = resolvedParams.id;

        const record = await PrescribedRecord.findById(recordId);

        if (!record) {
            return NextResponse.json({ success: false, message: "Record not found" }, { status: 404 });
        }

        if (record.fileUrl) {
            const cloudResponse = await fetch(record.fileUrl);
            
            if (!cloudResponse.ok) {
                return NextResponse.json({ 
                    success: false, 
                    message: "Failed to retrieve file from cloud storage" 
                }, { status: 502 });
            }

            const fileBuffer = await cloudResponse.arrayBuffer();
            
            const contentType = cloudResponse.headers.get('content-type') || 'application/octet-stream';
            
            const inline = contentType.startsWith("image/") || contentType === "application/pdf";
            const dispositionType = inline ? "inline" : "attachment";
            const contentDisposition = `${dispositionType}; filename="${encodeURIComponent(record.fileName)}"`;

            return new NextResponse(fileBuffer, {
                status: 200,
                headers: {
                    'Content-Type': contentType,
                    'Content-Disposition': contentDisposition,
                    'Content-Length': fileBuffer.byteLength.toString(),
                }
            });
        }

        return NextResponse.json({ 
            success: false, 
            message: "File URL missing in record" 
        }, { status: 404 });


    } catch (error) {
        console.error("Error serving file:", error);
        return NextResponse.json({
            success: false,
            message: "Error serving file",
            error: error.message,
        }, { status: 500 });
    }
}