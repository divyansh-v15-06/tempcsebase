'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import axios from 'axios'

export default function LoginPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        uniqueFacultyId: '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    const [isSubmitted, setIsSubmitted] = useState(false)
    const [responseMessage, setResponseMessage] = useState('')
    const [passwordStrength, setPasswordStrength] = useState('')
    const [showOverlay, setShowOverlay] = useState(false)
    const router = useRouter()

    const getPasswordStrength = (password) => {
        if (!password) return ''

        const checks = [
            password.length >= 8,
            /[A-Z]/.test(password),
            /[a-z]/.test(password),
            /\d/.test(password),
            /[^A-Za-z0-9]/.test(password)
        ]

        const score = checks.filter(Boolean).length

        if (score <= 2) return 'Weak'
        if (score === 3 || score === 4) return 'Moderate'
        return 'Strong'
    }

    const handleSubmit = (formData) => {
        const { oldPassword, newPassword, confirmPassword } = formData

        if (!oldPassword || !newPassword || !confirmPassword) {
            toast.error('All password fields must be filled')
            return
        }

        if (newPassword !== confirmPassword) {
            toast.error('New password and confirm password do not match')
            return
        }

        setIsSubmitted(true)

        axios
            .patch(`${process.env.NEXT_PUBLIC_API_URL}/auth/updatePass`,
                formData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${sessionStorage.getItem('access_token')}`
                    }
                }
            )
            .then(() => {
                toast.success('Password updated successfully')
                setFormData({
                    name: '',
                    email: '',
                    uniqueFacultyId: '',
                    oldPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                })
                setPasswordStrength('')
                setShowOverlay(true)

                setTimeout(() => {
                    setShowOverlay(false)
                }, 2000)
            })
            .catch((error) => {
                console.error(error)
                toast.error(error?.response?.data?.error?.explanation || 'Something went wrong')
            })
            .finally(() => {
                setIsSubmitted(false)
            })
    }

    const handleChange = (e) => {
        const { id, value } = e.target
        setFormData((prev) => ({ ...prev, [id]: value }))

        if (id === 'newPassword') {
            setPasswordStrength(getPasswordStrength(value))
        }
    }

    const getStrengthColor = (strength) => {
        switch (strength) {
            case 'Weak':
                return 'text-red-500'
            case 'Moderate':
                return 'text-yellow-500'
            case 'Strong':
                return 'text-green-600'
            default:
                return ''
        }
    }

    return (
        <div className='relative flex items-center justify-center min-h-screen bg-gray-100'>
            <div className='p-6 bg-white rounded shadow-md w-[30vw]'>
                <h2 className='mb-4 text-2xl font-bold'>Update Faculty Password</h2>
                {isSubmitted ? (
                    <div className='mb-4 text-blue-600'>Please wait...</div>
                ) : (
                    <>
                        {responseMessage && (
                            <div className='mb-4 text-red-600'>{responseMessage}</div>
                        )}
                        <input
                            type='password'
                            id='oldPassword'
                            value={formData.oldPassword}
                            onChange={handleChange}
                            placeholder='Old Password'
                            className='w-full p-2 mb-4 border rounded border-gray-300'
                        />
                        <input
                            type='password'
                            id='newPassword'
                            value={formData.newPassword}
                            onChange={handleChange}
                            placeholder='New Password'
                            className='w-full p-2 mb-2 border rounded border-gray-300'
                        />
                        {formData.newPassword && (
                            <div className={`mb-2 text-sm font-medium ${getStrengthColor(passwordStrength)}`}>
                                Password Strength: {passwordStrength}
                            </div>
                        )}
                        <input
                            type='password'
                            id='confirmPassword'
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder='Confirm New Password'
                            className='w-full p-2 mb-4 border rounded border-gray-300'
                        />
                        <button
                            className='w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600 mb-4'
                            onClick={() => handleSubmit(formData)}
                        >
                            Update Password
                        </button>
                    </>
                )}
            </div>

            {showOverlay && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="px-6 py-4 text-white bg-green-600 rounded-lg shadow-lg text-xl">
                        Password changed successfully!
                    </div>
                </div>
            )}
        </div>
    )
}
