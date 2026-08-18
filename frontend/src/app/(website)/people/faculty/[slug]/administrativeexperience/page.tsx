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
        setUserId(sessionStorage.getItem('facultyId') || '')
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
        <div className='h-[80vh] w-full overflow-y-auto'>
            <Toaster />
            <div className='flex justify-between items-center border-b-2 p-4'>
                <h1 className='font-semibold text-2xl'>
                    Administrative Experience
                </h1>
                
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
                            setInitialData={setInitialData}
                        />
                    </div>
                </div>
            </div>

            
        </div>
    )
}

function Table({
    administrativeexperiences,
    isLoading,
    setInitialData,
    
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
                                    View
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
                                                {item.endDate==="Present"?"Present":new Date(item?.endDate).toLocaleDateString('en-GB')}
                                            </td>
                                            <td className='p-2 text-left border border-1 border-solid border-black'>
                                                <AdministrativeExperienceModal
                                                    item={item}
                                                />
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
