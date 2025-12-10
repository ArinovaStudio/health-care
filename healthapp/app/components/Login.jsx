'use Client';
import React, { useState } from 'react'
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { logInAction } from '../actions/auth';

function Login({ isOpen, onClose, onSwitchToSignUp }) {

    const router = useRouter();
    const [user, setUser] = useState({
        email: "",
        password: ""
    })
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        try {
            setLoading(true);
            const res = await logInAction(user);
            if (res.success) {
                router.push('/patient')
                toast.success("Welcome Back ")
            }
            else {
                // Redirect directly if already logged in
                if (res.message === "User already logged in.") {
                    router.push('/patient');
                    toast.success("Welcome Back (Already Logged In)");
                    onClose();
                } else {
                    toast.error(res.message || "Login failed");
                }
            }
        } catch (error) {
            if (error.response?.status === 400 && error.response?.data?.message === "User already logged in.") {
                // Redirect directly if already logged in
                router.push('/patient');
                toast.success("Welcome Back ")
            } else if(error.response?.status === 400) {
                toast.error("Already Logged In")
                console.error(error);
            }
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen) return null;

    return (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
            <div className="rounded-lg bg-white p-8 w-full max-w-md shadow-5xl">
                <button onClick={onClose} className="text-gray-400 hover:text-gray-300 flex justify-end w-full">
                    <X className="w-5 h-5" />
                </button>
                <div className="flex flex-col justify-between mb-4">
                    <h2 className="text-4xl font-semibold mb-1">Welcome Back</h2>
                    <p className='text-sm text-gray-400'>Sign in to access your health records</p>
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
                        name='password'
                        placeholder='******'
                        className='w-full border border-gray-300 rounded-xl px-4 py-2 mt-1'
                    />
                </div>

                <button
                    onClick={handleLogin}
                    className='w-full text-white px-4 mb-2 py-2 rounded-md border bg-teal-600 text-lg font-semibold hover:bg-teal-500 hover:text-white transition-colors duration-300'>
                    {loading ? 'Logging...' : 'Sign In'}
                </button>

                <p className="w-full text-center text-gray-500">Don't have an Account?
                    <span
                        onClick={onSwitchToSignUp}
                        className="text-teal-600 font-semibold cursor-pointer hover:underline"> Sign Up</span>
                </p>
            </div>
        </div>
    )
}

export default Login