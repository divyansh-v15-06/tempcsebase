'use client'
import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { CircularProgress } from '@mui/material'
import ProjectModal from '@/components/research-components/ProjectModal'
import FilterOptions from '@/components/people-components/filterOptions'

type Props = {}

export default function ProjectsAdmin({}: Props) {
    const [data, setData] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isCSVModalOpen, setIsCSVModalOpen] = useState(false)
    const [filter1, setFilter1] = useState<string>('')
    const [filter3, setFilter3] = useState<string>('')
    const [filter5, setFilter5] = useState<string>('')
    const [filter2, setFilter2] = useState<string>('')
    const [isLoading, setIsLoading] = useState(true)
    const [startYear, setStartYear] = useState([{ value: ' ', title: 'All' }])
    const [endYear, setEndYear] = useState([{ value: ' ', title: 'All' }])
    const [fundingAgency, setFundingAgency] = useState([
        { value: ' ', title: 'All' },
    ])
    const [initialData, setInitialData] = useState({})
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
    const [headers, setHeaders] = useState({})
    const tableRef = useRef<HTMLDivElement>(null)
    const [username, setUsername] = useState('')
    const [userId, setUserId] = useState(sessionStorage.getItem('userId') || '')

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
                                   Authorization: `Bearer ${sessionStorage.getItem("access_token") as string}`,
            })
        }
    }, [])
    const fetchData = () => {
        setIsLoading(true)
        const urlWithParams = `${
            process.env.NEXT_PUBLIC_API_URL
        }/project/get?startYear=${filter1.trim()}&fundingAgency=${filter3.trim()}&endYear=${filter5.trim()}&name=${userId}&status=${filter2.trim()}`

        axios
            .get(urlWithParams)
            .then((response) => {
                console.log('response.data.data Projects', response.data.data)
                setData(response.data.data)
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

    useEffect(() => {
        if (username !== '') {
            fetchData()
            fetchFundingAgency()
            fetchStartYear()
            fetchEndYear()
        }
    }, [username])
    const Statusop = [
        { value: ' ', title: 'All' },
        { value: 'Ongoing', title: 'Ongoing' },
        { value: 'Completed', title: 'Completed' },
    ]

    return (
        <div className='h-[92vh] w-full'>
            <Toaster />
            <div className='flex justify-between items-center border-b-2 p-4'>
                <h1 className='font-semibold text-2xl'>Projects</h1>
            </div>

            <div className='flex flex-col lg:flex-row justify-center items-center  mt-3'>
                <div className='flex pl-[18px]'>
                    <FilterOptions
                        filterName='Funding Agency'
                        setFilterValue={setFilter3}
                        options={fundingAgency}
                    />
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
                        filterName='Status'
                        setFilterValue={setFilter2}
                        options={Statusop}
                    />
                </div>

                <div className='flex mr-[1rem]'>
                    <Button className='mx-4' onClick={fetchData}>
                        Filter
                    </Button>
                </div>
            </div>

            <div className='flex h-full'>
                <div className='w-full'>
                    <div
                        className='gap-2 w-full'
                        id='projectsSection'
                        ref={tableRef}
                    >
                        <Table isLoading={isLoading} projects={data} />
                    </div>
                </div>
            </div>
        </div>
    )
}
function Table({ projects, isLoading }) {
    return (
        <div className='font-sans relative'>
            {isLoading ? (
                <div className='absolute inset-0 flex items-center justify-center'>
                    <CircularProgress color='inherit' />
                </div>
            ) : (
                <div className='overflow-x-auto border rounded my-2 lg:mx-8'>
                    <div className='max-h-[32rem] overflow-y-auto'>
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
                                                    {
                                                        item?.principalInvestigator
                                                    }
                                                    {/* {item?.principalInvestigator &&
                                                ', '} */}
                                                </span>
                                                <span className='text-[#800000] font-medium'>
                                                    {item?.coprincipalInvestigator &&
                                                        ', '}
                                                    {
                                                        item?.coprincipalInvestigator
                                                    }
                                                </span>

                                                <span className='text-[#0f376f] font-semibold tracking-tighter'>
                                                    {item?.title && ', '}
                                                    {item.title}
                                                </span>

                                                <span>
                                                    {item?.fundingAgency &&
                                                        ', '}
                                                    {item?.fundingAgency}
                                                </span>

                                                <span>
                                                    {item?.fundingAmount &&
                                                        ' ~ '}
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
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td className='p-4 text-center'>
                                            No data
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
