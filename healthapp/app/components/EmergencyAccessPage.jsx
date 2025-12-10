'use client';
import React, { useState, useRef, useEffect } from 'react'
import { Shield, LogOut, Copy, Check, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { QRCodeCanvas } from "qrcode.react";
import Navbar from '../patient/_components/Navbar';
import { generateKeyAction } from '../actions/emergencyKey';
import toast from 'react-hot-toast';
import UpperNavbar from '../patient/_components/UpperNavbar';

function EmergencyAcessPage() {

    const [activeSection, setActiveSection] = useState('Emergency Access');
    const [copied, setCopied] = useState(false);
    const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
    const [isVisiblePassword, setIsVisiblePassword] = useState(false);
    const [accessKey, setAccessKey] = useState("");
    const [accessLink, setAccessLink] = useState("");
    const [qrvalue, setQrValue] = useState("");

    const qrRef = useRef();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setAccessLink(`${window.location.origin}/emergencyAccess/${accessKey}`);
        }
    }, [accessKey]);

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
            }
            setIsEmergencyOpen(true);
        } catch (error) {
            console.log(error);
            toast.error("Unable to generate the key");
        }
    }

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(accessLink);
            setCopied(true);
            toast.success("Access Key Copied")
            setTimeout(() => setCopied(false), 1500); // reset after 1.5s
        } catch (err) {
            console.error('Failed to copy text:', err);
            toast.error("Unable to Copy")
        }
    };


    return (
        <div className='min-h-screen bg-slate-50'>
            <UpperNavbar />

            <div className="w-full flex px-40 py-8 gap-6">
                <Navbar activeSection={activeSection} setActiveSection={setActiveSection} />

                <div className="w-full p-8 bg-white rounded-2xl shadow-lg">
                    <h1 className="text-2xl mb-2 font-semibold">Emergency Access</h1>
                    <p className=' text-gray-500'>Generate a QR code or emergency access key that paramedics and doctors can use to access your critical health information instantly.</p>
                    <div className="grid md:grid-cols-2 gap-6 mt-4">
                        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-6 border-2 border-red-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Included in Emergency Access?</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start space-x-3">
                                    <div className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-semibold">1</div>
                                    <div>
                                        <p className="font-medium text-gray-900">Blood Group</p>
                                        <p className="text-sm text-gray-600">Critical for transfusions</p>
                                    </div>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <div className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-semibold">2</div>
                                    <div>
                                        <p className="font-medium text-gray-900">Allergies</p>
                                        <p className="text-sm text-gray-600">Prevents harmful medication administration</p>
                                    </div>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <div className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-semibold">3</div>
                                    <div>
                                        <p className="font-medium text-gray-900">Chronic Conditions</p>
                                        <p className="text-sm text-gray-600">Important medical history</p>
                                    </div>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <div className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-semibold">4</div>
                                    <div>
                                        <p className="font-medium text-gray-900">Emergency Contact</p>
                                        <p className="text-sm text-gray-600">Who to notify in case of emergency</p>
                                    </div>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <div className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-semibold">5</div>
                                    <div>
                                        <p className="font-medium text-gray-900">Current Medications</p>
                                        <p className="text-sm text-gray-600">Avoid drug interactions</p>
                                    </div>
                                </li>
                            </ul>

                        </div>
                        <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Generate Emergency Access
                            </h3>

                            {isEmergencyOpen ? (
                                <div className=" py-4">
                                    <div className='w-40 h-40 mx-auto mb-4 shadow-xl'>
                                        <QRCodeCanvas value={accessLink} size={160} ref={qrRef} />
                                    </div>

                                    <p className="text-gray-600 mb-6 text-sm">
                                        Scan this QR code to access emergency information
                                    </p>

                                    <h1 className='font-semibold text-gray-800s'>Emergency Access Key</h1>
                                    <div className='flex gap-4'>
                                        <div className='w-full relative'>
                                            <input
                                                type={isVisiblePassword ? 'text' : 'password'}
                                                value={accessKey}
                                                className='w-full mt-2  px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent'
                                                readOnly
                                            />
                                            <button
                                                type='button'
                                                onClick={() => setIsVisiblePassword(!isVisiblePassword)}
                                                className='absolute right-3 top-4.5 text-gray-600 hover:text-gray-800 transition-colors'
                                            >
                                                {isVisiblePassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                        <button
                                            onClick={handleCopy}
                                            className='w-1/5 flex mt-2 cursor-pointer items-center justify-center border border-gray-300 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'
                                        >
                                            {copied ? <Check size={18} className='text-green-600' /> : <Copy size={18} />}
                                        </button>
                                    </div>
                                    <p className='text-xs mt-1 text-gray-600'>Keep this key safe. Share only in emergency situations.</p>

                                    <div className='flex gap-2 mt-5'>
                                        <button
                                            onClick={() => generateKey()}
                                            className="bg-teal-600  w-full text-white cursor-pointer px-3 flex items-center justify-center gap-2 py-2 rounded-xl"
                                        >
                                            <RefreshCw size={16} /> Regenerate
                                        </button>
                                        <button
                                            onClick={downloadQR}
                                            className="bg-gray-100 w-full text-gray-500 cursor-pointer px-3 flex items-center justify-center gap-2 py-2 rounded-xl"
                                        >
                                            Download QR code
                                        </button>
                                    </div>

                                    <div className='bg-yellow-50 border-1 border-yellow-200 rounded p-4 mt-4'>
                                        <h1 className='text-shadow-yellow-500 text-semibold'>Important Notes</h1>
                                        <ul className='list-disc list-inside text-sm text-yellow-900 mt-2 space-y-1'>
                                            <li>This key provides access to critical emergency information only</li>
                                            <li>Full medical records are not accessible via emergency access</li>
                                            <li>You can regenerate this key anytime to revoke previous access</li>
                                            <li>Consider printing the QR code to keep in your wallet</li>
                                        </ul>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="lucide lucide-qr-code h-16 w-16 text-gray-400 mx-auto mb-4"
                                    >
                                        <rect width="5" height="5" x="3" y="3" rx="1"></rect>
                                        <rect width="5" height="5" x="16" y="3" rx="1"></rect>
                                        <rect width="5" height="5" x="3" y="16" rx="1"></rect>
                                        <path d="M21 16h-3a2 2 0 0 0-2 2v3"></path>
                                        <path d="M21 21v.01"></path>
                                        <path d="M12 7v3a2 2 0 0 1-2 2H7"></path>
                                        <path d="M3 12h.01"></path>
                                        <path d="M12 3h.01"></path>
                                        <path d="M12 16v.01"></path>
                                        <path d="M16 12h1"></path>
                                        <path d="M21 12v.01"></path>
                                        <path d="M12 21v-1"></path>
                                    </svg>

                                    <p className="text-gray-600 mb-6">
                                        Generate a secure QR code and access key for emergency situations.
                                    </p>
                                    <button
                                        onClick={() => generateKey()}
                                        className="flex items-center space-x-2 px-6 py-3 bg-red-600 cursor-pointer text-white rounded-lg hover:bg-red-700 transition-colors mx-auto"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="lucide lucide-qr-code h-5 w-5"
                                        >
                                            <rect width="5" height="5" x="3" y="3" rx="1"></rect>
                                            <rect width="5" height="5" x="16" y="3" rx="1"></rect>
                                            <rect width="5" height="5" x="3" y="16" rx="1"></rect>
                                            <path d="M21 16h-3a2 2 0 0 0-2 2v3"></path>
                                            <path d="M21 21v.01"></path>
                                            <path d="M12 7v3a2 2 0 0 1-2 2H7"></path>
                                            <path d="M3 12h.01"></path>
                                            <path d="M12 3h.01"></path>
                                            <path d="M12 16v.01"></path>
                                            <path d="M16 12h1"></path>
                                            <path d="M21 12v.01"></path>
                                            <path d="M12 21v-1"></path>
                                        </svg>
                                        <span>Generate Emergency Access</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {isEmergencyOpen && (
                        <div className='w-full mt-6 rounded p-5 bg-blue-50 border-1 border-blue-200'>
                            <h1 className='text-blue-950 font-semibold'>How to use Emergency Access</h1>
                            <ul className="flex justify-between items-center mt-4">
                                <li className="space-x-3">
                                    <div className="bg-blue-600 text-white rounded-lg mb-2 w-8 h-8 flex items-center justify-center flex-shrink-0 text-sm font-semibold">1</div>
                                    <div>
                                        <p className="font-medium text-blue-950 mb-1">Print or Save</p>
                                        <p className="text-sm text-blue-900">Download the QR code or save the access key in a secure location</p>
                                    </div>
                                </li>
                                <li className="space-x-3">
                                    <div className="bg-blue-600 text-white rounded-lg mb-2 w-8 h-8 flex items-center justify-center flex-shrink-0 text-sm font-semibold">2</div>
                                    <div>
                                        <p className="font-medium text-blue-950 mb-1">Share in Emergency</p>
                                        <p className="text-sm text-blue-900">Allow paramedics or doctors to scan the QR code or enter the access key</p>
                                    </div>
                                </li>
                                <li className="space-x-3">
                                    <div className="bg-blue-600 text-white rounded-lg mb-2 w-8 h-8 flex items-center justify-center flex-shrink-0 text-sm font-semibold">2</div>
                                    <div>
                                        <p className="font-medium text-blue-950 mb-1">Instant Access</p>
                                        <p className="text-sm text-blue-900">Allow paramedics or doctors to scan the QR code or enter the access key</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default EmergencyAcessPage