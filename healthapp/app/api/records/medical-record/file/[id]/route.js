import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import MedicalRecord from '@/models/medicalRecord';
import { verifyUser } from '@/lib/verifyUser';
import path from 'path';
import fs from 'fs';

export async function GET(req, { params }) {
    await dbConnect();

    const { userId } = await verifyUser(req);

    try {
        const resolvedParams = await params;
        const recordId = resolvedParams.id;

        const record = await MedicalRecord.findById(recordId);

        if (!record) {
            return NextResponse.json({ 
                success: false, 
                message: "Record not found" 
            }, { status: 404 });
        }

        const storageDir = path.join(process.cwd(), "storage");
        const filePath = path.join(storageDir, record.fileUrl);

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ 
                success: false, 
                message: "File missing on server" 
            }, { status: 404 });
        }

        // Determine a content type for common extensions
        const ext = path.extname(record.fileName).toLowerCase();
        let contentType = "application/octet-stream";
        if (ext === ".pdf") contentType = "application/pdf";
        else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
        else if (ext === ".png") contentType = "image/png";
        else if (ext === ".doc") contentType = "application/msword";
        else if (ext === ".docx") contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

        // For inline preview of images / pdfs use inline disposition, otherwise attachment
        const inline = contentType.startsWith("image/") || contentType === "application/pdf";
        const dispositionType = inline ? "inline" : "attachment";

        // Ensure proper filename in Content-Disposition
        const contentDisposition = `${dispositionType}; filename="${encodeURIComponent(record.fileName)}"`;

        const fileBuffer = fs.readFileSync(filePath);

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': contentDisposition,
                'Content-Length': fileBuffer.length.toString(),
            }
        });

    } catch (error) {
        console.error("Error serving file:", error);
        return NextResponse.json({
            success: false,
            message: "Error serving file",
            error: error.message,
        }, { status: 500 });
    }
}