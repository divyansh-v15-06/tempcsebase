'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { saveAs } from 'file-saver'
import { Button } from '@/components/ui/button'
import { MdDelete, MdModeEdit } from 'react-icons/md'
import { parse } from 'json2csv'
import { CircularProgress } from '@mui/material'
import AdminModalEquipment from '@/components/admin-components/Modals/adminmodalEquipment'
import Equipmentmodal from '@/components/research-components/EquipmentModal.'
import AdminEquipmentUpdate from '@/components/admin-components/updateModals/AdminEquipmentUpdate'
import FilterOptions from '@/components/people-components/filterOptions'


export default function HomeAdmin() {
    const [data, setData] = useState<{
        id: number;
        name: string;
        quantity: number;
        date: string;
        stock: string;
        invoice: string;
        indenter: string;
        vender: string;
        addressAndCon: string;
        amount: number;
        academicSession: string;
        createdAt: string; updatedAt: string
    }[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [initialData, setInitialData] = useState<{
        id: number;
        name: string;
        quantity: number;
        date: string;
        stock: string;
        invoice: string;
        indenter: string;
        vender: string;
        addressAndCon: string;
        amount: number;
        academicSession: string;
        createdAt: string; updatedAt: string
    } | undefined>(undefined)
    const [isLoading, setIsLoading] = useState(true)
    const [headers, setHeaders] = useState({})
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
    const [filterValue, setFilterValue] = useState<string>(' ')
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
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/equipment/get`

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
                `${process.env.NEXT_PUBLIC_API_URL}/equipment/delete/${id}`,
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
            .post(`${process.env.NEXT_PUBLIC_API_URL}/equipment`, formData, {
                headers,
            })
            .then((response) => {
                toast.success('Equipment added successfully')
                fetchData()
                setIsModalOpen(false)
            })
            .catch((error) => {
                toast.error('Error adding Equipment')
                console.error(error)
            })
    }

    const handleUpdateSubmit = (formData, id) => {
        console.log('id', id)
        axios
            .put(
                `${process.env.NEXT_PUBLIC_API_URL}/equipment/update/${id}`,
                formData,
                {
                    headers,
                },
            )
            .then((response) => {
                toast.success('Update Equipment successfully')
                fetchData()
                setIsModalOpen(false)
            })
            .catch((error) => {
                toast.error('Error Updating Equipment')
                console.error(error)
            })
    }
    const FYoption=[
        { value: ' ', title: 'All' },
        { value: '2026-2027', title: '2026-2027' },
        { value: '2025-2026', title: '2025-2026' },
        { value: '2024-2025', title: '2024-2025' },
        { value: '2023-2024', title: '2023-2024' },
        { value: '2022-2023', title: '2022-2023' },
        { value: '2021-2022', title: '2021-2022' },
        { value: '2020-2021', title: '2020-2021' },
        { value: '2019-2020', title: '2019-2020' },
        { value: '2018-2019', title: '2018-2019' },
        { value: '2017-2018', title: '2017-2018' },
        { value: '2016-2017', title: '2016-2017' },
        { value: '2015-2016', title: '2015-2016' },
        { value: '2014-2015', title: '2014-2015' },
        { value: '2013-2014', title: '2013-2014' },
        { value: '2012-2013', title: '2012-2013' },
    ]

    return (
        <div>
            <div className='h-[92vh]'>
                <Toaster />
                <div className='flex justify-between items-center border-b-2 p-4'>
                    <h1 className='font-semibold text-2xl'>Equipment Data</h1>
                    <div className='flex justify-center gap-8 '>
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            className='bg-slate-950 text-white border-3 border rounded-3xl px-4 py-2'
                        >
                            Add Equipment
                        </Button>
                    </div>
                </div>
                <div className='flex justify-between items-center border-b-2 p-4'>
                    <div className='flex gap-4'>

                        <FilterOptions
                            filterName='Finacial Year'
                            setFilterValue={setFilterValue}
                            options={FYoption}
                        />
                        
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
                                onUpdate={handleUpdate}
                                filterValue={filterValue}
                            />
                        </div>
                    </div>
                </div>

                <AdminModalEquipment
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleModalSubmit}
                />
                <AdminEquipmentUpdate
                    isOpen={isUpdateModalOpen}
                    onClose={() => setIsUpdateModalOpen(false)}
                    onSubmit={handleUpdateSubmit}
                    IntialData={initialData}
                />


            </div>
        </div>
    )
}

function Table({ projects, isLoading, onDelete, onUpdate,filterValue }) {
    projects = projects?.filter((project) => {
        if (filterValue === ' ') {
            return true; // No filter applied
        }
        return project.academicSession === filterValue; // Filter by academic session
    });
    // Calculate total amount
    const totalAmount = projects?.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0).toFixed(2);

    return (
        <div className='relative font-sans'>
            {isLoading ? (
                <div className='absolute inset-0 flex items-center justify-center'>
                    <CircularProgress color='inherit' />
                </div>
            ) : (
                <>
                    {/* Scrollable Table */}
                    <div className='overflow-x-auto overflow-y-auto border rounded my-2 mb-10 lg:mx-8 max-h-[80vh]'>
                        <table className='border border-[#dde2e6] w-full'>
                            <thead>
                                <tr className='text-lg bg-[#f7dcdd]'>
                                    {[
                                        'Sr.No',
                                        'Name of Equipment',
                                        'Quantity',
                                        'Amount',
                                        'Date',
                                        'Financial Year',
                                        'Details',
                                        'Actions'
                                    ].map((heading, idx) => (
                                        <th
                                            key={idx}
                                            className='text-nowrap p-2 text-center bg-[#272e3f] text-white border border-[#dde2e6]'
                                        >
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {projects && projects.map((project, index) => (
                                    <tr key={project?.id} className={index % 2 ? 'bg-gray-100' : ''}>
                                        <td className='p-2 text-center text-black border'>{index + 1}</td>
                                        <td className='p-2 text-left text-black border'>{project.name}</td>
                                        <td className='p-2 text-center border'>{project.quantity}</td>
                                        <td className='p-2 text-center border'>{project.amount}</td>
                                        <td className='p-2 text-center border'>
                                            {new Date(project.date).toLocaleDateString('en-GB')}
                                        </td>
                                        <td className='p-2 text-center border'>{project.academicSession}</td>
                                        <td className='p-2 text-left border'>
                                            <Equipmentmodal item={project} />
                                        </td>
                                        <td className='text-center p-2 border'>
                                            <div className='flex justify-center gap-2'>
                                                <button
                                                    onClick={() => onDelete(project.id)}
                                                    className='p-2 bg-red-500 text-white rounded'
                                                >
                                                    <MdDelete />
                                                </button>
                                                <button
                                                    onClick={() => onUpdate(project.id)}
                                                    className='p-2 bg-gray-800 text-white rounded'
                                                >
                                                    <MdModeEdit />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Fixed Total Row */}
                    <div className="fixed bottom-0 left-50 w-full bg-[#272e3f] text-white font-semibold z-10">
                        <div className="lg:mx-8 border-t border-[#dde2e6]">
                            <div className="flex">
                                <div className="w-3/12 p-2 text-center border-r border-[#dde2e6]">
                                    Total Amount:
                                </div>
                                <div className="w-9/12 p-2 text-center">
                                    Rs. {totalAmount}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}