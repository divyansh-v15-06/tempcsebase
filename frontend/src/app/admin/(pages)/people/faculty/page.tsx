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
import FilterOptions from '@/components/people-components/filterOptions'
import CSVUploadModal from '@/components/admin-components/Modals/adminCsvModal'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import FacultyUpdateModal from '@/components/admin-components/updateModals/facultyUpadteModal'

type Props = {}

const options = [
    { value: ' ', title: 'All' },
    { value: 'Professor', title: 'Professor' },
    { value: 'Associate Professor', title: 'Associate Professor' },
    {
        value: 'Assistant Professor Grade-I',
        title: 'Assistant Professor Grade-I',
    },
    {
        value: 'Assistant Professor Grade-II',
        title: 'Assistant Professor Grade-II',
    },
]

export default function PeopleAdmin({}: Props) {
    const [data, setData] = useState([])
    const [isCSVModalOpen, setIsCSVModalOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
    const [headers, setHeaders] = useState({})
    const [initialData, setInitialData] = useState({})
    const [filter1, setFilter1] = useState<string>('')
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
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/faculty/get?position=${filter1}`

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
            .delete(`${process.env.NEXT_PUBLIC_API_URL}/faculty/delete/${id}`, {
                headers,
            })
            .then((response) => {
                toast.success('Faculty deleted successfully')
                fetchData()
            })
            .catch((error) => {
                toast.error('Error deleting faculty')
                console.error(error)
            })
    }

    const handleUpdate = (id) => {
        const faculty = data.find((item) => item.id === id)
        setInitialData(faculty);
        setIsUpdateModalOpen(true)
    }

    const handleExportCSV = () => {
        const fields = [
            'id',
            'uniqueFacultyId',
            'name',
            'position',
            'phone_no',
            'email',
            'portfolio',
            'photo',
            // 'researchInterests', // uncomment when received from backend
        ]
        const opts = { fields }
        try {
            const csv = parse(data, opts)
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
            saveAs(blob, 'faculty_data.csv')
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
        const inputFields =
            'name,position,phone_no,email,portfolio,photo,researchInterests'
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
            .post(`${process.env.NEXT_PUBLIC_API_URL}/faculty/`, formData, {
                headers,
            })
            .then((response) => {
                toast.success('Faculty added successfully')
                fetchData()
                setIsModalOpen(false)
            })
            .catch((error) => {
                toast.error('Error adding faculty')
                console.error(error)
            })
    }

    const handleCSVSubmit = ({ file, type }) => {
        const formData = new FormData()
        formData.append('avatar', file)

        axios
            .post(`${process.env.NEXT_PUBLIC_API_URL}/faculty/bulk`, formData, {
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
    const handleUpdateSubmit = (formData,id) => {
        axios
            .patch(`${process.env.NEXT_PUBLIC_API_URL}/faculty/update/${id}`, formData, {
                headers,
            })
            .then((response) => {
                toast.success('Faculty updated successfully')
                fetchData()
                setIsUpdateModalOpen(false)
            })
            .catch((error) => {
                toast.error('Error updating faculty')
                console.error(error)
            })
    }

    return (
        <div className='h-[92vh]'>
            <Toaster />
            <div className='flex justify-between items-center border-b-2 p-4'>
                <h1 className='font-semibold text-2xl'>Faculty Page</h1>
                <div className='flex justify-center gap-8 '>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className='bg-slate-950 text-white border-3 border rounded-3xl px-4 py-2'
                    >
                        Add Faculty
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

            <div className='z-10 flex justify-center items-center gap-2 mt-3'>
                <FilterOptions
                    filterName='Select Position'
                    setFilterValue={setFilter1}
                    options={options}
                />
                <Button className='mx-4' onClick={fetchData}>
                    Filter
                </Button>
            </div>

            <div className='font-bold text-2xl p-4 justify-start flex items-center'>
                Uploaded Data:
            </div>

            <div className='flex h-full'>
                <div className='w-full'>
                    <div
                        className='gap-2 w-full  '
                        id='researchSection'
                        ref={tableRef}
                    >
                        <FacultyTable
                            data={data}
                            onDelete={handleDelete}
                            onUpdate={handleUpdate}
                        />
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
            />
            <FacultyUpdateModal
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

function FacultyTable({ data, onDelete, onUpdate }) {
    return (
        <div className='font-sans'>
            <div className='border rounded my-2 lg:mx-8'>
                <table className='border-1 border-l border-r border-solid border-black w-full'>
                    <thead>
                        <tr>
                            <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff]'>
                                Sr. No.
                            </th>
                            <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff]'>
                                Unique Faculty Id
                            </th>
                            <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff]'>
                                Name
                            </th>
                            <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff] w-1/12'>
                                Position
                            </th>
                            <th className='text-nowrap p-3 text-center max-w-[200px] text-xl font-medium bg-[#272e3f] text-[#fff] w-1/8'>
                                Research Interests
                            </th>
                            <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff]'>
                                Photo
                            </th>
                            <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff]'>
                                Portfolio
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
                                    <td className='p-2 text-center text-nowrap border-b border-1 border-solid border-black'>
                                        {item.uniqueFacultyId}
                                    </td>
                                    <td className='p-2 text-left text-blue-800 border-b border-1 border-solid border-black text-lg'>
                                        {item.name}
                                    </td>
                                    <td className='p-2 text-center text-nowrap border-b border-1 border-solid border-black'>
                                        {item.position}
                                    </td>
                                    {/* Updated Research Interests Column */}
                                    <td className='p-2 text-center text-nowrap border-b border-1 border-solid border-black max-w-[200px] truncate'>
                                        {item.researchInterests}
                                    </td>
                                    <td className='p-2 text-center border-b border-1 border-solid border-black'>
                                        <img
                                            src={item.photo}
                                            alt={`${item.name}'s photo`}
                                            className='h-16 w-16 object-cover rounded-full'
                                        />
                                    </td>
                                    <td className='p-2 text-center text-nowrap border-b border-1 border-solid border-black'>
                                        <a
                                            href={item.portfolio}
                                            className='text-blue-800 underline'
                                        >
                                            view
                                        </a>
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
