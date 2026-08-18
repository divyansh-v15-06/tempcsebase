'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    UserCircleIcon,
    AcademicCapIcon,
    HomeIcon,
} from '@heroicons/react/24/outline'

export default function LoginPage() {
    const [responseMessage, setResponseMessage] = useState('')
    const router = useRouter()

    return (
        <div className='flex items-center justify-center min-h-screen bg-gradient-to-tr from-gray-50 to-gray-200'>
            <div className='p-8 bg-white rounded-lg shadow-lg w-full max-w-md space-y-8'>
                <h2 className='text-3xl font-bold text-center text-gray-800'>
                    Department Login
                </h2>
                <p className='text-center text-gray-500'>
                    Please select your role to continue
                </p>

                <div className='space-y-4'>
                    <button
                        className='flex items-center justify-center w-full p-3 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-200'
                        onClick={() => router.push('/admin/login')}
                    >
                        <AcademicCapIcon className='w-6 h-6 mr-2' />
                        Admin Login
                    </button>
                    <button
                        className='flex items-center justify-center w-full p-3 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-200'
                        onClick={() => router.push('/faculty/login')}
                    >
                        <UserCircleIcon className='w-6 h-6 mr-2' />
                        Faculty Login
                    </button>
                </div>

                <button
                    className='flex items-center justify-center w-full p-3 mt-6 text-lg font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-all duration-200'
                    onClick={() => router.push('/')}
                >
                    <HomeIcon className='w-6 h-6 mr-2' />
                    Return Home
                </button>
            </div>
        </div>
    )
}
