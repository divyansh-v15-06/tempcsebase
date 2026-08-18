'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import CSVUploadModal from '@/components/admin-components/Modals/adminCsvModal'
import { saveAs } from 'file-saver'
import { parse } from 'json2csv'
import { CircularProgress } from '@mui/material'
import AdminModalLabs from '@/components/admin-components/Modals/adminModalLabs'
import { MdDelete, MdModeEdit } from 'react-icons/md'
import LabsUpdateModal from '@/components/admin-components/updateModals/labsUpdateModal'

type Props = {}

export default function ProgrammsOffered({}: Props) {
    const [data, setData] = useState<any>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isCSVModalOpen, setIsCSVModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [headers, setHeaders] = useState({})
    const [isUpdateModalOpen,setIsUpdateModalOpen] = useState(false)
    const [initialData, setInitialData] = useState({})


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
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/labs/get`

        axios
            .get(urlWithParams)
            .then((response) => {
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
            .delete(`${process.env.NEXT_PUBLIC_API_URL}/labs/delete/${id}`, {
                headers,
            })
            .then(() => {
                toast.success('Entry deleted successfully')
                fetchData()
            })
            .catch((error) => {
                toast.error('Error deleting entry')
                console.error(error)
            })
    }

    const handleUpdate = (id) => {
        setIsUpdateModalOpen(true)
        const selectedData = data.find((item) => item.id === id)
        if (selectedData) {
            setInitialData(selectedData)
        } else {
            console.error('Selected data not found:', id)
        }


        //toast('Update functionality to be implemented')
    }
    const handleUpdateSubmit = (formData, id) => {
        console.log('id', id)
        axios
            .put(
                `${process.env.NEXT_PUBLIC_API_URL}/labs/update/${id}`,
                formData,
                {
                    headers,
                },
            )
            .then((response) => {
                toast.success('Labs added successfully')
                fetchData()
                setIsModalOpen(false)
            })
            .catch((error) => {
                toast.error('Error adding Labs')
                console.error(error)
            })
    }


    const handleExportCSV = () => {
        const fields = ['id', 'title', 'description', 'link', 'photo'] 
        const opts = { fields }
        try {
            const csv = parse(data, opts)
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
            saveAs(blob, 'programs_data.csv')
        } catch (err) {
            console.error('Error exporting data to CSV:', err)
        }
    }

    const handleModalSubmit = (formData) => {
        axios
            .post(`${process.env.NEXT_PUBLIC_API_URL}/labs`, formData, {
                headers,
            })
            .then(() => {
                toast.success('Entry added successfully')
                fetchData()
                setIsModalOpen(false)
            })
            .catch((error) => {
                toast.error('Error adding entry')
                console.error(error)
            })
    }

    const handleCSVSubmit = ({file,type}) => {
        const formData = new FormData()
        formData.append('avatar', file)

        axios
            .post(`${process.env.NEXT_PUBLIC_API_URL}/labs/bulk`, formData, {
                headers: {
                    ...headers,
                    'Content-Type': 'file',
                },
            })
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
        <div>
            <div className='h-[92vh]'>
                <Toaster />
                <div className='flex justify-between items-center border-b-2 p-4'>
                    <h1 className='font-semibold text-2xl'>Labs</h1>
                    <div className='flex justify-center gap-8 '>
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            className='bg-slate-950 text-white border-3 border rounded-3xl px-4 py-2'
                        >
                            Add New lab
                        </Button>
                        {/* <Button
                            onClick={() => setIsCSVModalOpen(true)}
                            className='bg-slate-950 text-white border-3 border rounded-3xl px-4 py-2'
                        >
                            Upload CSV
                        </Button> */}
                        <Button
                            onClick={handleExportCSV}
                            className='bg-emerald-800 text-white border-3 border rounded-3xl px-4 py-2'
                        >
                            Export CSV
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
                            {isLoading ? (
                                <div className='flex items-center justify-center'>
                                    <CircularProgress color='inherit' />
                                </div>
                            ) : (
                                <Table
                                    data={data}
                                    onDelete={handleDelete}
                                    onUpdate={handleUpdate}
                                />
                            )}
                        </div>
                    </div>
                </div>

                <AdminModalLabs
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleModalSubmit}
                />

                <CSVUploadModal
                    isOpen={isCSVModalOpen}
                    onClose={() => setIsCSVModalOpen(false)}
                    onSubmit={handleCSVSubmit}
                />
                <LabsUpdateModal
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                onSubmit={handleUpdateSubmit}
                initialData={initialData}
            />
            </div>
        </div>
    )
}

function Table({ data, onUpdate, onDelete }) {
    return (
        <div className='font-sans relative'>
            <div className='overflow-x-auto border rounded my-2 lg:mx-8'>
                <table className='border-1 rounded border border-solid border-[#dde2e6] w-full'>
                    <thead>
                        <tr className='text-lg bg-[#f7dcdd]'>
                            <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6] w-1/12'>
                                Sr. No.
                            </th>
                            <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                Labname
                            </th>
                            <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                OIC
                            </th>
                            <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                Technician
                            </th>
                            
                            <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff]'>
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data && data.length > 0 ? (
                            data.map((item, index) => (
                                <tr
                                    key={item.id}
                                    className={index % 2 ? 'bg-gray-300' : ''}
                                >
                                    <td className='p-2 text-center border-b border-r border-l border-solid border-black'>
                                        {index + 1}
                                    </td>
                                    <td className='p-2 text-left border border-1 border-solid border-black'>
                                        {item.title}
                                    </td>
                                    <td className='p-2 text-left border border-1 border-solid border-black'>
                                        {item.OIC || 'N/A'}
                                    </td>
                                    <td className='p-2 text-left border border-1 border-solid border-black'>
                                        {item.technician || 'N/A'}
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
                                <td className='p-4 text-center' colSpan={7}>
                                    No data
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
