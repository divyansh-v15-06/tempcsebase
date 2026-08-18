// @ts-nocheck
'use client'
import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { saveAs } from 'file-saver'
import { Button } from '@/components/ui/button'
import { MdDelete, MdModeEdit } from 'react-icons/md'
import { parse } from 'json2csv'
import Modal from '@/components/admin-components/Modals/adminModalFaculty'
import CSVUploadModal from '@/components/admin-components/Modals/adminCsvModal'
import AdminModalStaff from '@/components/admin-components/Modals/adminModalStaff'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import StaffUpdateModal from '@/components/admin-components/updateModals/staffUpdateModal'

type Props = {}

export default function StaffAdmin({}: Props) {
    const [data, setData] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
    const [initialData, setInitialData] = useState({})
    const [isCSVModalOpen, setIsCSVModalOpen] = useState(false)
    const [headers, setHeaders] = useState({})
    const tableRef = useRef<HTMLDivElement>(null)

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
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/staff/get`

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

    const handleDelete = (id) => {

        const userConfirmed = window.confirm(
            'Are you sure you want to delete this ? This action cannot be undone.',
        )
        if (!userConfirmed) {
            return // Exit if the user cancels
        }

        axios
            .delete(`${process.env.NEXT_PUBLIC_API_URL}/staff/delete/${id}`, {
                headers,
            })
            .then((response) => {
                toast.success('Staff deleted successfully')
                fetchData()
            })
            .catch((error) => {
                toast.error('Error deleting staff')
                console.error(error)
            })
    }

    const handleUpdate = (id) => {
        const staff = data.find((item) => item.id === id)
        setInitialData(staff)
        setIsUpdateModalOpen(true)
    }

    const handleExportCSV = () => {
        const fields = [
            'id',
            'name',
            'phoneNo',
            'email',
            'designation',
            'photo',
        ] // Include photo field
        const opts = { fields }
        try {
            const csv = parse(data, opts)
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
            saveAs(blob, 'staff_data.csv')
        } catch (err) {
            console.error('Error exporting data to CSV:', err)
        }
    }
    const handleExportPDF = () => {
        if (tableRef.current) {
            html2canvas(tableRef.current).then((canvas) => {
                const imgData = canvas.toDataURL('image/png')
                const pdf = new jsPDF('p', 'mm', 'a4')
                const imgProps = pdf.getImageProperties(imgData)
                const pdfWidth = pdf.internal.pageSize.getWidth()
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
                pdf.save('phd_scholars_data.pdf')
            })
        }
    }
    // Handle dynamic CSV download
    const handleDownloadTemplate = () => {
        const inputFields = 'time,email,name,phoneNo,designation,photo'
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
            .post(`${process.env.NEXT_PUBLIC_API_URL}/staff`, formData, {
                headers,
            })
            .then((response) => {
                toast.success('Staff added successfully')
                fetchData()
                setIsModalOpen(false)
            })
            .catch((error) => {
                toast.error('Error adding staff')
                console.error(error)
            })
    }

    const handleCSVSubmit = ({ file, type }) => {
        const formData = new FormData()
        console.log('file', file)
        formData.append('avatar', file)

        axios
            .post(`${process.env.NEXT_PUBLIC_API_URL}/staff/bulk`, formData, {
                headers: {
                    ...headers,
                    'Content-Type': 'file',
                },
            })
            .then((response) => {
                toast.success('CSV uploaded successfully')
                fetchData()
                setIsCSVModalOpen(false)
            })
            .catch((error) => {
                toast.error('Error uploading CSV')
                console.error(error)
            })
    }
    const handleUpdateSubmit = (formData, id) => {  
        axios
            .patch(`${process.env.NEXT_PUBLIC_API_URL}/staff/update/${id}`, formData, {
                headers,
            })
            .then((response) => {
                toast.success('Staff updated successfully')
                fetchData()
                setIsUpdateModalOpen(false)
            })
            .catch((error) => {
                toast.error('Error updating staff')
                console.error(error)
            })
    }

    return (
        <div className='h-[92vh]'>
            <Toaster />
            <div className='flex justify-between items-center border-b-2 p-4'>
                <h1 className='font-semibold text-2xl'>Staff Page</h1>
                <div className='flex justify-center gap-8 '>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className='bg-slate-950 text-white border-3 border rounded-3xl px-4 py-2'
                    >
                        Add staff member
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
                    <Button
                        onClick={handleExportPDF}
                        className='bg-slate-950 text-white border-3 border rounded-3xl px-4 py-2'
                    >
                        Export as PDF
                    </Button>
                </div>
            </div>

            <div className='font-bold text-2xl p-4 justify-center flex items-center'>
                Uploaded Data:
            </div>

            <div className='flex h-full'>
                <div className='w-full'>
                    <div
                        className='gap-2 w-full  '
                        ref={tableRef}
                        id='researchSection'
                    >
                        <StaffTable
                            data={data}
                            onDelete={handleDelete}
                            onUpdate={handleUpdate}
                        />
                    </div>
                </div>
            </div>

            <AdminModalStaff
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
            />
            
            <StaffUpdateModal
            isOpen={isUpdateModalOpen}
            onClose={() => setIsUpdateModalOpen(false)}
            onSubmit={handleUpdateSubmit}
            initialData={initialData}
        />

            <CSVUploadModal
                isOpen={isCSVModalOpen}
                onClose={() => setIsCSVModalOpen(false)}
                onSubmit={handleCSVSubmit}
            />
        </div>
    )
}

function StaffTable({ data, onDelete, onUpdate }) {
    return (
        <div className='font-sans'>
            <div className='border rounded my-2 lg:mx-8'>
                <table className='border-1 border-l border-r border-solid border-black w-full'>
                    <thead>
                        <tr>
                            <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff]'>
                                Sr. No.
                            </th>
                            <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] max-w-[200px] text-[#fff]'>
                                Staff
                            </th>
                            <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff]'>
                                Designation
                            </th>
                            <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff]'>
                                Email
                            </th>
                            <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff]'>
                                Photo
                            </th>
                            <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff]'>
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data &&
                            data.map((item, index) => (
                                <tr key={item.id}>
                                    <td className='p-2 text-center border-b border-r border-1 border-solid border-black'>
                                        {index + 1}
                                    </td>
                                    <td className='p-2 text-left text-blue-800 border-b border-1 border-solid border-black text-lg'>
                                        {item.name}
                                    </td>
                                    <td className='p-2 text-center text-nowrap border-b border-l border-1 border-solid border-black'>
                                        {item.designation}
                                    </td>
                                    <td className='p-2 text-center text-nowrap border-b border-l border-1 border-solid border-black'>
                                        {item.email}
                                    </td>
                                    <td className='p-2 text-center border-b border-l border-1 border-solid border-black'>
                                        <img
                                            src={item.photo}
                                            alt={`${item.name}'s photo`}
                                            className='h-16 w-16 object-cover rounded-full'
                                        />
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
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
