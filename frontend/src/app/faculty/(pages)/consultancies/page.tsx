'use client'
import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { saveAs } from 'file-saver'
import { Button } from '@/components/ui/button'
import { MdDelete, MdModeEdit } from 'react-icons/md'
import { parse } from 'json2csv'
import AdminModalConsultancies from '@/components/admin-components/Modals/adminModalConsultancies'
import CSVUploadModal from '@/components/admin-components/Modals/adminCsvModal'
import { CircularProgress } from '@mui/material'
import ConsultanciesModal from '@/components/research-components/ConsultanciesModal'
import FilterOptions from '@/components/people-components/filterOptions'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import ConsultancyUpdateModal from '@/components/admin-components/updateModals/consultanciesUpdateModal'
import { useUser } from '../UsernameProvider'
import { set } from 'react-datepicker/dist/date_utils'

interface Consultancy {
    id: string;
    authorName: string;
    title: string;
    sponsoringAgency: string;
    academicSession: string;
    amount: number;
    clientOrganisation: string;
    associatedFaculties: string;
    status: string;
}

type Props = {}

export default function ProjectsAdmin({}: Props) {
    const [data, setData] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isCSVModalOpen, setIsCSVModalOpen] = useState(false)
    const [filter1, setFilter1] = useState<string>('')
    const [filter3, setFilter3] = useState<string>('')
    const [filter5, setFilter5] = useState<string>('')
    const [clientOrganisation, setClientOrganisation] = useState([
        { value: ' ', title: 'All' },
    ])
    const [endDate, setEndDate] = useState([{ value: ' ', title: 'All' }])
    const [isLoading, setIsLoading] = useState(true)
    const [startDate, setStartDate] = useState([{ value: ' ', title: 'All' }])
    const [initialData, setInitialData] = useState({})
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
    const [headers, setHeaders] = useState({})
    const tableRef = useRef<HTMLDivElement>(null)
    const [username, setUsername] = useState('')
    const [userId, setUserId] = useState('')

    const options = {
        faculty: [
            { value: ' ', title: 'All' },
            { value: 'Dr. Arun Kumar Yadav', title: 'Dr. Arun Kumar Yadav' },
            { value: 'Dr. Mohit Kumar', title: 'Dr. Mohit Kumar' },
            { value: 'Dr. Jyoti Srivastava', title: 'Dr. Jyoti Srivastava' },
            {
                value: 'Dr. Mohd. Khalid Pandit',
                title: 'Dr. Mohd. Khalid Pandit',
            },
        ],
        status: [
            { value: ' ', title: 'All' },
            { value: 'Completed', title: 'Completed' },
            { value: 'Ongoing', title: 'Ongoing' },
        ],
    }

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
                Authorization: `Bearer ${sessionStorage.getItem('access_token') as string}`,
            })
        }
    }, [])
    const fetchData = () => {
        setIsLoading(true)
        const urlWithParams = `${
            process.env.NEXT_PUBLIC_API_URL
        }/consultancy/get?clientOrganisation=${filter3.trim()}&type=${filter5.trim()}&name=${userId}`

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

    const fetchStartDate = () => {
        setIsLoading(true)
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/consultancy/getYear`
        axios
            .get(urlWithParams)
            .then((response) => {
                const fetchedYearOptions = response.data.data.map((obj) => ({
                    value: obj,
                    title: obj,
                }))
                setStartDate([
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

    const fetchClientOrganisation = () => {
        setIsLoading(true)
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/consultancy/clientOrganisation`
        axios
            .get(urlWithParams)
            .then((response) => {
                console.log('response.data new', response.data.data)
                const fetchedYearOptions = response.data.data.map((obj) => ({
                    value: obj,
                    title: obj,
                }))
                setClientOrganisation([
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

    const fetchEndDate = () => {
        setIsLoading(true)
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/consultancy/getYear`
        axios
            .get(urlWithParams)
            .then((response) => {
                const fetchedYearOptions = response.data.data.map((obj) => ({
                    value: obj,
                    title: obj,
                }))
                setEndDate([
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
        if (username !== '') {
            fetchData()
            fetchStartDate()
            fetchEndDate()
            fetchClientOrganisation()
        }
    }, [username])

    const handleDelete = (id) => {
        const userConfirmed = window.confirm(
            'Are you sure you want to delete this ? This action cannot be undone.',
        )
        if (!userConfirmed) {
            return // Exit if the user cancels
        }

        axios
            .delete(
                `${process.env.NEXT_PUBLIC_API_URL}/consultancy/delete/${id}`,
                {
                    headers,
                },
            )
            .then((response) => {
                toast.success('Events deleted successfully')
                fetchData()
            })
            .catch((error) => {
                toast.error('Error deleting events')
                console.error(error)
            })
    }

    const handleUpdate = (id: string) => {
        setIsUpdateModalOpen(true)
        setInitialData(data.find((item: Consultancy) => item.id === id) || {})
    }

    const handleExportCSV = () => {
        const fields = [
            'id',
            'title',
            'authorName',
            'associatedFaculties',
            'designation',
            'academicSession',
            'startDate',
            'endDate',
            'sponsoringAgency',
            'venue',
            'clientOrganisation',
            'type',
        ] // Customize fields as per your data
        const opts = { fields }
        try {
            console.log('data', data)
            const csv = parse(data, opts)
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
            saveAs(blob, 'consultancies_data.csv')
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
                pdf.save('events.pdf')
            })
        }
    }
    const handleUpdateSubmit = (formData, id) => {
        console.log('id', id)
        axios
            .patch(
                `${process.env.NEXT_PUBLIC_API_URL}/consultancy/update/${id}`,
                formData,
                {
                    headers,
                },
            )
            .then((response) => {
                toast.success('consultancy added successfully')
                fetchData()
                setIsModalOpen(false)
            })
            .catch((error) => {
                toast.error('Error adding consultancy')
                console.error(error)
            })
    }
    // Handle dynamic CSV download
    const handleDownloadTemplate = () => {
        const inputFields =
            'id,title,authorName,associatedFaculties,designation,academicSession,startDate,endDate,sponsoringAgency,venue,clientOrganisation,type,'
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
            .post(`${process.env.NEXT_PUBLIC_API_URL}/consultancy`, formData, {
                headers,
            })
            .then((response) => {
                toast.success('Consultancy added successfully')
                fetchData()
                setIsModalOpen(false)
            })
            .catch((error) => {
                toast.error('Error adding consultancy')
                console.error(error)
            })
    }

    const handleCSVSubmit = ({ file, type }) => {
        const formData = new FormData()
        console.log('file', { file, type })
        formData.append('avatar', file) // 'avatar' should match the backend field name

        axios
            .post(
                `${process.env.NEXT_PUBLIC_API_URL}/consultancy/bulk`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data', // Correct Content-Type for file uploads
                    },
                },
            )
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
    return (
        <div className='h-[92vh]'>
            <Toaster />
            <div className='flex justify-between items-center border-b-2 p-4'>
                <h1 className='font-semibold text-2xl'>Consultancies</h1>
                <div className='flex justify-center gap-8 '>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className='bg-slate-950 text-white border-3 border rounded-3xl px-4 py-2'
                    >
                        Add consultancy
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
                    {/* <Button
                        onClick={handleDownloadTemplate}
                        className='bg-slate-950 text-white border-3 border rounded-3xl px-4 py-2'
                    >
                        Download Template
                    </Button> */}
                    {/* <Button
                        onClick={handleExportPDF}
                        className='bg-slate-950 text-white border-3 border rounded-3xl px-4 py-2'
                    >
                        Export as PDF
                    </Button> */}
                </div>
            </div>

            <div className='flex flex-col lg:flex-row justify-center items-center gap-2 mt-3'>
                <FilterOptions
                    filterName='Client organization'
                    setFilterValue={setFilter3}
                    options={clientOrganisation}
                />
                <FilterOptions
                    filterName='Faculty involved'
                    setFilterValue={setFilter5}
                    options={options.faculty}
                />
                <FilterOptions
                    filterName='Status'
                    setFilterValue={setFilter1}
                    options={options.status}
                />

                <Button className='mx-4' onClick={fetchData}>
                    Filter
                </Button>
            </div>

            {/* <div className='font-bold text-2xl p-4 justify-center flex items-center'>
                Uploaded Data:
            </div> */}

            <div className='flex h-full'>
                <div className='w-full'>
                    <div
                        className='gap-2 w-full'
                        id='projectsSection'
                        ref={tableRef}
                    >
                        <Table
                            isLoading={isLoading}
                            projects={data}
                            onDelete={handleDelete}
                            onUpdate={handleUpdate}
                        />
                    </div>
                </div>
            </div>

            <AdminModalConsultancies
                
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
            />

            <CSVUploadModal
                isOpen={isCSVModalOpen}
                onClose={() => setIsCSVModalOpen(false)}
                onSubmit={handleCSVSubmit}
            />

            <ConsultancyUpdateModal
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                onSubmit={handleUpdateSubmit}
                // @ts-ignore
                initialData={initialData}
            />
        </div>
    )
}
function Table({ projects, isLoading, onUpdate, onDelete }) {
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
                                    Consultancy title
                                </th>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6] w-1/12'>
                                    Client organization
                                </th>
                                {/* <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6] w-1/12'>
                                    Faculty involved
                                </th> */}
                                {/* <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6] w-1/12'>
                                    Amount (INR)
                                </th> */}
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6] w-1/12'>
                                    Status
                                </th>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6] w-1/12'>
                                    View
                                </th>
                                <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff]'>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects && projects.length > 0 ? (
                                projects.map((item, index) => (
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
                                            <span className='text-[#800000] font-semibold'>
                                                {item?.authorName}
                                                {/* {item?.authorName && ','} */}
                                            </span>

                                            <span className='text-[#0f376f] font-semibold tracking-tighter'>
                                                {item?.title && ', '}
                                                {item.title}
                                            </span>

                                            <span className='text-[#000] font-semibold tracking-tighter'>
                                                {item?.sponsoringAgency && ', '}
                                                {item?.sponsoringAgency}
                                                {/* {item?.principalInvestigator &&
                                                ', '} */}
                                            </span>

                                            <span className='text-[#000] font-semibold tracking-tighter'>
                                                {item?.academicSession && ', '}
                                                {item?.academicSession}
                                            </span>

                                            <span>
                                                {item?.amount && ', INR '}
                                                {item?.amount}
                                            </span>
                                        </td>

                                        <td className='p-2 text-center border border-1 border-solid border-black'>
                                            {item?.clientOrganisation}
                                        </td>
                                        {/* <td className='p-2 text-center border border-1 border-solid border-black'>
                                            {item?.associatedFaculties}
                                        </td> */}
                                        {/* <td className='p-2 text-center border border-1 border-solid border-black'>
                                            {item.amount}
                                        </td> */}
                                        <td className='p-2 text-center border border-1 border-solid border-black'>
                                            {item.status}
                                        </td>
                                        <td className='p-2 text-left border border-1 border-solid border-black'>
                                            <ConsultanciesModal item={item} />
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
