'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { MdDelete, MdModeEdit } from 'react-icons/md'
import { CircularProgress } from '@mui/material'
import AdminAboutUs from '@/components/admin-components/Modals/adminModalAboutUs'

const InputField = ({ label, value, onChange }) => (
    <div className='flex items-center my-2'>
        <label className='text-lg mr-2'>{label}:</label>
        <input
            type='text'
            className='border rounded px-2 py-1 flex-1'
            value={value}
            onChange={onChange}
        />
    </div>
)

export default function AboutUsAdmin() {
    const [data, setData] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isCSVModalOpen, setIsCSVModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [headers, setHeaders] = useState({})

    useEffect(() => {
        // Check if we are running on the client side
        if (typeof window !== 'undefined') {
            const token = sessionStorage.getItem('auth')
            setHeaders({
                                   Authorization: `Bearer ${sessionStorage.getItem("access_token") as string}`,
            })
        }
    }, [])
    const fetchData = () => {
        setIsLoading(true)
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/aboutus/get`

        axios
            .get(urlWithParams)
            .then((response) => {
                setData(response.data.data[0])
                setIsLoading(false)
            })
            .catch((error) => {
                console.error('Error fetching data:', error)
                setIsLoading(false)
            })
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleDelete = (id) => {

        const userConfirmed = window.confirm(
            'Are you sure you want to delete this ? This action cannot be undone.',
        )
        if (!userConfirmed) {
            return // Exit if the user cancels
        }

        axios
            .delete(`${process.env.NEXT_PUBLIC_API_URL}/aboutus/delete/${id}`, {
                headers,
            })
            .then((response) => {
                toast.success('Entry deleted successfully')
                fetchData()
            })
            .catch((error) => {
                toast.error('Error deleting entry')
                console.error(error)
            })
    }

    const handleUpdate = (id) => {
        toast('Update functionality to be implemented')
    }

    const handleModalSubmit = (formData) => {
        axios
            .post(`${process.env.NEXT_PUBLIC_API_URL}/aboutus`, formData, {
                headers,
            })
            .then((response) => {
                toast.success('Entry added successfully')
                fetchData()
                setIsModalOpen(false)
            })
            .catch((error) => {
                toast.error('Error adding entry')
                console.error(error)
            })
    }

    return (
        <div>
            <Toaster />
            <div className='h-[92vh]'>
                <div className='flex justify-between items-center border-b-2 p-4'>
                    <h1 className='font-semibold text-2xl'>About Us</h1>
                    <div className='flex justify-center gap-8'>
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            className='bg-slate-950 text-white border-3 border rounded-3xl px-4 py-2'
                        >
                            Add Description
                        </Button>
                    </div>
                </div>

                <div className='font-bold text-2xl p-4 justify-center flex items-center'>
                    Current Description:
                </div>

                <div className='flex'>
                    <div className='w-full'>
                        <div
                            className='gap-2 w-full  overflow-y-scroll'
                            id='aboutUsSection'
                        >
                            <div className='h-[92vh] p-4'>
                                <div className='p-4 bg-white rounded shadow'>
                                    {isLoading ? (
                                        <p>Loading...</p>
                                    ) : (
                                        <p className='mb-4'>
                                            {/* @ts-ignore */}
                                            {data?.description ||
                                                'No description available'}
                                        </p>
                                    )}
                                </div>

                                {/* <form onSubmit={handleUpdate} className='p-4 bg-white rounded shadow mt-4'>
                    <h2 className='text-lg font-bold mb-2'>Update Description:</h2>
                    <InputField
                        label='Description'
                        value={data.description}
                        onChange={(e) =>
                            setData((prevData) => ({
                                ...prevData,
                                description: e.target.value,
                            }))
                        }
                    />
                    <Button type='submit' className='bg-blue-500 text-white rounded px-4 py-2 mt-4'>
                        Update
                    </Button>
                </form> */}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add Modals for adding data and CSV Upload */}
                {/* Replace with actual modal components as needed */}
                <AdminAboutUs
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleModalSubmit}
                />
            </div>
        </div>
    )
}
