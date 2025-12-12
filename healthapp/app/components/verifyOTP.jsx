'use client';
import React, { useState, useEffect, useRef } from 'react';
import { LockKeyhole, X } from 'lucide-react';
import { verifyOtpAction, resendOtpAction } from '../actions/verifyOtp';
import toast from 'react-hot-toast';

const OTP_LENGTH = 6;
const INITIAL_TIMER_DURATION = 60;

export default function VerifyOTP({ isOpen, onClose, onOpenLogin }) {
    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
    const [timerDuration, setTimerDuration] = useState(INITIAL_TIMER_DURATION);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isVerifying, setIsVerifying] = useState(false);
    const inputRefs = useRef([]);

    // Safely get userEmail from localStorage
    const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : '';

    // Countdown timer effect
    useEffect(() => {
        if (!isOpen) return;
        let interval = null;
        if (timerDuration > 0) {
            interval = setInterval(() => {
                setTimerDuration((prev) => prev - 1);
            }, 1000);
        } else if (timerDuration === 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timerDuration, isOpen]);

    // Reset everything when modal opens
    useEffect(() => {
        if (isOpen) {
            setOtp(Array(OTP_LENGTH).fill(''));
            setMessage({ text: '', type: '' });
            setTimerDuration(INITIAL_TIMER_DURATION);
            setIsVerifying(false);
            // Focus on the first input after a short delay to ensure it's rendered
            setTimeout(() => {
                if (inputRefs.current[0]) inputRefs.current[0].focus();
            }, 0);
        }
    }, [isOpen]);

    const isOtpComplete = otp.every((d) => d !== '');

    const handleChange = (e, index) => {
        const value = e.target.value.slice(0, 1);
        if (/[0-9]/.test(value) || value === '') {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);
            if (value !== '' && index < OTP_LENGTH - 1) {
                inputRefs.current[index + 1].focus();
            }
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && otp[index] === '') {
            if (index > 0) {
                inputRefs.current[index - 1].focus();
            }
        }
        // Auto-submit on Enter key when OTP is complete
        if (e.key === 'Enter' && isOtpComplete) {
            handleVerifyOtp();
        }
    };

    const handleResendCode = async () => {
        // Prevent resend if userEmail is missing or timer is still running
        if (!userEmail || timerDuration > 0) return;

        setTimerDuration(INITIAL_TIMER_DURATION);
        const result = await resendOtpAction(userEmail);

        if (result.success) {
            toast.success("A new verification code has been sent!");
            setOtp(Array(OTP_LENGTH).fill(''));
            inputRefs.current[0]?.focus();
        } else {
            toast.error(result.message || "Failed to resend code.");
        }
    };

    const handleVerifyOtp = async () => {
        const otpCode = otp.join('');
        if (otpCode.length !== OTP_LENGTH || !userEmail) return;

        setIsVerifying(true);
        setMessage({ text: '', type: '' });

        const result = await verifyOtpAction(userEmail, otpCode);

        if (result.success) {
            toast.success(result.message || "Account verified successfully!");
            onClose();
            // Redirect to login or next step
            onOpenLogin();
        } else {
            setMessage({ text: result.message || "Verification failed. Please try again.", type: 'error' });
            // Optionally clear OTP on failure
            setOtp(Array(OTP_LENGTH).fill(''));
            inputRefs.current[0]?.focus();
        }

        setIsVerifying(false);
    };

    const inputClasses =
        'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-center text-xl font-semibold border-2 rounded-lg transition duration-200 focus:outline-none';

    // ✅ Don’t render at all if modal is closed
    if (!isOpen) return null;

    return (
        // Modal Backdrop: fixed, inset-0, bg-black/50, centered, z-50
        <div className="fixed inset-0 bg-black/50 flex items-start sm:items-center justify-center z-50 p-4 transition-opacity duration-300">
            {/* Modal Container: responsive width, max-width, padding, background, shadow */}
            <div className="rounded-xl bg-white p-6 sm:p-8 w-full max-w-sm md:max-w-md shadow-2xl relative mt-16 sm:mt-0 transform transition-transform duration-300 ease-out scale-100 opacity-100">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition p-1 rounded-full hover:bg-gray-100"
                    aria-label="Close OTP verification modal"
                >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                <header className="text-center mb-6 sm:mb-8">
                    <LockKeyhole className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-600 mx-auto mb-3" />
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Verify Your Account</h1>
                    <p className="text-sm text-gray-500 px-2">
                        Please enter the 6-digit code sent to your email address <br className='sm:hidden' /> <strong className="break-all font-medium">{userEmail}</strong>
                    </p>
                </header>

                <main>
                    {/* OTP Inputs: Adjusted space-x and input size for responsiveness */}
                    <div className="flex justify-center space-x-1 sm:space-x-2 md:space-x-3 mb-6 sm:mb-8">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*" // Helps with mobile keyboards
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleChange(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                ref={(el) => (inputRefs.current[index] = el)}
                                className={`${inputClasses} ${
                                    digit !== '' ? 'border-indigo-500' : 'border-gray-300'
                                } focus:border-indigo-600 focus:shadow-lg focus:ring-2 focus:ring-indigo-200/50`}
                                autoFocus={index === 0} // Initial focus
                            />
                        ))}
                    </div>

                    {/* Verify Button */}
                    <button
                        onClick={handleVerifyOtp}
                        disabled={!isOtpComplete || isVerifying}
                        className="w-full py-3 bg-indigo-600 text-white text-base font-semibold rounded-xl shadow-lg hover:bg-indigo-700 transition duration-150 ease-in-out focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 disabled:opacity-50 flex items-center justify-center"
                    >
                        {isVerifying ? (
                            <>
                                {/* Loading Spinner */}
                                <svg
                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                Verifying...
                            </>
                        ) : (
                            'Verify Code'
                        )}
                    </button>

                    {/* Message Box */}
                    {message.text && (
                        <p
                            className={`mt-4 text-center text-sm font-medium p-2 rounded ${
                                message.type === 'success' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
                            }`}
                        >
                            {message.text}
                        </p>
                    )}

                    {/* Resend Timer/Button */}
                    <div className="text-center mt-6 text-sm">
                        {timerDuration > 0 ? (
                            <p className="text-gray-500">
                                Resend code in{' '}
                                <span className="font-bold text-indigo-600">{timerDuration}s</span>
                            </p>
                        ) : (
                            <button
                                onClick={handleResendCode}
                                className="text-indigo-600 font-medium hover:text-indigo-800 transition disabled:opacity-50"
                                disabled={!userEmail}
                            >
                                Didn’t receive the code? Resend Now.
                            </button>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}