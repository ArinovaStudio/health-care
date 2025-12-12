import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/user';
import Profile from '@/models/profile';
import OTP from '@/models/otp';
import { sendOTPEmail } from '@/lib/nodemailer';
import { getAuthenticatedUser } from '@/lib/checkUser';

export async function POST(req) {
    await dbConnect();

    const userId = await getAuthenticatedUser(req);
    
    if (userId) {
        return NextResponse.json({
            success: false,
            message: 'User already logged in.'
        }, { status: 400 });
    }

    try {
        const body = await req.json();
        const { name, email, password } = body;

         // Check if user already exists
        const existingUser = await User.findOne({ email }).select("+isEmailVerified");
        
        if (existingUser && existingUser.isEmailVerified) {
            return NextResponse.json({
                success: false,
                message: 'Email is already registered.'
            }, { status: 400 });
        }

        let user;
        if (existingUser && !existingUser.isEmailVerified) {
            // Update existing unverified user
            existingUser.name = name;
            existingUser.password = password;
            user = existingUser;
        } else {
            // Create new user (unverified)
            user = new User({
                email,
                password,
                isEmailVerified: false
            });
        }

        // Save user
        await user.save();

        // Create or update Profile for this user using available details
        try {
            // Build minimal personalInfo using available fields
            const personalInfo = {
                fullName: name || '',
                email: user.email
            };

            // Upsert profile: if a profile exists for this user, update name/email; otherwise create
            await Profile.findOneAndUpdate(
                { userId: user._id },
                { $set: { personalInfo } },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        } catch (profileErr) {
            // Log profile creation error but don't block registration
            console.error('Profile upsert error:', profileErr);
        }

        // Generate and send OTP
        const otpDoc = await OTP.createOTP(email);
        const result = await sendOTPEmail(email, otpDoc.otp);

        if (!result.success) {
             return NextResponse.json({
                success: false,
                message: 'Registration successful but failed to send email.',
                error: result.error
            }, { status: 500 }); 
        }

        return NextResponse.json({
            success: true,
            message: `Registration successful. ${result}`
        }, { status: 201 });

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: 'Registration failed',
            error: error.message
        }, { status: 500 });
    }
}