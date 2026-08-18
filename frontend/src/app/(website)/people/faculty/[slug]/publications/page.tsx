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
import CSVUploadModal from '@/components/admin-components/Modals/adminCsvModal'
import PublicationsModal from '@/components/research-components/PublicationsModal'
import AdminModalPublications from '@/components/admin-components/Modals/adminModalPublications'
import PublicationUpdateModal from '@/components/admin-components/updateModals/publicationUpdateModal'
import FilterOptions from '@/components/people-components/filterOptions'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { useUser } from '../UsernameProvider'
import { useSearchParams } from 'next/navigation'
import { useParams } from 'next/navigation'

type Props = {}

const options = {
    academicYear: [
        { value: ' ', title: 'All' },
        { value: '2013', title: '2013' },
        { value: '2015', title: '2015' },
        { value: '2016', title: '2016' },
    ],
    publicationType: [
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

export default function PublicationsAdmin({}: Props) {
    const type = useSearchParams().get('type') // Get the type query parameter
    const [data, setData] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
    const [isCSVModalOpen, setIsCSVModalOpen] = useState(false)
    const [initialData, setInitialData] = useState({})
    const [filter1, setFilter1] = useState<string>('') // startYear
    const [filter2, setFilter2] = useState<string>('')
    const [filter3, setFilter3] = useState<string>(type || '') // type
    const [filter5, setFilter5] = useState<string>('') // endYear
    const [filter6, setFilter6] = useState<string>('')
    const [filter7, setFilter7] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [startYear, setStartYear] = useState([{ value: ' ', title: 'All' }])
    const [endYear, setEndYear] = useState([{ value: ' ', title: 'All' }])
    const [facultyName, setFacultyName] = useState([
        { value: ' ', title: 'All' },
    ])
    const tableRef = useRef<HTMLDivElement>(null)
    const [academicSession, setAcademicSession] = useState([
        { value: ' ', title: 'All' },
    ])
    const [indexingOptions, setIndexingOptions] = useState([
        { value: ' ', title: 'All' },
    ])

    const [headers, setHeaders] = useState({})
    const [username, setUsername] = useState('')
    const [userId, setUserId] = useState('')
    const params = useParams()
        const facultyId = params.slug
    
        useEffect(() => {
            // Only fetch if userId is available
    
            const fetchFacultyDetails = async () => {
                try {
                    
                    const response = await fetch(
                        // replaced with that slug ( faculty name in our case)
    
                        // todo : add this endpoint in the backend to fetch the details in one call
                        `${process.env.NEXT_PUBLIC_API_URL}/faculty/get/${facultyId}`,
                    )
                    if (!response.ok) {
                        throw new Error('Failed to fetch faculty details')
                    }
                    const data = await response.json()
    
                    // Access the faculty details from the nested structure
                    if (data.success && data?.data?.name) {
                        
                        setUsername( data.data.name)
                        // we are getting numeric id from backend
                        setUserId( facultyId as string)
                    } else {
                        throw new Error('Faculty details not found')
                    }
                } catch (err) {
                    console.error(err)
                    
                } 
            }
    
            fetchFacultyDetails()
        }, [params.slug])
   

    // Empty dependency array ensures this runs only on mount
    useEffect(() => {
        console.log('Current type from URL:', type) // Check URL parameter
        if (type) {
            setFilter3(type) // Set state
        }
    }, [type])

    useEffect(() => {
        console.log('Fetching with filter3:', filter3) // Ensure correct filter is used
        if (filter3) {
            fetchData()
        }
    }, [filter3])
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
        const urlWithParams = `${
            process.env.NEXT_PUBLIC_API_URL
        }/publication/get?startYear=${filter1.trim()}&name=${username}&type=${filter3.trim()}&endYear=${filter5.trim()}&academicSession=${filter6.trim()}`
        console.log('Fetching data from:', urlWithParams);
        
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

    // todo change the api url after api creation
    const fetchFacultyName = () => {
        setIsLoading(true)
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/publication/getFaculty`
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
    const fetchAcademicSession = () => {
        setIsLoading(true)
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/publication/getAcademicSession/${userId}`
        axios
            .get(urlWithParams)
            .then((response) => {
                const fetchedYearOptions = response.data.data
                    .filter((obj) => obj !== '')
                    .map((obj) => ({
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
    const fetchIndexing = () => {
        setIsLoading(true)
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/publication/getIndexing/${userId}`
        axios
            .get(urlWithParams)
            .then((response) => {
                const fetchedYearOptions = response.data.data
                    .filter((obj) => obj !== '')
                    .map((obj) => ({
                        value: obj,
                        title: obj,
                    }))
                console.log(urlWithParams)
                setIndexingOptions([
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
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/publication/getYear/${userId}`
        axios
            .get(urlWithParams)
            .then((response) => {
                const fetchedYearOptions = response.data.data
                    .filter((obj) => obj !== '')
                    .map((obj) => ({
                        value: obj,
                        title: obj,
                    }))
                console.log('hello', fetchedYearOptions)
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
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/publication/getYear/${userId}`
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
            fetchFacultyName()
            fetchStartYear()
            fetchEndYear()
            fetchIndexing()
            fetchAcademicSession()
        }
    }, [username])

    return (
        <div className='h-[92vh] w-full'>
            <Toaster />
            <div className='flex justify-between items-center border-b-2 p-4'>
                <h1 className='font-semibold text-2xl'>Publications</h1>
                <div className='flex justify-center gap-8 '></div>
            </div>

            <div className='flex justify-center flex-wrap flex-col lg:flex-row items-center gap-2 mt-3'>
                <div className='flex justify-start pl-[18px]'>
                    {/* <FilterOptions
                        filterName='Publication Type'
                        setFilterValue={setFilter3}
                        options={options.publicationType}
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
                    />
                    <FilterOptions
                        filterName='Academic Session'
                        setFilterValue={setFilter6}
                        options={academicSession}
                    />
                    <FilterOptions
                        filterName='Indexing'
                        setFilterValue={setFilter7}
                        options={indexingOptions}
                    /> */}
                </div>
                {/* <div className='flex mr-[1rem]'>
                    <Button className='mx-4' onClick={fetchData}>
                        Filter
                    </Button>
                </div> */}
            </div>

            <div className='flex '>
                <div className='w-full'>
                    <div
                        className='gap-2 w-full'
                        id='researchSection'
                        ref={tableRef}
                    >
                        <Table
                            publications={data}
                            setInitialData={setInitialData}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

function Table({ publications, isLoading, setInitialData }) {
    return (
        <div className='font-sans '>
            {!isLoading ? (
                <div className='overflow-x-auto border rounded my-2 lg:mx-8'>
                    <div className='max-h-[32rem] overflow-y-auto'>
                        <table className='border-1 rounded border border-solid border-[#dde2e6] w-full'>
                            <thead>
                                <tr className='text-lg bg-[#f7dcdd]'>
                                    <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                        Sr. No.
                                    </th>
                                    <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] max-w-[200px] border border-1 border-[#dde2e6]'>
                                        Publication Details
                                    </th>
                                    <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                        Year
                                    </th>
                                    <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                        Indexing
                                    </th>
                                    <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                        View
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {publications.data &&
                                publications?.data?.length > 0 ? (
                                    publications.data.map((item, index) => (
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
                                                <span className='text-[#800000] font-semibold'>
                                                    {item?.authorName}
                                                    {/* {item?.authorName && ','} */}
                                                </span>
                                                <span className='text-[#000] font-semibold tracking-tighter'>
                                                    {item.title && ', '}
                                                    {item.title}
                                                </span>
                                                <span className='text-[#0f376f] font-semibold tracking-tighter'>
                                                    {item.name && ', '}
                                                    {item.name}
                                                </span>
                                                {item?.volume && ',Vol: '}
                                                {item?.volume}
                                                {/* {item?.volume && ', '} */}
                                                {item?.issue && ',Issue: '}
                                                {item?.issue}
                                                {item?.journalQuartile && ',Quartile: '}
                                                {item?.journalQuartile}
                                                {/* {item?.issue && ', '} */}
                                                {/* -------- */}
                                                {item?.pageNo &&
                                                    item.pageNo.includes('-') &&
                                                    item.pageNo
                                                        .split('-')
                                                        .every(
                                                            (part) =>
                                                                part.trim() !==
                                                                '',
                                                        ) && (
                                                        <>
                                                            {',Pages: '}
                                                            {item.pageNo}
                                                        </>
                                                    )}
                                            </td>
                                            <td className='p-2 text-center border border-1 border-solid border-black'>
                                                {/* {item?.year && ', '} */}
                                                {item?.year}
                                            </td>
                                            <td className='p-2 text-center border border-1 border-solid border-black'>
                                                {/* {item?.indexing && ', '} */}
                                                {item?.indexing}
                                            </td>
                                            <td className='p-2 text-left border border-1 border-solid border-black'>
                                                <PublicationsModal
                                                    item={item}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr className='w-full'>
                                        <td
                                            className='p-4 text-center w-full'
                                            colSpan={5}
                                        >
                                            No data
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : null}
        </div>
    )
}
