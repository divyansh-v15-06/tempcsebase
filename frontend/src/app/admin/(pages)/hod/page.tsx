'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { saveAs } from 'file-saver'
import { Button } from '@/components/ui/button'
import { MdDelete, MdModeEdit } from 'react-icons/md'
import { parse } from 'json2csv'
import { CircularProgress } from '@mui/material'
import AdminModalHod from '@/components/admin-components/Modals/AdminModalHod'


export default function HomeAdmin() {
    const [data, setData] = useState<{ id: number; photo: string; createdAt: string; updatedAt: string }[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [initialData, setInitialData] = useState<{ id: number; photo: string; createdAt: string; updatedAt: string } | undefined>(undefined)
    const [isLoading, setIsLoading] = useState(true)
    const [headers, setHeaders] = useState({})
    const [isUpdateModalOpen,setIsUpdateModalOpen] = useState(false)
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
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/hod/get`

        axios
            .get(urlWithParams)
            .then((response) => {
                console.log('response.data.data', response.data.data)
                setData(response.data.data)
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
            .delete(
                `${process.env.NEXT_PUBLIC_API_URL}/hod/delete/${id}`,
                {
                    headers,
                },
            )
            .then((response) => {
                toast.success('Project deleted successfully')
                fetchData()
            })
            .catch((error) => {
                toast.error('Error deleting project')
                console.error(error)
            })
    }

    const handleUpdate = (id) => {
        const project = data.find((item) => item.id === id);
        if (project) {
            setInitialData(project);
        }
        setIsUpdateModalOpen(true)
        
       
    }

    const handleModalSubmit = (formData) => {
        axios
            .post(`${process.env.NEXT_PUBLIC_API_URL}/hod`, formData, {
                headers,
            })
            .then((response) => {
                toast.success('Image added successfully')
                fetchData()
                setIsModalOpen(false)
            })
            .catch((error) => {
                toast.error('Error adding image')
                console.error(error)
            })
    }

    const handleUpdateSubmit = (formData, id) => {
        console.log('id', id)
        axios
            .post(
                `${process.env.NEXT_PUBLIC_API_URL}/hod/update/${id}`,
                formData,
                {
                    headers,
                },
            )
            .then((response) => {
                toast.success('Image added successfully')
                fetchData()
                setIsModalOpen(false)
            })
            .catch((error) => {
                toast.error('Error adding Image')
                console.error(error)
            })
    }

    return (
        <div>
            <div className='h-[92vh]'>
                <Toaster />
                <div className='flex justify-between items-center border-b-2 p-4'>
                    <h1 className='font-semibold text-2xl'>HOD</h1>
                    <div className='flex justify-center gap-8 '>
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            className='bg-slate-950 text-white border-3 border rounded-3xl px-4 py-2'
                        >
                            Add Hod
                        </Button>
                    </div>
                </div>

                <div className='font-bold text-2xl p-4 justify-center flex items-center'>
                    Uploaded Data:
                </div>

                <div className='flex '>
                    <div className='w-full'>
                        <div
                            className='gap-2 w-full  overflow-y-scroll'
                            id='projectsSection'
                        >
                            <Table
                                isLoading={isLoading}
                                projects={data}
                                onDelete={handleDelete}
                            />
                        </div>
                    </div>
                </div>

                <AdminModalHod
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleModalSubmit}
                />
                 
            </div>
        </div>
    )
}
function Table({ projects, isLoading, onDelete }) {
    return (
        <div className='font-sans relative'>
            {isLoading ? (
                <div className='absolute inset-0 flex items-center justify-center'>
                    <CircularProgress color='inherit' />
                </div>
            ) : (
                <div className='overflow-x-auto border rounded my-2 lg:mx-8'>
                    <table className='border-1 rounded border border-solid border-[#dde2e6] w-full'>
                        <thead>
                            <tr className='text-lg bg-[#f7dcdd]'>
                                
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                    Image
                                </th>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                    Name
                                </th>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                    Message
                                </th>
                                <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff]'>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects &&(
                                    <tr
                                        key={projects?.id}
                                        className={
                                            projects.id % 2 ? 'bg-gray-300' : ''
                                        }
                                    >
                                        
                                        <td className='p-2 text-left border border-1 max-w-[400px] border-solid border-black'>
                                            <img
                                                src={projects.image}
                                                alt={`${projects.name}'s photo`}
                                                className='h-16 w-16 object-cover rounded-full'
                                            />
                                        </td>
                                        <td className='p-2 text-center border border-1 border-solid border-black'>
                                            {projects.name}
                                        </td>
                                        <td className='p-2 text-center border border-1 border-solid border-black'>
                                            {projects.message}
                                        </td>
                                        <td className='text-center p-3 border-b border-l border-1 border-solid border-black'>
                                            <div className='flex justify-center gap-2'>
                                                <button
                                                    onClick={() =>
                                                        onDelete(projects.id)
                                                    }
                                                    className='p-2 bg-red-500 text-white rounded'
                                                >
                                                    <MdDelete />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) }
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
