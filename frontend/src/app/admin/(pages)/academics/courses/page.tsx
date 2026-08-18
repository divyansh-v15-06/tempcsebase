'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import CSVUploadModal from '@/components/admin-components/Modals/adminCsvModal'
import { saveAs } from 'file-saver'
import { parse } from 'json2csv'
import { CircularProgress } from '@mui/material'
import AdminModalProgramms from '@/components/admin-components/Modals/adminModalProgramms'
import { MdDelete, MdModeEdit } from 'react-icons/md'
import ProgramsUpdateModal from '@/components/admin-components/updateModals/programsofferedUpdateModal'
import SubjectTaughtModal from '@/components/research-components/subjectModal'
import { Check, TicketCheck, User } from 'lucide-react'
import ProgramsAssignModal from '@/components/admin-components/updateModals/ProgramofferedAssignModal'
import FilterOptions from '@/components/people-components/filterOptions'

type Props = {}

export default function Courses({ }: Props) {
    const [data, setData] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isCSVModalOpen, setIsCSVModalOpen] = useState(false)
    const [filteredData, setfilteredData] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [headers, setHeaders] = useState({})
    const [filter1, setFilter1] = useState('')
    const [filter2, setFilter2] = useState('')
    const [filter3, setFilter3] = useState('')
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
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
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/subjectTaught/get/admin`

        axios
            .get(urlWithParams)
            .then((response) => {
                setData(response.data.data)
                setfilteredData(response.data.data)
                setIsLoading(false)
            })
            .catch((error) => {
                console.error('Error fetching data:', error)
                setIsLoading(false)
            })
    }
   const filterData = () => {
    const filtered = data.filter((item: any) => {
        if (filter1 !== ''&&filter1!==' ' && item.academicYear !== filter1) return false
        if (filter2 !== ''&&filter2!==' ' && item.semester !== filter2) return false
        if (filter3 !== ''&&filter3!==' ' && item.courseLevel !== filter3) return false
        return true
    })
    setfilteredData(filtered)
}


    useEffect(() => {
        fetchData()
    }, [])
    const handleDownloadTemplate = () => {
            const inputFields =
                'courseCode,courseName,semester,courseLevel,lectureHours,tutorialHours,practicalHours,academicYear,associatedFaculty'
            const fieldsArray = inputFields.split(',')
    
            // Convert the fields to a CSV string
            const csvContent = fieldsArray.join(',') + '\n'+',,,,,,,,"CS01,TF05,CS012"'
    
            // Create a Blob from the CSV string
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    
            // Use file-saver to trigger the download
            saveAs(blob, 'template.csv')
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
                `${process.env.NEXT_PUBLIC_API_URL}/subjectTaught/delete/${id}`,
                { headers },
            )
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
        const itemToUpdate = data.find((item: any) => item.id === id)
        if (!itemToUpdate) {
            toast.error('Item not found for update')
            return
        }
        setInitialData(itemToUpdate)
        setIsUpdateModalOpen(true)

        // toast('Update functionality to be implemented')
    }
    const handleAssign = (id) => {
        const itemToUpdate = data.find((item: any) => item.id === id)
        if (!itemToUpdate) {
            toast.error('Item not found for update')
            return
        }
        setInitialData(itemToUpdate)
        setIsAssignModalOpen(true)

        // toast('Update functionality to be implemented')
    }
    const handleUpdateSubmit = (formData, id) => {
        console.log('id', id)
        axios
            .put(
                `${process.env.NEXT_PUBLIC_API_URL}/subjectTaught/update/${id}`,
                formData,
                {
                    headers,
                },
            )
            .then((response) => {
                toast.success('Course Updated successfully')
                fetchData()
                setIsModalOpen(false)
            })
            .catch((error) => {
                toast.error('Error Updating Course')
                console.error(error)
            })
    }

    const handleExportCSV = () => {
        const fields = ['id', 'courseCode', 'courseName', 'semester', 'courseLevel', 'lectureHours', 'tutorialHours', 'practicalHours', 'credits','academicYear', 'AssignedFaculties']
        // const fields = ['id', 'title', 'description', 'link', 'date', 'photo']
        const opts = { fields }
        try {
            console.log('data', data)
            const csv = parse(data.map((sub: any) => {
                return {
                    id: sub.id,
                    courseCode: sub.courseCode,
                    courseName: sub.courseName,
                    semester: sub.semester,
                    courseLevel: sub.courseLevel,
                    lectureHours: sub.lectureHours,
                    tutorialHours: sub.tutorialHours,
                    practicalHours: sub.practicalHours,
                    credits: (sub.practicalHours * 0.5) + sub.tutorialHours + sub.lectureHours,
                    academicYear: sub.academicYear,
                    AssignedFaculties: sub.faculty_detail.map((fac) => fac.uniqueFacultyId).join(', '),
                }
            }), opts)
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
            saveAs(blob, 'CoursesTaught_data.csv')
        } catch (err) {
            console.error('Error exporting data to CSV:', err)
        }
    }

    const handleModalSubmit = (formData) => {
        axios
            .post(
                `${process.env.NEXT_PUBLIC_API_URL}/subjectTaught`,
                formData,
                { headers },
            )
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

    const handleCSVSubmit = ({ file }) => {
        const formData = new FormData()
        formData.append('avatar', file)

        axios
            .post(
                `${process.env.NEXT_PUBLIC_API_URL}/subjectTaught/bulk`,
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
    const acdemicYearsoptions = data.map((item: any) => {
        return {
            value: item.academicYear,
            title: item.academicYear
        }

    })
    const semesterOptions = data.map((item: any) => {
        return { value: item.semester, title: `Semester ${item.semester}` }
    })

    return (
        <div>
            <div className='h-[92vh]'>
                <Toaster />
                <div className='flex justify-between items-center border-b-2 p-4'>
                    <h1 className='font-semibold text-2xl'>
                        Courses Taught
                    </h1>
                    <div className='flex justify-center gap-8 '>
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            className='bg-slate-950 text-white border-3 border rounded-3xl px-4 py-2'
                        >
                            Add Course
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
                            className='bg-black text-white border-3 border rounded-3xl px-4 py-2'
                        >
                            Download Template
                        </Button>
                    </div>
                </div>
                <div className='flex flex-col lg:flex-row justify-center items-center gap-2 my-3'>
                    <FilterOptions
                        filterName='Academic Year'
                        setFilterValue={setFilter1}
                        options={[{value:' ',title:"All"},...acdemicYearsoptions]}
                    />
                    <FilterOptions
                        filterName='Semester'
                        setFilterValue={setFilter2}
                        options={[{value:' ',title:"All"},...semesterOptions]}
                    />
                    <FilterOptions
                        filterName='Course Level'
                        setFilterValue={setFilter3}
                        options={[
                            { value: ' ', title: 'All' },
                            { value: 'UG', title: 'UG' },
                            { value: 'PG', title: 'PG' },]}
                    />
                    <Button className='mx-4' onClick={filterData}>
                        Filter
                    </Button>
                    
                </div>

                <div className='flex '>
                    <div className='w-full'>
                        <div className='gap-2 w-full  ' id='projectsSection'>
                            {isLoading ? (
                                <div className='flex items-center justify-center'>
                                    <CircularProgress color='inherit' />
                                </div>
                            ) : (
                                <Table
                                    data={filteredData}
                                    onDelete={handleDelete}
                                    onUpdate={handleUpdate}
                                    onAssign={handleAssign}
                                />
                            )}
                        </div>
                    </div>
                </div>

                <AdminModalProgramms
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleModalSubmit}
                />

                <CSVUploadModal
                    isOpen={isCSVModalOpen}
                    onClose={() => setIsCSVModalOpen(false)}
                    onSubmit={handleCSVSubmit}
                />
                <ProgramsUpdateModal
                    isOpen={isUpdateModalOpen}
                    onClose={() => setIsUpdateModalOpen(false)}
                    onSubmit={handleUpdateSubmit}
                    initialData={initialData}
                />
                <ProgramsAssignModal
                    isOpen={isAssignModalOpen}
                    onClose={() => setIsAssignModalOpen(false)}
                    onSubmit={handleUpdateSubmit}
                    initialData={initialData}
                />
            </div>
        </div>
    )
}

function Table({ data, onUpdate, onDelete, onAssign }) {
    return (
        <div className='font-sans relative'>
            <div className='overflow-x-auto border rounded my-2 lg:mx-8'>
                <table className='border-1 rounded border border-solid border-[#dde2e6] w-full'>
                    <thead>
                        <tr className='text-md bg-[#f7dcdd]'>
                            <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6] w-1/12'>
                                Sr. No.
                            </th>
                            <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                Course Code
                            </th>
                            <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                Course Name
                            </th>
                            <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                Semester
                            </th>
                            <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                UG/PG
                            </th>
                            <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                L
                            </th>
                            <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                T
                            </th>
                            <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                P
                            </th>
                            <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                Credits
                            </th>
                            <th className='text-nowrap p-3 text-center  bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                Academic Year
                            </th>
                            <th className='text-nowrap p-3 text-center  bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                Teacher Assigned
                            </th>
                            <th className='text-nowrap p-3 text-center  bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                Action
                            </th>
                            <th className='text-nowrap p-3 text-center  bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                Details
                            </th>
                        </tr>
                    </thead>
                    <tbody
                        className='text-sm font-normal'>
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
                                        {item.courseCode}
                                    </td>
                                    <td className='p-2 text-left border border-1 border-solid border-black'>
                                        {item.courseName}
                                    </td>
                                    <td className='p-2 text-left border border-1 border-solid border-black'>
                                        {item.semester}
                                    </td>

                                    <td className='p-2 text-left border border-1 border-solid border-black'>
                                        {item.courseLevel}
                                    </td>
                                    <td className='p-2 text-left border border-1 border-solid border-black'>
                                        {item.lectureHours}
                                    </td>
                                    <td className='p-2 text-left border border-1 border-solid border-black'>
                                        {item.tutorialHours}
                                    </td>
                                    <td className='p-2 text-left border border-1 border-solid border-black'>
                                        {item.practicalHours}
                                    </td>
                                    <td className='p-2 text-left border border-1 border-solid border-black'>
                                        {(item.practicalHours*0.5) + item.tutorialHours + item.lectureHours}
                                    </td>


                                    <td className='p-2 text-left border border-1 border-solid border-black'>
                                        {item.academicYear}
                                    </td>
                                    <td className='p-2  border border-1 border-solid border-black text-center overflow-auto no-scrollbar  '>
                                        {item.faculty_detail.length > 0 ? (
                                            <div className='flex justify-center items-center gap-2'>
                                                {item.faculty_detail.map((fac) => (
                                                    <img
                                                        key={fac.id}
                                                        src={fac.photo}
                                                        alt='Faculty'
                                                        className='w-8 h-8 rounded-full'
                                                    />))}
                                            </div>
                                        ) : (
                                            <span className='text-center'>No Faculty Assigned</span>
                                        )
                                        }
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
                                                    onAssign(item.id)
                                                }
                                                className='p-2 bg-green-500 text-white rounded'
                                            >
                                                <User className='p-1 ' />
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
                                    <td className='p-2 text-left border border-1 border-solid border-black'>
                                        <SubjectTaughtModal item={item} />
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
