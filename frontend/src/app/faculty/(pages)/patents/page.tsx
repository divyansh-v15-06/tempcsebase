// Import necessary modules
'use client'
import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { saveAs } from 'file-saver'
import { Button } from '@/components/ui/button'
import { MdDelete, MdModeEdit } from 'react-icons/md'
import { parse } from 'json2csv'
import AdminModalPatents from '@/components/admin-components/Modals/adminModalPatents'
import CSVUploadModal from '@/components/admin-components/Modals/adminCsvModal'
import { CircularProgress } from '@mui/material'
import PatentModal from '@/components/research-components/PatentModal'
import FilterOptions from '@/components/people-components/filterOptions'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import PatentUpdateModal from '@/components/admin-components/updateModals/patentUpdateModal'

// Define headers for API requests

const options = {
    academicYear: [
        { value: ' ', title: 'All' },
        { value: '2020', title: '2020' },
        { value: '2021', title: '2021' },
        { value: '2022', title: '2022' },
        { value: '2023', title: '2023' },
    ],
    patentStatus: [
        { value: ' ', title: 'All' },
        { value: 'Published', title: 'Published' },
        { value: 'Granted', title: 'Granted' },
    ],
    academicMonth: [
        { value: ' ', title: 'All' },
        { value: 'October', title: 'October' },
        { value: 'June', title: 'June' },
    ],
    facultyName: [
        { value: ' ', title: 'All' },
        { value: 'Dr. Naveen Chauhan', title: 'Dr. Naveen Chauhan' },
        { value: 'Dr. Rajeev Kumar', title: 'Dr. Rajeev Kumar' },
        { value: 'Dr. Jyoti Srivastava', title: 'Dr. Jyoti Srivastava' },
    ],
}

export default function PatentsAdmin() {
    const [userId, setUserId] = useState('')
    const [data, setData] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [initialData, setInitialData] = useState({})
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)

    const [isCSVModalOpen, setIsCSVModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [username, setUsername] = useState('')

    const [filter1, setFilter1] = useState<string>('')
    const [filter2, setFilter2] = useState<string>('')
    const [filter3, setFilter3] = useState<string>('')
    const [filter5, setFilter5] = useState<string>('')
    const [startYear, setStartYear] = useState([{ value: ' ', title: 'All' }])
    const [endYear, setEndYear] = useState([{ value: ' ', title: 'All' }])
    const [facultyName, setFacultyName] = useState([
        { value: ' ', title: 'All' },
    ])
    const [headers, setHeaders] = useState({})
    const tableRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        // Read from sessionStorage after component mounts
        setUsername(sessionStorage.getItem('facultyName') || '')

        setUserId(sessionStorage.getItem('userId') || '')
    }, []) // Empty dependency array ensures this runs only on mount

    useEffect(() => {
        // Check if we are running on the client side
        if (typeof window !== 'undefined') {
            const token = sessionStorage.getItem('auth')
            setHeaders({
                Authorization: `Bearer ${
                    sessionStorage.getItem('access_token') as string
                }`,
            })
        }
    }, [])
    // Fetch data from API
    const fetchData = () => {
        setIsLoading(true)
        const urlWithParams = `${
            process.env.NEXT_PUBLIC_API_URL
        }/patent/get?startYear=${filter1.trim()}&name=${username}&status=${filter3.trim()}&endYear=${filter5.trim()}`
        axios
            .get(urlWithParams)
            .then((response) => {
                setData(response.data)
                setIsLoading(false)
            })
            .catch((error) => {
                console.error('Error fetching data:', error)
                setIsLoading(false)
            })
    }

    const fetchFacultyName = () => {
        setIsLoading(true)
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/patent/getFaculty`
        axios
            .get(urlWithParams)
            .then((response) => {
                const fetchedYearOptions = response.data.data.map((obj) => ({
                    value: obj.name,
                    title: obj.name,
                }))
                setFacultyName([
                    { value: ' ', title: 'All' },
                    ...fetchedYearOptions,
                ])
            })
            .catch((error) => {
                console.error('Error fetching year data:', error)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    const fetchStartYear = () => {
        setIsLoading(true)
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/patent/getYear/${userId}`

        axios
            .get(urlWithParams)
            .then((response) => {
                const fetchedYearOptions = response.data.data.map((obj) => ({
                    value: obj,
                    title: obj,
                }))
                setStartYear([
                    { value: ' ', title: 'All' },
                    ...fetchedYearOptions,
                ])
            })
            .catch((error) => {
                console.error('Error fetching year data:', error)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    const fetchEndYear = () => {
        setIsLoading(true)
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/patent/getYear/${userId}`

        axios
            .get(urlWithParams)
            .then((response) => {
                const fetchedYearOptions = response.data.data.map((obj) => ({
                    value: obj,
                    title: obj,
                }))
                setEndYear([
                    { value: ' ', title: 'All' },
                    ...fetchedYearOptions,
                ])
            })
            .catch((error) => {
                console.error('Error fetching year data:', error)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        fetchData()
        fetchStartYear()
    }, [])

    useEffect(() => {
        fetchData()
        fetchEndYear()
    }, [])

    useEffect(() => {
        fetchData()
        fetchFacultyName()
    }, [])

    // Handle delete action
    const handleDelete = (id) => {
        const userConfirmed = window.confirm(
            'Are you sure you want to delete this ? This action cannot be undone.',
        )
        if (!userConfirmed) {
            return // Exit if the user cancels
        }

        axios
            .delete(`${process.env.NEXT_PUBLIC_API_URL}/patent/delete/${id}`, {
                headers,
            })
            .then(() => {
                toast.success('Patent deleted successfully')
                fetchData()
            })
            .catch((error) => {
                toast.error('Error deleting patent')
                console.error(error)
            })
    }

    // Handle update action
    const handleUpdate = (id) => {
        setIsUpdateModalOpen(true)
    }

    // Export data to CSV
    const handleExportCSV = () => {
        const fields = [
            'id',
            'referenceId',
            'facultyNames',
            'authorName',
            'title',
            'status',
            'year',
            // 'month',
            'place',
        ] // Customize fields as per your data
        const opts = { fields }
        try {
            //@ts-ignore
            // console.log('Data:', data.data)
            //@ts-ignore
            const csv = parse(data.data, opts)
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
            saveAs(blob, 'patents_data.csv')
        } catch (err) {
            console.error('Error exporting data to CSV:', err)
        }
    }

    const handleUpdateSubmit = (formData, id) => {
        // console.log('id', id)
        axios
            .put(
                `${process.env.NEXT_PUBLIC_API_URL}/patent/update/${id}`,
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

    // Handle modal submit
    const handleModalSubmit = (formData) => {
        axios
            .post(`${process.env.NEXT_PUBLIC_API_URL}/patent`, formData, {
                headers,
            })
            .then(() => {
                toast.success('Patent added successfully')
                fetchData()
                setIsModalOpen(false)
            })
            .catch((error) => {
                toast.error('Error adding patent')
                console.error(error)
            })
    }

    // Handle CSV file upload
    const handleCSVSubmit = ({ file, type }) => {
        const formData = new FormData()
        console.log('file', file)
        formData.append('avatar', file)

        axios
            .post(`${process.env.NEXT_PUBLIC_API_URL}/patent/bulk`, formData, {
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
            'id,referenceId,facultyNames,authorName,title,status,year,month,place,'
        const fieldsArray = inputFields.split(',')

        // Convert the fields to a CSV string
        const csvContent = fieldsArray.join(',') + '\n'

        // Create a Blob from the CSV string
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })

        // Use file-saver to trigger the download
        saveAs(blob, 'template.csv')
    }

    return (
        <div className='h-[92vh]'>
            <Toaster />
            <div className='flex justify-between items-center border-b-2 p-4'>
                <h1 className='font-semibold text-2xl'>Patents</h1>
                <div className='flex justify-center gap-8'>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className='bg-slate-950 text-white border-3 border rounded-3xl px-4 py-2'
                    >
                        Add Patent
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
            <div className='flex lg:flex-row justify-center items-center gap-2 mt-3'>
                <div className='flex pl-[18px]'>
                    <FilterOptions
                        filterName='Start Year'
                        setFilterValue={setFilter1}
                        options={startYear}
                    />
                    <FilterOptions
                        filterName='End Year'
                        setFilterValue={setFilter5}
                        options={endYear}
                    />
                    <FilterOptions
                        filterName='Patent status'
                        setFilterValue={setFilter3}
                        options={options.patentStatus}
                    />
                    {/* <FilterOptions
                    filterName='Faculty member'
                    setFilterValue={setFilter2}
                    options={facultyName}
                /> */}
                </div>
                <div className='flex justify-end mr-[2rem] flex-1'>
                    <Button className='mx-4' onClick={fetchData}>
                        Filter
                    </Button>
                </div>
            </div>

            <div className='font-bold text-2xl p-4 justify-center flex items-center'>
                {/* Uploaded Data: */}
            </div>

            <div className='flex h-full'>
                <div className='w-full'>
                    <div
                        className='gap-2 w-full   '
                        id='patentsSection'
                        ref={tableRef}
                    >
                        <Table
                            patents={data}
                            onDelete={handleDelete}
                            onUpdate={handleUpdate}
                            isLoading={isLoading}
                            setInitialData={setInitialData}
                        />
                    </div>
                </div>
            </div>

            <AdminModalPatents
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
            />

            <CSVUploadModal
                isOpen={isCSVModalOpen}
                onClose={() => setIsCSVModalOpen(false)}
                onSubmit={handleCSVSubmit}
            />
            <PatentUpdateModal
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                onSubmit={handleUpdateSubmit}
                initialData={initialData}
            />
        </div>
    )
}

function Table({ patents, isLoading, onUpdate, onDelete, setInitialData }) {
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
                                    Patent Title
                                </th>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6] w-1/12'>
                                    Status
                                </th>
                                {/* <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6] w-1/12'>
                                    Month
                                </th> */}
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6] w-1/12'>
                                    Filled Date
                                </th>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6] w-1/12'>
                                Awarding agency
                                </th>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6] w-1/12'>
                                 Inventor
                                </th>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                    View
                                </th>
                                <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff]'>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {patents.data && patents.data.length > 0 ? (
                                patents.data.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        className={
                                            index % 2 ? 'bg-gray-300' : ''
                                        }
                                    >
                                        <td className='p-2 text-center border-b border-r border-l border-solid border-black'>
                                            {index + 1}
                                        </td>
                                        <td className='p-2 text-left border border-1 max-w-[400px] border-solid border-black'>
                                            <span className=' font-medium'>
                                                {item?.faculties.map(
                                                    (author) => {
                                                        return (
                                                            <span
                                                                key={author.id}
                                                            >
                                                                {author.name}
                                                                {', '}
                                                            </span>
                                                        )
                                                    },
                                                )}
                                            </span>
                                            <span className='text-[#0f376f]'>
                                                {' '}
                                                {item.title}
                                            </span>
                                        </td>
                                        <td className='p-2 text-center border border-1 border-solid border-black'>
                                            {item.status}
                                        </td>
                                        {/* <td className='p-2 text-center border border-1 border-solid border-black'>
                                            {item.month}
                                        </td> */}
                                        <td className='p-2 text-center border border-1 border-solid border-black'>
                                            {new Date(item.filledDate).toLocaleDateString(
                                                'en-GB')}
                                        </td>
                                        <td className='p-2 text-center border border-1 border-solid border-black'>
                                            {item.place}
                                        </td>
                                        <td className='p-2 text-center border border-1 border-solid border-black'>
                                            {item.authorName}
                                        </td>
                                        <td className='p-2 text-left border border-1 border-solid border-black w-1/12'>
                                            <PatentModal item={item} />
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
                                                    onClick={() => {
                                                        onUpdate(item.id)
                                                        setInitialData(item)
                                                    }}
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
                                    <td className='p-4 text-center' colSpan={6}>
                                        No data
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
