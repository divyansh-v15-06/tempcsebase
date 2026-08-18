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
import CSVUploadModal from '@/components/admin-components/Modals/adminCSvModalsimple'
import AdminModalStudent from '@/components/admin-components/Modals/adminModalStudent'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import StudentUpdateModal from '@/components/admin-components/updateModals/studentUpdateModal'
import StudentBulkActionModal from '@/components/admin-components/Modals/StudentBulkAction'

type Props = {}

export default function StudentAdmin({}: Props) {
    const [data, setData] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
    const [initialData, setInitialData] = useState({})
    const [isCSVModalOpen, setIsCSVModalOpen] = useState(false)
    const [headers, setHeaders] = useState({})
    const tableRef = useRef<HTMLDivElement>(null)
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)

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
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/student/get`

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
            .delete(`${process.env.NEXT_PUBLIC_API_URL}/student/delete/${id}`, {
                headers,
            })
            .then((response) => {
                toast.success('Student deleted successfully')
                fetchData()
            })
            .catch((error) => {
                toast.error('Error deleting student')
                console.error(error)
            })
    }
    const handleDeleteall = () => {

        const userConfirmed = window.confirm(
            'Are you sure you want to delete all Students  ? This action cannot be undone.',
        )
        if (!userConfirmed) {
            return // Exit if the user cancels
        }

        axios
            .delete(`${process.env.NEXT_PUBLIC_API_URL}/student/deleteall`, {
                headers,
            })
            .then((response) => {
                toast.success('Students deleted successfully')
                fetchData()
            })
            .catch((error) => {
                toast.error('Error deleting students')
                console.error(error)
            })
    }

    const handleUpdate = (id) => {
        const student = data.find((item) => item.id === id)
        setInitialData(student)
        setIsUpdateModalOpen(true)
    }

    const handleExportCSV = () => {
        const fields = ['id', 'year', 'name', 'rollNo', 'email','currentSemester','programmEnroled']
        const opts = { fields }
        try {
            const csv = parse(data, opts)
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
            saveAs(blob, 'students_data.csv')
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
                pdf.save('Students_data.pdf')
            })
        }
    }
    // Handle dynamic CSV download
    const handleDownloadTemplate = () => {
        const inputFields = 'name,rollNo,email,year,picture,programmEnroled,currentSemester'
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
            .post(`${process.env.NEXT_PUBLIC_API_URL}/student`, formData, {
                headers,
            })
            .then((response) => {
                toast.success('Student added successfully')
                fetchData()
                setIsModalOpen(false)
            })
            .catch((error) => {
                toast.error('Error adding student')
                console.error(error)
            })
    }

    const handleCSVSubmit = ({ file }) => {
        const formData = new FormData()
        formData.append('avatar', file)

        axios
            .post(`${process.env.NEXT_PUBLIC_API_URL}/student/bulk`, formData, {
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
            .patch(`${process.env.NEXT_PUBLIC_API_URL}/student/update/${id}`, formData, {
                headers,
            })
            .then((response) => {
                toast.success('Student updated successfully')
                fetchData()
                setIsUpdateModalOpen(false)
            })
            .catch((error) => {
                toast.error('Error updating student')
                console.error(error)
            })
    }
    const handleBulkAction = (action, selectedIds,newSemester=0,callback) => {
        if (action === 'delete') {
            const userConfirmed = window.confirm(
                'Are you sure you want to delete these students? This action cannot be undone.',
            )
            if (!userConfirmed) {
                return // Exit if the user cancels
            }
            axios
                .delete(`${process.env.NEXT_PUBLIC_API_URL}/student/deleteMulti`, {
                    data: { ids: selectedIds },
                    headers,
                })
                .then((response) => {
                    toast.success('Students deleted successfully')
                    fetchData()
                    callback()
                })
                .catch((error) => {
                    toast.error('Error deleting students')
                    console.error(error)
                })
        } else if (action === 'edit') {
            // Handle edit action her
            axios
                .patch(`${process.env.NEXT_PUBLIC_API_URL}/student/updateMulti`, {
                    ids: selectedIds,
                    newSemester: newSemester,
                })
                .then((response) => {
                    toast.success('Updated successfully.')
                    fetchData()
                    callback()
                })
                .catch((error) => {
                    toast.error('Error updating students !')
                    console.error(error)
                })

        }
        setIsBulkModalOpen(false)
    }

    return (
        <div className='h-[92vh]'>
            <Toaster />
            <div className='flex justify-between items-center border-b-2 p-4'>
                <h1 className='font-semibold text-2xl'>Student Page</h1>
                <div className='flex justify-center gap-8 '>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className='bg-slate-950 text-white border-3 border rounded-3xl px-4 py-2'
                    >
                        Add one Student
                    </Button>
                    <Button
                        onClick={() => setIsBulkModalOpen(true)}
                        className='bg-slate-950 text-white border-3 border rounded-3xl px-4 py-2'
                    >
                        Bulk Action
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
                    <Button
                        onClick={handleDeleteall}
                        className='bg-red-600 text-white border-3 border rounded-3xl px-4 py-2'
                    >
                        Delete All Students
                    </Button>
                </div>
            </div>

            <div className='font-bold text-2xl p-4 justify-center flex items-center'>
                Uploaded Data:
            </div>

            <div className='flex h-full'>
                <div className='w-full'>
                    <div
                        className='gap-2 w-full'
                        ref={tableRef}
                        id='researchSection'
                    >
                        <StudentTable
                            data={data}
                            onDelete={handleDelete}
                            onUpdate={handleUpdate}
                        />
                    </div>
                </div>
            </div>

            <AdminModalStudent
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
            />
            <StudentUpdateModal
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                onSubmit={handleUpdateSubmit}
                initialData={initialData}
            />
            <StudentBulkActionModal
                open={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                students={data}
                onAction={handleBulkAction}
                
            />


            <CSVUploadModal
                isOpen={isCSVModalOpen}
                onClose={() => setIsCSVModalOpen(false)}
                onSubmit={handleCSVSubmit}
            />
        </div>
    )
}

function StudentTable({ data, onDelete, onUpdate }) {
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
                                Name
                            </th>
                            <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff]'>
                                Roll No
                            </th>
                            <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff]'>
                                Email
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
                                        {item.rollNo}
                                    </td>
                                    <td className='p-2 text-center border-b border-l border-1 border-solid border-black'>
                                        {item.email}
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
