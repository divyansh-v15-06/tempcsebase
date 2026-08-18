'use client'
import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { saveAs } from 'file-saver'
import { Button } from '@/components/ui/button'
import { MdDelete, MdModeEdit } from 'react-icons/md'
import { parse } from 'json2csv'
import AdminModalProjects from '@/components/admin-components/Modals/adminModalProjects'
import CSVUploadModal from '@/components/admin-components/Modals/adminCsvModal'
import { CircularProgress } from '@mui/material'
import ProjectModal from '@/components/research-components/ProjectModal'
import FilterOptions from '@/components/people-components/filterOptions'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import ProjectUpdateModal from '@/components/admin-components/updateModals/projectUpdateModals'

type Props = {}

export default function ProjectsAdmin({}: Props) {
    const [userId, setUserId] = useState(sessionStorage.getItem('userId') || '')

    const [data, setData] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)

    const [isCSVModalOpen, setIsCSVModalOpen] = useState(false)

    const [filter1, setFilter1] = useState<string>('')
    const [filter2, setFilter2] = useState<string>('')
    const [filter4, setFilter4] = useState<string>('')
    const [filter3, setFilter3] = useState<string>('')
    const [filter5, setFilter5] = useState<string>('')
    const [username, setUsername] = useState(
        sessionStorage.getItem('facultyName') || '',
    )

    const [startYear, setStartYear] = useState([{ value: '-', title: 'All' }])
    const [endYear, setEndYear] = useState([{ value: '-', title: 'All' }])
    const [academicSession, setAcademicSession] = useState([
        { value: '-', title: 'All' },
    ])
    const [isLoading, setIsLoading] = useState(true)
    const [fundingAgency, setFundingAgency] = useState([
        { value: '-', title: 'All' },
    ])
    const [initialData, setInitialData] = useState({})
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
    const [headers, setHeaders] = useState({})
    const tableRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Read from sessionStorage after component mounts
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

    useEffect(() => {
        // Read from sessionStorage after component mounts
        setUsername(sessionStorage.getItem('facultyName') || '')
        setUserId(sessionStorage.getItem('userId') || '')
    }, []) 
    useEffect(() => {
        if (username !== '') {
            fetchData()
        fetchEndYear
            fetchStartYear()
            fetchEndYear()
            fetchAcdemicsYear()
            
            fetchFundingAgency()
        }
    }, [username])// Empty dependency array ensures this runs only on mount
    const fetchData = () => {
        setIsLoading(true)
        const urlWithParams = `${
            process.env.NEXT_PUBLIC_API_URL
        }/project/get?startYear=${filter1.trim()}&fundingAgency=${filter3.trim()}&endYear=${filter5.trim()}&name=${userId}&academicSession=${filter2.trim()}&status=${filter4.trim()}`

        axios
            .get(urlWithParams)
            .then((response) => {
                console.log('response.data.data', response.data.data)
                setData(response.data.data)
                console.log('data', response.data.data);
                
                setIsLoading(false)
            })
            .catch((error) => {
                console.error('Error fetching data:', error)
                setIsLoading(false)
            })
    }

    const fetchFundingAgency = () => {
        setIsLoading(true)
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/project/fundingAgency/${userId}`
        axios
            .get(urlWithParams)
            .then((response) => {
                const fetchedYearOptions = response.data.data.map((obj) => ({
                    value: obj,
                    title: obj,
                }))
                console.log('Year what is this', fetchedYearOptions)
                setFundingAgency([
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
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/project/getYear/${userId}`
        axios
            .get(urlWithParams)
            .then((response) => {
                const fetchedYearOptions = response.data.data.filter((obj) => obj !== "").map((obj) => ({
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
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/project/getYear/${userId}`
        axios
            .get(urlWithParams)
            .then((response) => {
                const fetchedYearOptions = response.data.data.filter((obj) => obj !== "").map((obj) => ({
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
    const fetchAcdemicsYear = () => {
        setIsLoading(true)
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/project/getAcademicSession`
        axios
            .get(urlWithParams)
            .then((response) => {
                const fetchedYearOptions = response.data.data.filter((obj) => obj !== "").map((obj) => ({
                    value: obj,
                    title: obj,
                }))
                setAcademicSession([
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

    
   

    const handleDelete = (id) => {
        const userConfirmed = window.confirm(
            'Are you sure you want to delete this ? This action cannot be undone.',
        )
        if (!userConfirmed) {
            return // Exit if the user cancels
        }

        axios
            .delete(`${process.env.NEXT_PUBLIC_API_URL}/project/delete/${id}`, {
                headers,
            })
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
        setIsUpdateModalOpen(true)
    }

    const handleExportCSV = () => {
        const fields = [
            'id',
            'title',
            'status',
            'referenceNo',
            'fundingAgency',
            'fundingAmount',
            'duration',
            'year',
            'month',
            'principalInvestigator',
            'coprincipalInvestigator',
        ] // Customize fields as per your data
        const opts = { fields }
        try {
            console.log('data', data)
            const csv = parse(data, opts)
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
            saveAs(blob, 'projects_data.csv')
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
    const handleUpdateSubmit = (formData, id) => {
        console.log('id', id)
        axios
            .put(
                `${process.env.NEXT_PUBLIC_API_URL}/project/update/${id}`,
                formData,
                {
                    headers,
                },
            )
            .then((response) => {
                toast.success('Project added successfully')
                fetchData()
                setIsModalOpen(false)
            })
            .catch((error) => {
                toast.error('Error adding Project')
                console.error(error)
            })
    }
    // Handle dynamic CSV download
    const handleDownloadTemplate = () => {
        const inputFields =
            'id,title,status,referenceN,fundingAgency,fundingAmount,duration,year,month,authorName,principalInvestigator,coprincipalInvestigator,'
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
            .post(`${process.env.NEXT_PUBLIC_API_URL}/project`, formData, {
                headers,
            })
            .then((response) => {
                toast.success('Project added successfully')
                fetchData()
                setIsModalOpen(false)
            })
            .catch((error) => {
                toast.error('Error adding project')
                console.error(error)
            })
    }

    const handleCSVSubmit = ({ file, type }) => {
        const formData = new FormData()
        console.log('file', { file, type })
        formData.append('avatar', file) // 'avatar' should match the backend field name

        axios
            .post(`${process.env.NEXT_PUBLIC_API_URL}/project/bulk`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Correct Content-Type for file uploads
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
    const Statusop = [
        { value: ' ', title: 'All' },
        { value: 'Ongoing', title: 'Ongoing' },
        { value: 'Completed', title: 'Completed' },
    ]
    return (
        <div className='h-[92vh]'>
            <Toaster />
            <div className='flex justify-between items-center border-b-2 p-4'>
                <h1 className='font-semibold text-2xl'>Projects</h1>
                <div className='flex justify-center gap-8 '>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className='bg-slate-950 text-white border-3 border rounded-3xl px-4 py-2'
                    >
                        Add Projects
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
                <div className='flex pl-[18px] '>
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
                        filterName='Funding Agency'
                        setFilterValue={setFilter3}
                        options={fundingAgency}
                    />
                    <FilterOptions
                    filterName='Academic Session'
                    setFilterValue={setFilter2}
                    options={academicSession}
                />
                    <FilterOptions
                    filterName='Status'
                    setFilterValue={setFilter4}
                    options={Statusop}
                />
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
                        className='gap-2 w-full'
                        id='projectsSection'
                        ref={tableRef}
                    >
                        <Table
                            isLoading={isLoading}
                            projects={data}
                            onDelete={handleDelete}
                            onUpdate={handleUpdate}
                            setInitialData={setInitialData}
                        />
                    </div>
                </div>
            </div>
            {/* @ts-ignore */}
            <AdminModalProjects
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
            />

            <CSVUploadModal
                isOpen={isCSVModalOpen}
                onClose={() => setIsCSVModalOpen(false)}
                onSubmit={handleCSVSubmit}
            />

            <ProjectUpdateModal
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                onSubmit={handleUpdateSubmit}
                initialData={initialData}
            />
        </div>
    )
}
function Table({ projects, isLoading, onUpdate, onDelete, setInitialData }) {
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
                                    Project Title
                                </th>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6] w-1/12'>
                                    Year
                                </th>
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
                                            <span className='text-[#000] font-semibold tracking-tighter'>
                                                {item?.principalInvestigator}
                                                {/* {item?.principalInvestigator &&
                                                ', '} */}
                                            </span>
                                            <span className='text-[#800000] font-medium'>
                                                {item?.coprincipalInvestigator &&
                                                    ', '}
                                                {item?.coprincipalInvestigator}
                                            </span>

                                            <span className='text-[#0f376f] font-semibold tracking-tighter'>
                                                {item?.title && ', '}
                                                {item.title}
                                            </span>

                                            <span>
                                                {item?.fundingAgency && ', '}
                                                {item?.fundingAgency}
                                            </span>

                                            <span>
                                                {item?.fundingAmount && ' ~ '}
                                                {item?.fundingAmount}
                                            </span>
                                        </td>
                                        <td className='p-2 text-center border border-1 border-solid border-black'>
                                            {item.year}
                                        </td>
                                        <td className='p-2 text-center border border-1 border-solid border-black'>
                                            {item.status}
                                        </td>
                                        <td className='p-2 text-left border border-1 border-solid border-black'>
                                            <ProjectModal item={item} />
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
