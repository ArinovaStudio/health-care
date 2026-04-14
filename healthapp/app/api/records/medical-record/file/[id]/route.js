import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import MedicalRecord from '@/models/medicalRecord';
import User from '@/models/user';
import { verifyUser } from '@/lib/verifyUser';

export async function GET(req, { params }) {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const accessKey = searchParams.get('accessKey');

    let userId = null;
    
    const auth = await verifyUser(req);
    if (auth && auth.userId) {
        userId = auth.userId;
    }

    try {
        const resolvedParams = await params;
        const recordId = resolvedParams.id;
        const record = await MedicalRecord.findById(recordId);

        if (!record) {
            return NextResponse.json({ success: false, message: "Record not found" }, { status: 404 });
        }

        let isAuthorized = false;

        if (userId && record.userId.toString() === userId) {
            isAuthorized = true;
        } else if (accessKey) {
            const owner = await User.findById(record.userId);
            if (owner && owner.emergencyAccessKey === accessKey) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            return NextResponse.json({ 
                success: false, 
                message: "Unauthorized access to this record" 
            }, { status: 403 });
        }

        if (record.fileUrl) {
            const cloudResponse = await fetch(record.fileUrl);
            if (!cloudResponse.ok) return NextResponse.json({ success: false, message: "Cloud error" }, { status: 502 });

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

        return NextResponse.json({ success: false, message: "URL missing" }, { status: 404 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}