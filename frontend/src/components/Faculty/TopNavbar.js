'use client' // Ensure this component can be used with client-side rendering
import React, { useEffect, useState } from 'react'
import { useUser } from '@/app/faculty/(pages)/UsernameProvider'
import Link from 'next/link'


const TopNavbar = () => {
    const { userId } = useUser()
    const [facultyDetails, setFacultyDetails] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        // Only fetch if userId is available
        if (!userId) return

        const fetchFacultyDetails = async () => {
            try {
                setLoading(true)
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/faculty/get/${userId}`,
                )
                if (!response.ok) {
                    throw new Error('Failed to fetch faculty details')
                }
                const data = await response.json();
                if (data.success && data?.data) {
                    setFacultyDetails(data?.data)
                    sessionStorage.setItem(
                        'facultyName',
                        data?.data?.name,
                    )
                } else {
                    throw new Error('Faculty details not found')
                }
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchFacultyDetails()
    }, [userId]) // Add userId as a dependency

    useEffect(() => {
        console.log('facultyDetails', facultyDetails)
    }, [facultyDetails])
    const handleLogout = () => {
        // Clear all local storage data
        sessionStorage.clear()
        // Optionally, redirect to login or homepage after logout
        window.location.href = '/login'
    }

    if (loading) {
        return (
            <nav className='bg-gray-800 shadow-md p-6 flex items-center justify-center'>
                <p className='text-black'>Loading...</p>
            </nav>
        )
    }

    if (error) {
        return (
            <nav className='bg-gray-800 shadow-md p-6 flex items-center justify-center'>
                <p className='text-black'>Error: {error}</p>
            </nav>
        )
    }

    if (!facultyDetails) {
        return (
            <nav className='bg-gray-800 shadow-md p-6 flex items-center justify-center'>
                <p className='text-black'>No faculty details available.</p>
            </nav>
        )
    }

    const { name, email, position: designation, photo } = facultyDetails

    return (
        <nav className='bg-gray-800 shadow-md p-6'>
            <div className='container mx-auto flex items-center justify-between'>
                <h1 className='font-semibold text-2xl text-white'>
                    Faculty Portfolio
                </h1>

                <div className='flex items-center space-x-4'>
                    <div className='w-12 h-12 relative'>
                        <img
                            src={photo}
                            alt={name}
                            className='rounded-full w-16 h-16'
                        />
                    </div>
                    <div>
                        <h2 className='text-lg font-semibold text-white'>
                            {name}
                        </h2>
                        <p className='text-sm text-white'>{designation}</p>
                        <p className='text-sm text-white'>{email}</p>
                    </div>
                    {/* Add the Logout Button */}
                    <button
                        onClick={handleLogout}
                        className='bg-red-500 text-white px-4 py-2 rounded-md ml-4'
                    >
                        Log Out
                    </button>
                    <Link
                     href={`/faculty/changepassword`}
                        className='bg-blue-500 text-white px-4 py-2 rounded-md ml-4'
                        >Change Password</Link>
                    
                </div>
            </div>
        </nav>
    )
}

export default TopNavbar