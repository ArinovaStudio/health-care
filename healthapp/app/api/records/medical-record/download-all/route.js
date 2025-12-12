import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import MedicalRecord from '@/models/medicalRecord';
import { verifyUser } from '@/lib/verifyUser';
import path from 'path';
import archiver from 'archiver';
import { Readable } from 'stream';

export async function GET(req) {
    await dbConnect();

    const { userId, errorResponse } = await verifyUser(req);
    if (errorResponse) {
        return errorResponse;
    }

    try {
        const records = await MedicalRecord.find({ userId });

        if (!records || records.length === 0) {
            return NextResponse.json({
                success: false,
                message: "No records found",
            }, { status: 404 });
        }

         // Create zip file
        const archive = archiver('zip', {
            zlib: { level: 9 }, // Maximum compression
        });

        let fileCount = 0;

        for (const record of records) {
            if (!record.fileUrl) continue;

            try {
                // Fetch the file content from Cloudinary
                const response = await fetch(record.fileUrl);
                
                if (!response.ok) {
                    console.warn(`Failed to fetch file from Cloudinary: ${record.fileUrl}`);
                    continue;
                }

                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                const rType = record.recordType || 'Uncategorized';
                const folderName = rType.replace("_", " ").toUpperCase();
                
                let datePart = 'NoDate';
                try {
                    if (record.date) {
                        const d = new Date(record.date);
                        if (!isNaN(d.getTime())) {
                            datePart = d.toISOString().split("T")[0];
                        } else {
                            datePart = String(record.date).replace(/[^a-z0-9-]/gi, '_');
                        }
                    }
                } catch (e) {
                    datePart = 'InvalidDate';
                }

                const ext = path.extname(record.fileName || '') || path.extname(record.fileUrl);
                const safeTitle = (record.title || 'Untitled').replace(/[^a-z0-9]/gi, '_');
                
                const fileName = `${folderName}/${datePart}-${safeTitle}${ext}`;

                // Append buffer to archive
                archive.append(buffer, { name: fileName });
                fileCount++;

            } catch (fileErr) {
                console.error(`Error processing file ${record.fileName}:`, fileErr);
            }
        }

        if (fileCount === 0) {
             return NextResponse.json({
                success: false,
                message: "Records exist in database but files are missing on server.",
            }, { status: 404 });
        }

        archive.finalize();

        const webStream = Readable.toWeb(archive);

        return new NextResponse(webStream, {
            status: 200,
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': 'attachment; filename="medical-records.zip"',
            },
        });

    } catch (error) {
        console.error("Error downloading records:", error);
        return NextResponse.json({
            success: false,
            message: "Error downloading records",
            error: error.message,
        }, { status: 500 });
    }
}