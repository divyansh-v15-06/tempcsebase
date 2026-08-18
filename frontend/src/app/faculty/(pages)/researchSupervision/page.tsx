'use client'
import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { saveAs } from 'file-saver'
import { Button } from '@/components/ui/button'
import { MdDelete, MdModeEdit } from 'react-icons/md'
import { parse } from 'json2csv'
import AdminModalResearchSupervision from '@/components/admin-components/Modals/adminModalResearchSupervision'
import CSVUploadModal from '@/components/admin-components/Modals/adminCsvModal'
import { CircularProgress } from '@mui/material'
import ResearchSupervisionModal from '@/components/research-components/ResearchSupervisionModal'
import FilterOptions from '@/components/people-components/filterOptions'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
// import AdminAdministrativeExperienceUpdate from '@/components/admin-components/updateModals/administrativeexperienceUpdatModal'
import { useUser } from '../UsernameProvider'
import ResearchSuperVisionUpdateModal from '@/components/admin-components/updateModals/researchSupervisionUpdateModal'
import { set } from 'react-datepicker/dist/date_utils'

type Props = {}
type Faculty = {
    uniqueFacultyId: string
    name: string
}

export default function ProjectsAdmin({}: Props) {
    const [data, setData] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isCSVModalOpen, setIsCSVModalOpen] = useState(false)

    const [filter1, setFilter1] = useState<string>('')
    const [filter3, setFilter3] = useState<string>('')
    const [filter5, setFilter5] = useState<string>('')
    const [category, setCategory] = useState([{ value: ' ', title: 'All' }])
    const [endDate, setEndDate] = useState([{ value: ' ', title: 'All' }])
    const [isLoading, setIsLoading] = useState(true)
    const [startDate, setStartDate] = useState([{ value: ' ', title: 'All' }])
    const [initialData, setInitialData] = useState(null)
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
    const [headers, setHeaders] = useState({})
    const [userId, setUserId] = useState('')
    const [username, setUsername] = useState('')

    const tableRef = useRef<HTMLDivElement>(null)

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
        setUsername(sessionStorage.getItem('facultyName') || '')
        setUserId(sessionStorage.getItem('userId') || '')
    }, []) // Empty dependency array ensures this runs only on mount

    const fetchData = () => {
        setIsLoading(true)
        const urlWithParams = `${
            process.env.NEXT_PUBLIC_API_URL
        }/researchSupervision/get?startYear=${filter1.trim()}&endYear=${filter5.trim()}&name=${username}` //change

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
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/researchSupervision/getYear`
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

    const fetchEndDate = () => {
        setIsLoading(true)
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/expertTalk/endDate`
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
            fetchEndDate()
            fetchStartDate()
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
                `${process.env.NEXT_PUBLIC_API_URL}/researchSupervision/delete/${id}`,
                {
                    headers,
                },
            )
            .then((response) => {
                toast.success('Research Supervision deleted successfully')
                fetchData()
            })
            .catch((error) => {
                toast.error('Error deleting Research Supervision')
                console.error(error)
            })
    }

    const handleUpdate = (id) => {
        setIsUpdateModalOpen(true)
    }

    const handleExportCSV = () => {
        const fields = [
            'id',
            'program',
            'scholarName',
            'rollNo',
            'researchTopic',
            'status',
            'year',
            'academicSession',
            'coSupervisors',
            'associatedFaculty',
        ]
        const opts = { fields }
        try {
            console.log('data', data)
            const csv = parse(data, opts)
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
            saveAs(blob, 'expertTalk_data.csv')
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
                pdf.save('researchSupervision.pdf')
            })
        }
    }
    const handleUpdateSubmit = (formData, id) => {
        console.log('id', id)
        axios
            .patch(
                `${process.env.NEXT_PUBLIC_API_URL}/researchSupervision/update/${id}`,
                formData,
                {
                    headers,
                },
            )
            .then((response) => {
                toast.success('Research Supervision added successfully')
                fetchData()
                setIsModalOpen(false)
            })
            .catch((error) => {
                toast.error('Error adding Research Supervision')
                console.error(error)
            })
    }

    const handleDownloadTemplate = () => {
        const inputFields =
            'id,program,scholarName,rollNo,researchTopic,status,year,academicSession,coSupervisors,associatedFaculty,'
        const fieldsArray = inputFields.split(',')

        const csvContent = fieldsArray.join(',') + '\n'

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })

        saveAs(blob, 'template.csv')
    }
    const handleModalSubmit = (formData) => {
        axios
            .post(
                `${process.env.NEXT_PUBLIC_API_URL}/researchSupervision`,
                formData,
                {
                    headers,
                },
            )
            .then((response) => {
                
                
                if(response.data.data[0].message === 'Duplicate Topic found, skipping creation') {
                    toast.error('Duplicate Topic found, skipping creation')
                } else {
                toast.success('Research Supervision added successfully')
                }
                fetchData()
                setIsModalOpen(false)
            })
            .catch((error) => {
                toast.error('Error adding Research Supervision')
                console.error(error)
            })
    }

    const handleCSVSubmit = ({ file, type }) => {
        const formData = new FormData()
        console.log('file', { file, type })
        formData.append('avatar', file)

        axios
            .post(
                `${process.env.NEXT_PUBLIC_API_URL}/researchSupervision/bulk`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
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
                <h1 className='font-semibold text-2xl'>Research Supervision</h1>
                <div className='flex justify-center gap-8 '>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className='bg-slate-950 text-white border-3 border rounded-3xl px-4 py-2'
                    >
                        Add Research Supervision
                    </Button>

                    <Button
                        onClick={handleExportCSV}
                        className='bg-emerald-800 text-white border-3 border rounded-3xl px-4 py-2'
                    >
                        Export CSV
                    </Button>
                </div>
            </div>

            <div className='flex flex-col lg:flex-row justify-center items-center gap-2 mt-3'>
                {/* <FilterOptions
                    filterName='Start Date'
                    setFilterValue={setFilter3}
                    options={startDate}
                />

                <FilterOptions
                    filterName='End Date'
                    setFilterValue={setFilter5}
                    options={endDate}
                />
                <Button className='mx-4' onClick={fetchData}>
                    Filter
                </Button> */}
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

            <AdminModalResearchSupervision
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
            />

            <CSVUploadModal
                isOpen={isCSVModalOpen}
                onClose={() => setIsCSVModalOpen(false)}
                onSubmit={handleCSVSubmit}
            />

            <ResearchSuperVisionUpdateModal
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                onSubmit={handleUpdateSubmit}
                initialData={initialData}
            />
        </div>
    )
}
const programOptions = [
    { value: '1', label: 'M.Tech' },
    { value: '2', label: 'Ph.D' },
]
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
                                    Program
                                </th>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6] w-1/12'>
                                    Scholar Name
                                </th>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6] w-1/12'>
                                    Roll No
                                </th>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6] w-1/12'>
                                    Research Topic
                                </th>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6] w-1/12'>
                                    Status
                                </th>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6] w-1/12'>
                                    Year
                                </th>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6] w-1/12'>
                                    Academic Session
                                </th>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6] w-1/12'>
                                    Co Supervisors
                                </th>
                                {/* <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6] w-1/12'>
                                    Associated Faculty
                                </th> */}
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
                                            {programOptions[item.program-1]?.label}
                                        </td>
                                        <td className='p-2 text-left border border-1 border-solid border-black'>
                                            {item.scholarName}
                                        </td>
                                        <td className='p-2 text-center border border-1 border-solid border-black'>
                                            {item.rollNo}
                                        </td>
                                        <td className='p-2 text-left border border-1 border-solid border-black'>
                                            {item.researchTopic}
                                        </td>
                                        <td className='p-2 text-center border border-1 border-solid border-black'>
                                            {item.status}
                                        </td>
                                        <td className='p-2 text-center border border-1 border-solid border-black'>
                                            {item.year}
                                        </td>
                                        <td className='p-2 text-center border border-1 border-solid border-black'>
                                            {item.academicSession}
                                        </td>
                                        <td className='p-2 text-left border border-1 border-solid border-black'>
                                            {item.coSupervisior}
                                        </td>
                                        {/* <td className='p-2 text-left border border-1 border-solid border-black'>
                                            {item.faculty_detail
                                                ?.map((faculty) => faculty.name)
                                                .join(', ')}
                                        </td> */}
                                        <td className='p-2 text-left border border-1 border-solid border-black'>
                                            <ResearchSupervisionModal
                                                item={item}
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
