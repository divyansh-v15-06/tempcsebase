'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { saveAs } from 'file-saver'
import { Button } from '@/components/ui/button'
import { MdDelete, MdModeEdit } from 'react-icons/md'
import { parse } from 'json2csv'
import AdminModalAchievements from '@/components/admin-components/Modals/adminModalAchievements'
import CSVUploadModal from '@/components/admin-components/Modals/adminCsvModal'
import { CircularProgress } from '@mui/material'
import AchievementsUpdateModal from '@/components/admin-components/updateModals/achievementsUpdateModal'
type Announcement = {
    id: string
    title: string
    date: string
    description: string
    link: string
}

export default function AdminAnnouncements() {
    const [data, setData] = useState<Announcement[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isCSVModalOpen, setIsCSVModalOpen] = useState(false)
    const [headers, setHeaders] = useState({})
    const [initialData, setInitialData] = useState<Announcement | undefined>(undefined)
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
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
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/achievement/get`

        axios
            .get(urlWithParams)
            .then((response) => {
                setData(response.data.data)
            })
            .catch((error) => {
                console.error('Error fetching data:', error)
            })
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleDelete = (id: string) => {

        const userConfirmed = window.confirm(
            'Are you sure you want to delete this ? This action cannot be undone.',
        )
        if (!userConfirmed) {
            return // Exit if the user cancels
        }

        axios
            .delete(
                `${process.env.NEXT_PUBLIC_API_URL}/achievement/delete/${id}`,
                {
                    headers,
                },
            )
            .then(() => {
                toast.success('Announcement deleted successfully')
                fetchData()
            })
            .catch((error) => {
                toast.error('Error deleting announcement')
                console.error(error)
            })
    }

    const handleExportCSV = () => {
        const fields = [
            'id',
            'title',
            'date',
            'description',
            'photo',
            'pdfLink',
        ]
        const opts = { fields }
        try {
            const csv = parse(data, opts)
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
            saveAs(blob, 'announcements_data.csv')
        } catch (err) {
            console.error('Error exporting data to CSV:', err)
        }
    }
    // Handle dynamic CSV download
    const handleDownloadTemplate = () => {
        const inputFields = 'name,position,phone_no,email,portfolio,photo'
        const fieldsArray = inputFields.split(',')

        // Convert the fields to a CSV string
        const csvContent = fieldsArray.join(',') + '\n'

        // Create a Blob from the CSV string
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })

        // Use file-saver to trigger the download
        saveAs(blob, 'template.csv')
    }
    const handleModalSubmit = (formData) => {
        axios
            .post(`${process.env.NEXT_PUBLIC_API_URL}/achievement`, formData, {
                headers,
            })
            .then(() => {
                toast.success('Announcement added successfully')
                fetchData()
                setIsModalOpen(false)
            })
            .catch((error) => {
                toast.error('Error adding announcement')
                console.error(error)
            })
    }
    const handleUpdateSubmit = (formData, id) => {
        console.log('id', id)
        axios
            .patch(
                `${process.env.NEXT_PUBLIC_API_URL}/achievement/update/${id}`,
                formData,
                {
                    headers,
                },
            )
            .then((response) => {
                toast.success('Publication added successfully')
                fetchData()
                setIsModalOpen(false)
            })
            .catch((error) => {
                toast.error('Error adding publication')
                console.error(error)
            })
    }
    const handleUpdate = (id) => {
        const announcement=data.find((item) => item.id === id)
        console.log(announcement);
        
        setInitialData(announcement)
        setIsUpdateModalOpen(true)

        // toast('Update functionality to be implemented')
    }

    const handleCSVSubmit = ({ file, type }) => {
        const formData = new FormData()
        formData.append('avatar', file)

        axios
            .post(
                `${process.env.NEXT_PUBLIC_API_URL}/achievement/bulk`,
                formData,
                {
                    headers: {
                        ...headers,
                        'Content-Type': 'file',
                    },
                },
            )
            .then(() => {
                toast.success('CSV uploaded successfully')
                fetchData()
                setIsCSVModalOpen(false)
            })
            .catch((error) => {
                toast.error('Error uploading CSV')
                console.error(error)
            })
    }

    return (
        <div className='h-[92vh]'>
            <div className='flex justify-between items-center border-b-2 p-4'>
                <h1 className='font-semibold text-2xl'>Achievements Page</h1>
                <div className='flex justify-center gap-8 '>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className='bg-slate-950 text-white border-3 border rounded-3xl px-4 py-2'
                    >
                        Add Achievements
                    </Button>
                    <Button
                        onClick={() => setIsCSVModalOpen(true)}
                        className='bg-slate-950 text-white border-3 border rounded-3xl px-4 py-2'
                    >
                        Upload CSV
                    </Button>
                    <Button
                        onClick={handleExportCSV}
                        className='bg-emerald-800 text-white border-3 border rounded-3xl px-4 py-2'
                    >
                        Export CSV
                    </Button>
                    <Button
                        onClick={handleDownloadTemplate}
                        className='bg-slate-950 text-white border-3 border rounded-3xl px-4 py-2'
                    >
                        Download Template
                    </Button>
                </div>
            </div>

            <div className='font-bold text-2xl p-4 justify-center flex items-center'>
                Uploaded Achievements:
            </div>

            <div className='flex '>
                <div className='w-full'>
                    <div className='gap-2 w-full  ' id='announcementsSection'>
                        <Table
                            announcements={data}
                            onDelete={handleDelete}
                            onUpdate={handleUpdate}
                        />
                    </div>
                </div>
            </div>

            <AdminModalAchievements
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
            />

            <CSVUploadModal
                isOpen={isCSVModalOpen}
                onClose={() => setIsCSVModalOpen(false)}
                onSubmit={handleCSVSubmit}
            />
              <AchievementsUpdateModal
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                onSubmit={handleUpdateSubmit}
                initialData={initialData}
            />
        </div>
    )
}

function Table({ announcements, onDelete, onUpdate }) {
    return (
        <div className='font-sans relative'>
            {announcements.length === 0 ? (
                <div className='absolute inset-0 flex items-center justify-center'>
                    <CircularProgress color='inherit' />
                </div>
            ) : (
                <div className='overflow-x-auto border rounded my-2 lg:mx-8'>
                    <table className='border-1 rounded border border-solid border-[#dde2e6] w-full'>
                        <thead>
                            <tr className='text-lg bg-[#f7dcdd]'>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6] w-1/12'>
                                    Sr. No.
                                </th>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6] w-1/5'>
                                    Title
                                </th>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f]  text-[#fff] border border-1 border-[#dde2e6] w-1/2.5'>
                                    Description
                                </th>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6] w-1/12'>
                                    Date
                                </th>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6] w-1/12'>
                                    Photo
                                </th>
                                <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff]'>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {announcements && announcements.length > 0 ? (
                                announcements.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        className={
                                            index % 2 ? 'bg-gray-300' : ''
                                        }
                                    >
                                        <td className='p-2 text-center border-b border-r border-l border-solid border-black'>
                                            {index + 1}
                                        </td>
                                        <td className='p-2 text-left border border-1 border-solid border-black'>
                                            {item.title}
                                        </td>
                                        <td className='p-2 text-left border border-1  w-[1200px] border-solid border-black'>
                                            <span className='text-[#000] font-semibold tracking-tighter'>
                                                {item.description}
                                            </span>
                                        </td>
                                        <td className='p-2 text-center border border-1 border-solid border-black'>
                                            {new Date(item.date).toLocaleDateString('en-GB')}
                                        </td>
                                        <td className='p-2 text-left border border-1 border-solid border-black'>
                                            {item.photo ? (
                                                <img
                                                    src={item.photo}
                                                    alt={item.title}
                                                    className='w-20 h-20 object-cover'
                                                />
                                            ) : (
                                                'No Photo'
                                            )}
                                        </td>
                                        <td className='text-center p-3 border-b border-l border-1 border-solid border-black'>
                                            <div className='flex justify-center gap-2'>
                                                <button
                                                    onClick={() =>
                                                        onDelete(item.id)
                                                    }
                                                    className='p-2 bg-red-500 text-white rounded'
                                                >
                                                    <MdDelete />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        onUpdate(item.id)
                                                    }
                                                    className='p-2 bg-[#10132b] text-white rounded'
                                                >
                                                    <MdModeEdit />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className='p-4 text-center'>No data</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
