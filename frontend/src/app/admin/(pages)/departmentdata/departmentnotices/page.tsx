//@ts-nocheck
'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { saveAs } from 'file-saver'
import { Button } from '@/components/ui/button'
import { CircularProgress } from '@mui/material'
import { parse } from 'json2csv'
import ExportCSV from '@/components/admin-components/exportCSV'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import FilterOptions from '@/components/people-components/filterOptions'
import AdminModalOfficeData from '@/components/admin-components/Modals/adminModalOfficeData'
import CSVUploadModal from '@/components/admin-components/Modals/adminCsvModal'
import { MdDelete } from 'react-icons/md'

const options1 = [
    { value: ' ', title: 'All' },
    { value: '2024', title: '2024' },
    { value: '2023', title: '2023' },
    { value: '2022', title: '2022' },
    { value: '2021', title: '2021' },
]

const options2 = [
    { value: ' ', title: 'All' },
    { value: 'January', title: 'January' },
    { value: 'February', title: 'February' },
    { value: 'March', title: 'March' },
    { value: 'June', title: 'June' },
]

const navMenu = [
    { title: 'Office Notices' },
    { title: 'Faculty Data' },
    { title: 'Research Data' },
]

export default function OfficeData() {
    const [selectedState, setSelectedState] = useState('Office Notices')
    const [facultyData, setFacultyData] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filter1, setFilter1] = useState([])
    const [filter2, setFilter2] = useState([])
    const [filter3, setFilter3] = useState('')
    const [data, setData] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isCSVModalOpen, setIsCSVModalOpen] = useState(false)
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
    const fetchData = async () => {
        setIsLoading(true)
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/private/announcement/get?searchTerm=${searchTerm}`,
                { headers: headers },
            )
            setData(response.data.data)
        } catch (error) {
            console.error('Error fetching announcements:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchFacultyData = () => {
        setIsLoading(true)
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/faculty/get?position=${filter3}`

        axios
            .get(urlWithParams)
            .then((response) => {
                setFacultyData(response.data.data)
            })
            .catch((error) => {
                console.error('Error fetching data:', error)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    const handleDelete = (id) => {

        const userConfirmed = window.confirm(
            'Are you sure you want to delete this ? This action cannot be undone.',
        )
        if (!userConfirmed) {
            return // Exit if the user cancels
        }

        axios
            .delete(
                `${process.env.NEXT_PUBLIC_API_URL}/private/announcement/delete/${id}`,
                { headers },
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

    const handleUpdate = (id) => {
        toast('Update functionality to be implemented')
    }

    const handleExportCSV = () => {
        const fields = ['id', 'title', 'date', 'pdfLink']
        const opts = { fields }
        try {
            const csv = parse(data, opts)
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
            saveAs(blob, 'announcements_data.csv')
        } catch (err) {
            console.error('Error exporting data to CSV:', err)
        }
    }

    // Fetch data from API including search query
    const fetchDataFilters = async () => {
        setIsLoading(true)
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/private/announcement/get/searchItem?searchTerm=${searchTerm}`,
                { headers: headers },
            )
            setData(response.data.data)
        } catch (error) {
            console.error('Error fetching announcements:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSearch = () => {
        fetchDataFilters() // Make the API call when search is triggered
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
            .post(
                `${process.env.NEXT_PUBLIC_API_URL}/private/announcement`,
                formData,
                { headers },
            )
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

    const handleCSVSubmit = ({ file, type }) => {
        const formData = new FormData()
        formData.append('avatar', file)

        axios
            .post(
                `${process.env.NEXT_PUBLIC_API_URL}/private/announcement/bulk`,
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

    useEffect(() => {
        fetchData()
        fetchFacultyData()
    }, [])

    return (
        <div className='h-[92vh]'>
            <Toaster />
            <div className='flex justify-between items-center border-b-2 p-4'>
                <h1 className='font-semibold text-2xl'>Office Data Page</h1>
                <div className='flex justify-center gap-8'>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className='bg-slate-950 text-white border-3 border rounded-3xl px-4 py-2'
                    >
                        Upload one Entry
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
                Uploaded Data:
            </div>
            <div className='flex justify-around items-center'>
                {/* Search Input */}
                <div className=' w-1/2'>
                    <Input
                        type='text'
                        placeholder='Search by title...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)} // Update searchTerm on input change
                        className='border p-2 w-full'
                    />
                </div>
                <div className='flex justify-between items-center'>
                    <Button
                        onClick={handleSearch} // Trigger search when button is clicked
                        className='bg-slate-950 text-white border-3 border rounded-3xl px-4 py-2'
                    >
                        Submit
                    </Button>
                    <Button
                        onClick={() => {
                            fetchData() // Make the API call when search is triggered
                        }} // Trigger search when button is clicked
                        className='bg-emerald-800 text-white border-3 border rounded-3xl px-4 py-2'
                    >
                        Show All
                    </Button>
                </div>
            </div>
            <div className='flex '>
                <div className='w-full'>
                    <div
                        className='gap-2 w-full  overflow-y-scroll'
                        id='officeNoticesSection'
                    >
                        {selectedState === 'Office Notices' && (
                            <Table
                                data={data}
                                onDelete={handleDelete}
                                onUpdate={handleUpdate}
                                isLoading={isLoading}
                            />
                        )}
                        {selectedState === 'Faculty Data' && (
                            <FacultyTable
                                data={facultyData}
                                onDelete={handleDelete}
                                onUpdate={handleUpdate}
                                isLoading={isLoading}
                            />
                        )}
                    </div>
                </div>
            </div>

            <AdminModalOfficeData
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
            />

            <CSVUploadModal
                isOpen={isCSVModalOpen}
                onClose={() => setIsCSVModalOpen(false)}
                onSubmit={handleCSVSubmit}
            />
        </div>
    )
}

function Table({ data, isLoading, onUpdate, onDelete }) {
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
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6] w-1/12'>
                                    Sr. No.
                                </th>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] max-w-[200px] border border-1 border-[#dde2e6]'>
                                    Announcement Title
                                </th>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                    Date
                                </th>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                    Link
                                </th>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6] w-1/12'>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((announcement, index) => (
                                <tr key={announcement.id}>
                                    <td className='border border-1 border-[#dde2e6] text-center'>
                                        {index + 1}
                                    </td>
                                    <td className='border border-1 border-[#dde2e6] text-center'>
                                        {announcement.title}
                                    </td>
                                    <td className='border border-1 border-[#dde2e6] text-center'>
                                        {announcement.date}
                                    </td>
                                    <td className='border border-1 border-[#dde2e6] text-center'>
                                        <a
                                            href={announcement.pdfLink}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-500 underline'
                                        >
                                            View
                                        </a>
                                    </td>
                                    <td className='border border-1 border-[#dde2e6] text-center'>
                                        {/* <Button
                                            variant='outline'
                                            size='sm'
                                            onClick={() =>
                                                onUpdate(announcement.id)
                                            }
                                        >
                                            Update
                                        </Button> */}
                                        <button
                                                    onClick={() =>
                                                        onDelete(announcement.id)
                                                    }
                                                    className='p-2 bg-red-500 text-white rounded'
                                                >
                                                    <MdDelete />
                                                </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

function FacultyTable({ data, isLoading, onUpdate, onDelete }) {
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
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6] w-1/12'>
                                    Sr. No.
                                </th>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] max-w-[200px] border border-1 border-[#dde2e6]'>
                                    Faculty Name
                                </th>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                    Designation
                                </th>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                    Email
                                </th>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6] w-1/12'>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((faculty, index) => (
                                <tr key={faculty.id}>
                                    <td className='border border-1 border-[#dde2e6] text-center'>
                                        {index + 1}
                                    </td>
                                    <td className='border border-1 border-[#dde2e6] text-center'>
                                        {faculty.name}
                                    </td>
                                    <td className='border border-1 border-[#dde2e6] text-center'>
                                        {faculty.designation}
                                    </td>
                                    <td className='border border-1 border-[#dde2e6] text-center'>
                                        {faculty.email}
                                    </td>
                                    <td className='border border-1 border-[#dde2e6] text-center'>
                                        <Button
                                            variant='outline'
                                            size='sm'
                                            onClick={() => onUpdate(faculty.id)}
                                        >
                                            Update
                                        </Button>
                                        <Button
                                            variant='outline'
                                            size='sm'
                                            onClick={() => onDelete(faculty.id)}
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
