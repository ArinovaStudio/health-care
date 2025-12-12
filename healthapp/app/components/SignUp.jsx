'use Client';
import React, { useState } from 'react'
import { X } from 'lucide-react';
import OTP from './verifyOTP';
import { signupAction } from '../actions/auth';
import toast from 'react-hot-toast';

function SignUp({ isOpen, onClose, onSwitchToLogin, onOpenOtp }) {

    const [otp, setOtp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState({
        name: "",
        email: "",
        password: ""
    })

    const handleSignup = async () => {
        try {
            setLoading(true);
            
            const res = await signupAction(user)
            if (res.status === 200 ||   res.success) { 
                localStorage.setItem("userEmail", user.email);  
                onClose();         
                onOpenOtp();
                setUser({})
                toast.success("Account created successfully! Please verify your email.");
            }

            if(res.status === 400 ) {
                toast.error(res.message || "Email is already registered.");
            }
            
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
            <div className="rounded-lg bg-white p-8 w-full max-w-md shadow-5xl">
                <button onClick={onClose} className="text-gray-400 hover:text-gray-300 flex justify-end w-full">
                    <X className="w-5 h-5" />
                </button>
                <div className="flex flex-col justify-between mb-4">
                    <h2 className="text-4xl font-semibold mb-1">Get Started</h2>
                    <p className='text-sm text-gray-400'>Create your account to manage your health data</p>
                </div>

                <div className="flex flex-col justify-between mb-4">
                    <label htmlFor="userName" className='text-md'>Name</label>
                    <input
                        type="text"
                        onChange={(e) => setUser({ ...user, name: e.target.value })}
                        value={user.name}
                        name='name'
                        placeholder='Ramesh Kumar'
                        className='w-full border border-gray-300 rounded-xl px-4 py-2 mt-1'
                    />
                </div>

                <div className="flex flex-col justify-between mb-4">
                    <label htmlFor="Email" className='text-md'>Email Address</label>
                    <input
                        type="email"
                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                        value={user.email}
                        name='email'
                        placeholder='you@gmail.com'
                        className='w-full border border-gray-300 rounded-xl px-4 py-2 mt-1'
                    />
                </div>

                <div className="flex flex-col justify-between mb-4">
                    <label htmlFor="password" className='text-md'>Password</label>
                    <input
                        type="password"
                        onChange={(e) => setUser({ ...user, password: e.target.value })}
                        value={user.password}
                        placeholder='******'
                        className='w-full border border-gray-300 rounded-xl px-4 py-2 mt-1'
                    />
                </div>

                <button
                    onClick={handleSignup}
                    className='w-full text-white px-4 mb-2 py-2 rounded-md border bg-teal-600 text-lg font-semibold hover:bg-teal-500 hover:text-white transition-colors duration-300'>
                    { loading ? 'Signing...' : 'Create Account'}
                </button>

                <p className="w-full text-center text-gray-500">Already had an Account?
                    <span
                        onClick={onSwitchToLogin}
                        className="text-teal-600 font-semibold cursor-pointer hover:underline"> Sign In</span>
                </p>
            </div>
            <OTP
                isOpen={otp}
                onClose={() => setOtp(false)}
            />
        </div>
    )
}

export default SignUp