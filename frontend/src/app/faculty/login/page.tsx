'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, User } from 'lucide-react'

export default function LoginPage() {
    const [userId, setUserId] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [responseMessage, setResponseMessage] = useState('')
    const router = useRouter()

    const handleSubmit = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/signIn`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        password: password,
                        uniqueFacultyId: userId.toUpperCase(),
                    }),
                }
            )

            const data = await response.json()
            if (response.ok) {
                sessionStorage.setItem('userId', userId)
                sessionStorage.setItem('access_token', data.data.token)
                router.push('/faculty/')
            } else {
                setResponseMessage(data.message || 'Login failed. Please try again.')
            }
        } catch (error) {
            console.error('Error:', error)
            setResponseMessage('An error occurred while logging in.')
        }
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center px-4'>
            <div className='bg-white shadow-xl rounded-2xl p-8 max-w-md w-full'>
                <User className='w-16 h-16 mx-auto text-blue-600 mb-4 border-4 border-blue-600 p-2 rounded-full' />
                <h2 className='text-3xl font-semibold mb-6 text-center text-gray-800'>
                    Faculty Login
                </h2>

                {responseMessage && (
                    <div className='mb-4 text-sm text-red-600 text-center'>
                        {responseMessage}
                    </div>
                )}

                <div className='mb-4'>
                    <label className='block mb-1 text-sm font-medium text-gray-700'>
                        Unique Faculty ID
                    </label>
                    <input
                        type='text'
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        placeholder='Enter Faculty ID'
                        className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                </div>

                <div className='mb-6 relative'>
                    <label className='block mb-1 text-sm font-medium text-gray-700'>
                        Password
                    </label>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder='Enter Password'
                        className='w-full px-4 py-2 border border-gray-300 rounded-md pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                    <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute right-3 top-9 text-gray-600 hover:text-gray-800'
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>

                <button
                    onClick={handleSubmit}
                    className='w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition font-medium'
                >
                    Log In
                </button>

                <div className='mt-4 text-sm text-center'>
                    <button
                        onClick={() => (window.location.href = '/forgotpassword')}
                        className='text-blue-600 hover:underline'
                    >
                        Forgot Password?
                    </button>
                </div>

                <div className='mt-6 flex justify-between gap-2'>
                    <button
                        onClick={() => router.push('/')}
                        className='w-full bg-gray-800 text-white py-2 rounded-md hover:bg-gray-900 transition'
                    >
                        Home
                    </button>
                    <button
                        onClick={() => router.push('/admin')}
                        className='w-full bg-gray-800 text-white py-2 rounded-md hover:bg-gray-900 transition'
                    >
                        Admin Login
                    </button>
                </div>
            </div>
        </div>
    )
}
