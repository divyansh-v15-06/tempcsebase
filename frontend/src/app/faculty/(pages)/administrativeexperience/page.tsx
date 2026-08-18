// @ts-nocheck
'use client'
import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { saveAs } from 'file-saver'
import { Button } from '@/components/ui/button'
import { MdDelete, MdModeEdit } from 'react-icons/md'
import { parse } from 'json2csv'
import AdminModal from '@/components/admin-components/Modals/adminAdministrativeExperience'
import CSVUploadModal from '@/components/admin-components/Modals/adminCsvModal'
import AdministrativeExperienceModal from '@/components/research-components/AdministrativeExperienceModal'
import FilterOptions from '@/components/people-components/filterOptions'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { useUser } from '../UsernameProvider'
import AdminstrativeUpdateModal from '@/components/admin-components/updateModals/administrativeexperienceUpdatModal'

type Props = {}

const options = {
    academicYear: [
        { value: ' ', title: 'All' },
        { value: '2013', title: '2013' },
        { value: '2015', title: '2015' },
        { value: '2016', title: '2016' },
        // { value: '2018', title: '2018' },
        // { value: '2019', title: '2019' },
        // { value: '2020', title: '2020' },
        // { value: '2021', title: '2021' },
        // { value: '2022', title: '2022' },
    ],
    administrativeexperienceType: [
        { value: ' ', title: 'All' },
        { value: '1', title: 'Journal' },
        { value: '2', title: 'Conference' },
        { value: '3', title: 'Book' },
        { value: '4', title: 'Book Chapter' },
    ],
    academicMonth: [
        { value: ' ', title: 'All' },
        { value: 'october', title: 'October' },
        { value: 'June', title: 'June' },
    ],
}

export default function AdministrativeExperiencesAdmin({}: Props) {
    const [data, setData] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
    const [isCSVModalOpen, setIsCSVModalOpen] = useState(false)
    const [initialData, setInitialData] = useState({})
    const [filter1, setFilter1] = useState<string>('') // startYear
    const [filter2, setFilter2] = useState<string>('')
    const [filter3, setFilter3] = useState<string>('')
    const [filter5, setFilter5] = useState<string>('') // endYear
    const [filter6, setFilter6] = useState<string>('')
    const [startYear, setStartYear] = useState([{ value: ' ', title: 'All' }])
    const [endYear, setEndYear] = useState([{ value: ' ', title: 'All' }])
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [facultyName, setFacultyName] = useState([
        { value: ' ', title: 'All' },
    ])
    const tableRef = useRef<HTMLDivElement>(null)

    const [academicSession, setAcademicSession] = useState([
        { value: ' ', title: 'All' },
    ])
    const [headers, setHeaders] = useState({})
    const [username, setUsername] = useState('')
    const [userId, setUserId] = useState('')

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
    const fetchData = () => {
        const urlWithParams = `${
            process.env.NEXT_PUBLIC_API_URL
        }/AdministrativeExperience/get?facultyId=${userId}&startYear=${filter1.trim()}&endYear=${filter5.trim()}`

        axios
            .get(urlWithParams)
            .then((response) => {
                // console.log('response.data.data', response.data.data)
                setData(response.data)
            })
            .catch((error) => {
                console.error('Error fetching data:', error)
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
                `${process.env.NEXT_PUBLIC_API_URL}/AdministrativeExperience/delete/${id}`,
                {
                    headers,
                },
            )
            .then((response) => {
                toast.success('Administrative experience deleted successfully')
                fetchData()
            })
            .catch((error) => {
                toast.error('Error deleting administrative experience')
                console.error(error)
            })
    }

    const handleUpdate = (id) => {
        setIsUpdateModalOpen(true)
        // toast('Update functionality to be implemented')
    }

    const handleExportCSV = () => {
        const fields = [
            'id',
            'position',
            'organisation',
            'startDate',
            'endDate',
        ] // Customize fields as per your data
        const opts = { fields }
        try {
            console.log('data', data)
            const csv = parse(data.data, opts)
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
            saveAs(blob, 'administrativeexperiences_data.csv')
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
            'authorName,associatedFaculty,title,name,volume,pageNo,year,link,academicSession,indexing'
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
                `${process.env.NEXT_PUBLIC_API_URL}/AdministrativeExperience`,
                formData,
                {
                    headers,
                },
            )
            .then((response) => {
                toast.success('Administrative Experience added successfully')
                fetchData()
                setIsModalOpen(false)
            })
            .catch((error) => {
                toast.error('Error adding administrative experience')
                console.error(error)
            })
    }

    const handleCSVSubmit = ({ file, type }) => {
        const formData = new FormData()
        console.log('file', { file, type })
        formData.append('avatar', file)
        formData.append('type', type)

        axios
            .post(
                `${process.env.NEXT_PUBLIC_API_URL}/AdministrativeExperience/bulk`,
                formData,
                {
                    headers: {
                        ...headers,
                        'Content-Type': 'file',
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
    const handleUpdateSubmit = (formData, id) => {
        // console.log('id', id)
        axios
            .patch(
                `${process.env.NEXT_PUBLIC_API_URL}/AdministrativeExperience/update/${id}`,
                formData,
                {
                    headers,
                },
            )
            .then((response) => {
                toast.success('Adminstrative Experience added successfully')
                fetchData()
                setIsModalOpen(false)
            })
            .catch((error) => {
                toast.error('Error adding Adminstrative Experience ')
                console.error(error)
            })
    }

    // const fetchFacultyName = () => {
    //     setIsLoading(true)
    //     const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/AdministrativeExperience/getFaculty`
    //     axios
    //         .get(urlWithParams)
    //         .then((response) => {
    //             const fetchedYearOptions = response.data.data.map((obj) => ({
    //                 value: obj.name,
    //                 title: obj.name,
    //             }))
    //             setFacultyName([
    //                 { value: ' ', title: 'All' },
    //                 ...fetchedYearOptions,
    //             ])
    //         })
    //         .catch((error) => {
    //             console.error('Error fetching year data:', error)
    //         })
    //         .finally(() => {
    //             setIsLoading(false)
    //         })
    // }
    // const fetchAcademicSession = () => {
    //     setIsLoading(true)
    //     const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/AdministrativeExperience/getAcademicSession`
    //     axios
    //         .get(urlWithParams)
    //         .then((response) => {
    //             const fetchedYearOptions = response.data.data
    //                 .filter((obj) => obj !== '')
    //                 .map((obj) => ({
    //                     value: obj,
    //                     title: obj,
    //                 }))
    //             setAcademicSession([
    //                 { value: ' ', title: 'All' },
    //                 ...fetchedYearOptions,
    //             ])
    //         })
    //         .catch((error) => {
    //             console.error('Error fetching year data:', error)
    //         })
    //         .finally(() => {
    //             setIsLoading(false)
    //         })
    // }
    const fetchStartYear = () => {
        setIsLoading(true)
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/AdministrativeExperience/getYear`
        axios
            .get(urlWithParams)
            .then((response) => {
                const fetchedYearOptions = response.data.data
                    .filter((obj) => obj !== '')
                    .map((obj) => ({
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
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/AdministrativeExperience/getYear`
        axios
            .get(urlWithParams)
            .then((response) => {
                const fetchedYearOptions = response.data.data
                    .filter((obj) => obj !== '')
                    .map((obj) => ({
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
        if (username !== '') {
            fetchData()
            fetchStartYear()
            fetchEndYear()
        }
    }, [username])

    return (
        <div className='h-[92vh]'>
            <Toaster />
            <div className='flex justify-between items-center border-b-2 p-4'>
                <h1 className='font-semibold text-2xl'>
                    Administrative Experience
                </h1>
                <div className='flex justify-center gap-8 '>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className='bg-slate-950 text-white border-3 border rounded-3xl px-4 py-2'
                    >
                        Add Adminstrative Experience
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
                    </Button>
                    <Button
                        onClick={handleExportPDF}
                        className='bg-slate-950 text-white border-3 border rounded-3xl px-4 py-2'
                    >
                        Export as PDF
                    </Button> */}
                </div>
            </div>

            {/* <div className='flex  flex-wrap flex-col lg:flex-row justify-center items-center gap-2 mt-3'> */}
            {/* <FilterOptions
                    filterName='AdministrativeExperience Type'
                    setFilterValue={setFilter3}
                    options={options.administrativeexperienceType}
                /> */}
            {/* <FilterOptions
                    filterName='Start Year'
                    setFilterValue={setFilter1}
                    options={startYear}
                />
                <FilterOptions
                    filterName='End Year'
                    setFilterValue={setFilter5}
                    options={endYear}
                /> */}
            {/* {console.log('academicSession', academicSession)}
                <FilterOptions
                    filterName='Academic Session'
                    setFilterValue={setFilter6}
                    options={academicSession}
                /> */}
            {/* <FilterOptions
                    filterName='Faculty Name'
                    setFilterValue={setFilter2}
                    options={facultyName}
                /> */}

            {/* <Button className='mx-4' onClick={fetchData}>
                    Filter
                </Button>
            </div> */}

            <div className='flex '>
                <div className='w-full'>
                    <div
                        className='gap-2 w-full'
                        id='researchSection'
                        ref={tableRef}
                    >
                        <Table
                            administrativeexperiences={data}
                            onDelete={handleDelete}
                            onUpdate={handleUpdate}
                            setInitialData={setInitialData}
                        />
                    </div>
                </div>
            </div>

            <AdminModal
                addonFaculty={userId}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
            />

            <CSVUploadModal
                isOpen={isCSVModalOpen}
                onClose={() => setIsCSVModalOpen(false)}
                onSubmit={handleCSVSubmit}
            />

            <AdminstrativeUpdateModal
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                onSubmit={handleUpdateSubmit}
                initialData={initialData}
            />
        </div>
    )
}

function Table({
    administrativeexperiences,
    isLoading,
    setInitialData,
    onUpdate,
    onDelete,
}) {
    return (
        <div className='font-sans '>
            {!isLoading ? (
                <div className='overflow-x-auto border rounded my-2 lg:mx-8'>
                    <table className='border-1 rounded border border-solid border-[#dde2e6] w-full'>
                        <thead>
                            <tr className='text-lg bg-[#f7dcdd]'>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                    Sr. No.
                                </th>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] max-w-[200px] border border-1 border-[#dde2e6]'>
                                    Position Held
                                </th>
                                {/* <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                    Month
                                </th> */}
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                    Organization/Department
                                </th>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                    Start Date
                                </th>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                    End Date
                                </th>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                    Duration
                                </th>
                                <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff]'>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {administrativeexperiences.data &&
                            administrativeexperiences?.data?.length > 0 ? (
                                administrativeexperiences.data.map(
                                    (item, index) => (
                                        <tr
                                            key={item.id}
                                            className={
                                                index % 2 ? 'bg-gray-300' : ''
                                            }
                                        >
                                            <td className='p-2 border-b border-r border-l border-solid border-black text-center'>
                                                {index + 1}
                                            </td>
                                            <td className='p-2 text-left border-b border-1 border-solid border-black'>
                                                {/* <span className='text-[#800000] font-semibold'>
                                                {item?.authorName}
                                            </span> */}
                                                <span className='text-[#000] font-semibold tracking-tighter'>
                                                    {item.position}
                                                </span>
                                                
                                            </td>
                                            <td className='p-2 border-b border-r border-l border-solid border-black text-center'>
                                                {item.organisation}
                                            </td>
                                            <td className='p-2 border-b border-r border-l border-solid border-black text-center'>
                                                {new Date(item.startDate).toLocaleDateString('en-GB')}
                                            </td>
                                            <td className='p-2 border-b border-r border-l border-solid border-black text-center'>
                                                {item.endDate==='Present' ? (
                                                    "Present"):(
                                                        new Date(item.endDate).toLocaleDateString('en-GB'))}
                                            </td>
                                            <td className='p-2 text-left border border-1 border-solid border-black'>
                                                {calculateYearsAndMonths(
                                                    item.startDate,
                                                    item.endDate,)}
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
                                    ),
                                )
                            ) : (
                                <tr>
                                    <td className='p-4 text-center'>No data</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : null}
        </div>
    )
}
function calculateYearsAndMonths(fromDate, toDate) {
    const from = new Date(fromDate);
    const to = toDate === "Present" ? new Date() : new Date(toDate);
  
    let years = to.getFullYear() - from.getFullYear();
    let months = to.getMonth() - from.getMonth();
  
    if (months < 0) {
      years--;
      months += 12;
    }
  
    let result = "";
    if (years > 0) {
      result += years + (years === 1 ? " Year" : " Years");
    }
    if (months > 0) {
      if (result !== "") {
        result += ", ";
      }
      result += months + (months === 1 ? " Month" : " Months");
    }
  
    return result || "0 Months";
  }

