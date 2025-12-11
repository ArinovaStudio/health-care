'use client';
import React, { useState, useRef } from 'react'
import { Copy, Check, RefreshCw, Eye, EyeOff, Shield } from 'lucide-react';
import { QRCodeCanvas } from "qrcode.react";
import { generateKeyAction } from '../actions/emergencyKey';
import toast from 'react-hot-toast';

function EmergencyAcessPage() {

    // Removed unused activeSection state
    const [copied, setCopied] = useState(false);
    const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
    const [isVisiblePassword, setIsVisiblePassword] = useState(false);
    const [accessKey, setAccessKey] = useState(""); 
    // Removed unused qrvalue state

    const qrRef = useRef();
    const accessLink = `http://localhost:3001/emergencyAccess/${accessKey}`

    const downloadQR = () => {
        const canvas = qrRef.current;
        if (!canvas) {
            toast.error("Unable to download QR code");
            return;
        }

        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = `emergency-access-${accessKey}.png`;
        link.click();
    };

    const generateKey = async () => {
        try {
            const res = await generateKeyAction();
            if (res.success) {
                setAccessKey(res.data.accessKey)
                toast.success("Access Key generated")
            } else {
                 // Handle error response from action
                toast.error(res.message || "Unable to generate the key");
            }
            setIsEmergencyOpen(true);
        } catch (error) {
            console.error(error);
            toast.error("An unexpected error occurred while generating the key");
        }
    }

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(accessLink);
            setCopied(true);
            toast.success("Access Key Link Copied") // Changed text to reflect copying link
            setTimeout(() => setCopied(false), 1500); // reset after 1.5s
        } catch (err) {
            console.error('Failed to copy text:', err);
            toast.error("Unable to Copy. Please try manually.")
        }
    };


    return (
        // Added max-w-4xl to keep the content from becoming too wide on large screens
        <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-white rounded-2xl shadow-xl">
            <h1 className="text-2xl sm:text-3xl mb-2 font-bold text-gray-800">🚨 Emergency Access</h1>
            <p className='text-sm sm:text-base text-gray-500 mb-6'>Generate a QR code or emergency access key that paramedics and doctors can use to access your critical health information instantly.</p>
            
            {/* Main Content Grid: md:grid-cols-2 ensures stacking on small screens */}
            <div className="grid md:grid-cols-2 gap-6 mt-4">
                
                {/* 1. What's Included Card - Visually distinct for emphasis */}
                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-6 border-2 border-red-200 order-2 md:order-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Included in Emergency Access?</h3>
                    <ul className="space-y-4">
                        {/* List items with improved mobile spacing */}
                        {['Blood Group', 'Allergies', 'Chronic Conditions', 'Emergency Contact', 'Current Medications'].map((item, index) => (
                             <li key={index} className="flex items-start space-x-3">
                                <div className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-semibold">{index + 1}</div>
                                <div>
                                    <p className="font-medium text-gray-900">{item}</p>
                                    <p className="text-xs text-gray-600">
                                        {item === 'Blood Group' && 'Critical for transfusions'}
                                        {item === 'Allergies' && 'Prevents harmful medication administration'}
                                        {item === 'Chronic Conditions' && 'Important medical history'}
                                        {item === 'Emergency Contact' && 'Who to notify in case of emergency'}
                                        {item === 'Current Medications' && 'Avoid drug interactions'}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 2. Generation/QR Card */}
                <div className="bg-white rounded-lg p-6 border-2 border-gray-200 text-center order-1 md:order-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                        Generate Emergency Access Key
                    </h3>

                    {isEmergencyOpen ? (
                        <div className="py-4">
                            {/* QR Code Section */}
                            <div className='w-40 h-40 mx-auto mb-4 p-1 rounded-lg shadow-xl'>
                                <QRCodeCanvas value={accessLink} size={152} ref={qrRef} level="H" />
                            </div>

                            <p className="text-gray-600 mb-6 text-sm">
                                Scan this QR code or use the key below to access emergency information.
                            </p>

                            <h1 className='font-semibold text-gray-800 text-left'>Emergency Access Link</h1>
                            
                            {/* Key/Link Input and Copy Button: Responsive layout for the key row */}
                            <div className='flex flex-col sm:flex-row gap-2 sm:gap-4'>
                                <div className='w-full relative'>
                                    <input
                                        type={isVisiblePassword ? 'text' : 'password'}
                                        // Displaying the full access link for clarity and easy copying on mobile
                                        value={accessKey} 
                                        className='w-full mt-2 px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent truncate'
                                        readOnly
                                    />
                                    <button
                                        type='button'
                                        onClick={() => setIsVisiblePassword(!isVisiblePassword)}
                                        className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors p-1'
                                        aria-label={isVisiblePassword ? 'Hide Link' : 'Show Link'}
                                    >
                                        {isVisiblePassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                <button
                                    onClick={handleCopy}
                                    className='flex w-full sm:w-auto mt-2 cursor-pointer items-center justify-center border border-gray-300 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors px-4 py-2'
                                >
                                    {copied ? <Check size={18} className='text-green-600' /> : <Copy size={18} />}
                                    <span className='sm:hidden ml-2'>{copied ? 'Copied!' : 'Copy Link'}</span>
                                </button>
                            </div>
                            <p className='text-xs mt-1 text-gray-600 text-left'>This link contains your unique access key. Share only in emergency situations.</p>

                            {/* Action Buttons: Stack vertically on small screens */}
                            <div className='flex flex-col sm:flex-row gap-2 mt-5'>
                                <button
                                    onClick={() => generateKey()}
                                    className="bg-red-600 w-full text-white cursor-pointer px-3 flex items-center justify-center gap-2 py-3 rounded-xl hover:bg-red-700 transition-colors"
                                >
                                    <RefreshCw size={16} /> Regenerate Key
                                </button>
                                <button
                                    onClick={downloadQR}
                                    className="bg-gray-100 w-full text-gray-700 cursor-pointer px-3 flex items-center justify-center gap-2 py-3 rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Download QR Code
                                </button>
                            </div>

                            {/* Important Notes Section */}
                            <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4 text-left'>
                                <h1 className='text-yellow-900 font-bold flex items-center gap-2'>
                                    <Shield size={20} className='text-yellow-600'/> Important Security Notes
                                </h1>
                                <ul className='list-disc list-inside text-sm text-yellow-900 mt-2 space-y-1'>
                                    <li>This key provides access to **critical emergency information only**.</li>
                                    <li>Full medical records are **not** accessible via emergency access.</li>
                                    <li>You can **regenerate this key anytime** to **revoke** previous access.</li>
                                    <li>Consider printing the QR code to keep in your wallet or on your phone lock screen.</li>
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-qr-code h-16 w-16 text-red-400 mx-auto mb-4">
                                <rect width="5" height="5" x="3" y="3" rx="1"></rect><rect width="5" height="5" x="16" y="3" rx="1"></rect><rect width="5" height="5" x="3" y="16" rx="1"></rect><path d="M21 16h-3a2 2 0 0 0-2 2v3"></path><path d="M21 21v.01"></path><path d="M12 7v3a2 2 0 0 1-2 2H7"></path><path d="M3 12h.01"></path><path d="M12 3h.01"></path><path d="M12 16v.01"></path><path d="M16 12h1"></path><path d="M21 12v.01"></path><path d="M12 21v-1"></path>
                            </svg>

                            <p className="text-gray-600 mb-6">
                                Click below to instantly generate your secure, time-sensitive emergency access credentials.
                            </p>
                            <button
                                onClick={() => generateKey()}
                                className="flex items-center space-x-2 px-6 py-3 bg-red-600 cursor-pointer text-white rounded-xl hover:bg-red-700 transition-colors mx-auto font-semibold"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-qr-code h-5 w-5">
                                    <rect width="5" height="5" x="3" y="3" rx="1"></rect><rect width="5" height="5" x="16" y="3" rx="1"></rect><rect width="5" height="5" x="3" y="16" rx="1"></rect><path d="M21 16h-3a2 2 0 0 0-2 2v3"></path><path d="M21 21v.01"></path><path d="M12 7v3a2 2 0 0 1-2 2H7"></path><path d="M3 12h.01"></path><path d="M12 3h.01"></path><path d="M12 16v.01"></path><path d="M16 12h1"></path><path d="M21 12v.01"></path><path d="M12 21v-1"></path>
                                </svg>
                                <span>Generate Emergency Access</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* How to Use Section */}
            {isEmergencyOpen && (
                <div className='w-full mt-8 rounded-xl p-5 bg-blue-50 border-1 border-blue-200'>
                    <h1 className='text-blue-950 font-bold mb-4 text-lg'>How to use Emergency Access</h1>
                    
                    {/* Responsive list of steps */}
                    <ul className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <li className="flex items-start sm:block text-center sm:text-left space-x-3 sm:space-x-0">
                            <div className="bg-blue-600 text-white rounded-lg mb-2 w-8 h-8 flex items-center justify-center flex-shrink-0 text-sm font-semibold mx-auto sm:mx-0">1</div>
                            <div>
                                <p className="font-medium text-blue-950 mb-1">Print or Save</p>
                                <p className="text-sm text-blue-900">Download the QR code or save the access key in a secure, easy-to-find location like your wallet.</p>
                            </div>
                        </li>
                        <li className="flex items-start sm:block text-center sm:text-left space-x-3 sm:space-x-0">
                            <div className="bg-blue-600 text-white rounded-lg mb-2 w-8 h-8 flex items-center justify-center flex-shrink-0 text-sm font-semibold mx-auto sm:mx-0">2</div>
                            <div>
                                <p className="font-medium text-blue-950 mb-1">Share in Emergency</p>
                                <p className="text-sm text-blue-900">Allow paramedics or hospital staff to scan the QR code or enter the access key from a safe place.</p>
                            </div>
                        </li>
                        <li className="flex items-start sm:block text-center sm:text-left space-x-3 sm:space-x-0">
                            <div className="bg-blue-600 text-white rounded-lg mb-2 w-8 h-8 flex items-center justify-center flex-shrink-0 text-sm font-semibold mx-auto sm:mx-0">3</div>
                            <div>
                                <p className="font-medium text-blue-950 mb-1">Instant Access</p>
                                <p className="text-sm text-blue-900">Healthcare providers get **instant, read-only access** to your critical medical data, saving crucial time.</p>
                            </div>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    )
}

export default EmergencyAcessPage