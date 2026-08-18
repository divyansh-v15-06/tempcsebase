'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

const ForgotPassword = () => {
    const [facultyId, setFacultyId] = useState('')
    const [responseMessage, setResponseMessage] = useState('')
    const [showModal, setShowModal] = useState(false)
    const router = useRouter()

    const handleSubmit = async (event) => {
        event.preventDefault() // Prevent the default form submission

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/passwordreset`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        uniqueFacultyId: facultyId.toUpperCase(),
                    }),
                },
            )

            const data = await response.json()
            if (response.ok) {
                //setResponseMessage('Request sent successfully!');
                setShowModal(true)
            } else {
                setResponseMessage(data.message || 'Error sending request.')
                console.log(response);
                
            }
        } catch (error) {
            setResponseMessage('Error sending request.')
            console.error('Error:', error)
        }
    }
    const handleLoginRedirect = () => {
        setShowModal(false)
        router.push('/login')
    }

    return (
        <div className='flex flex-col items-center justify-center h-screen bg-gray-100'>
            <div className='bg-white shadow-md rounded-lg p-8 w-96'>
                <h1 className='text-2xl font-semibold mb-6 text-center'>
                    Forgot Password
                </h1>
                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div>
                        <label
                            htmlFor='facultyId'
                            className='block text-sm font-medium text-gray-700'
                        >
                            Unique Faculty ID:
                        </label>
                        <input
                            type='text'
                            id='facultyId'
                            value={facultyId}
                            onChange={(e) => setFacultyId(e.target.value)}
                            required
                            className='mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-300'
                        />
                    </div>
                    <button
                        type='submit'
                        className='w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition duration-100'
                    >
                        Reset Password
                    </button>
                </form>
                {responseMessage && !showModal && (
                    <div
                        className={`mt-4 text-center ${
                            responseMessage.includes('successfully')
                                ? 'text-green-600'
                                : 'text-red-600'
                        }`}
                    >
                        {responseMessage}
                    </div>
                )}
            </div>
            {showModal && (
                <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50'>
                    <div className='bg-white p-6 rounded-lg shadow-lg w-80'>
                        <h2 className='text-xl font-semibold mb-4 text-center'>
                            Password Reset Successful
                        </h2>
                        <p className='text-center mb-6'>
                            Password reset link has been sent to your email.
                        </p>
                        <button
                            onClick={handleLoginRedirect}
                            className='w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition duration-200'
                        >
                            Login
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ForgotPassword
