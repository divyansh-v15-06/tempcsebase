// Import necessary modules
'use client'
import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { Button } from '@/components/ui/button'

import { CircularProgress } from '@mui/material'
import PatentModal from '@/components/research-components/PatentModal'
import FilterOptions from '@/components/people-components/filterOptions'

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
    const [data, setData] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [filter1, setFilter1] = useState<string>('')
    const [filter2, setFilter2] = useState<string>('')
    const [filter3, setFilter3] = useState<string>('')
    const [filter5, setFilter5] = useState<string>('')
    const [startYear, setStartYear] = useState([{ value: ' ', title: 'All' }])
    const [endYear, setEndYear] = useState([{ value: ' ', title: 'All' }])
    const [facultyName, setFacultyName] = useState([
        { value: ' ', title: 'All' },
    ])
    const tableRef = useRef<HTMLDivElement>(null)
    const [username, setUsername] = useState('')
    const [userId, setUserId] = useState(sessionStorage.getItem('userId') || '')

    useEffect(() => {
        // Read from sessionStorage after component mounts
        setUsername(sessionStorage.getItem('facultyName') || '')
        setUserId(sessionStorage.getItem('userId') || '')
    }, []) // Empty dependency array ensures this runs only on mount

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
        if (username !== '') {
            fetchData()
            fetchFacultyName()
            fetchStartYear()
            fetchEndYear()
        }
    }, [username])

    return (
        <div className='h-[92vh] w-full'>
            <Toaster />
            <div className='flex justify-between items-center border-b-2 p-4'>
                <h1 className='font-semibold text-2xl'>Patents</h1>
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
                </div>
                <div className='flex mr-[2rem]'>
                    <Button className='mx-4' onClick={fetchData}>
                        Filter
                    </Button>
                </div>
            </div>
            <div className='flex h-full'>
                <div className='w-full'>
                    <div
                        className='gap-2 w-full   overflow-y-scroll'
                        id='patentsSection'
                        ref={tableRef}
                    >
                        <Table patents={data} isLoading={isLoading} />
                    </div>
                </div>
            </div>
        </div>
    )
}

function Table({ patents, isLoading }) {
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
