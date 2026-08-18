'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import FilterOptions from '@/components/people-components/filterOptions'
import { Button } from '@/components/ui/button'
import CircularProgress from '@mui/material/CircularProgress'
import PatentModal from '@/components/research-components/PatentModal'
import { useSearchParams } from 'next/navigation'
const api = process.env.NEXT_PUBLIC_API_URL

type RouterParams = {
    slug: string
}

type Props = {
    params: RouterParams
}

interface FacultyCard {
    name: string
    position: string
    phone_no: number
    email: string
    photo: string
    portfolio: string
}

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

const PatentsPage: React.FC<Props> = ({ params }) => {
    const searchParams = useSearchParams()
    const [publications, setPublications] = useState<FacultyCard[]>([])
    const [filter1, setFilter1] = useState<string>(searchParams.get('startYear') || '')
    const [filter2, setFilter2] = useState<string>(searchParams.get('facultyName') || '')
    const [filter3, setFilter3] = useState<string>(searchParams.get('type') || '')
    const [filter4, setFilter4] = useState<string>('')
    const [filter5, setFilter5] = useState<string>(searchParams.get('endYear') || '')
    const [filter6, setFilter6] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [startYear, setStartYear] = useState([{ value: ' ', title: 'All' }])
    const [endYear, setEndYear] = useState([{ value: ' ', title: 'All' }])
    const [facultyName, setFacultyName] = useState([
        { value: ' ', title: 'All' },
    ])
    const [academicSession, setAcademicSession] = useState([
        { value: ' ', title: 'All' },
    ])
    const [year, setYear] = useState([{ value: ' ', title: 'All' }])
    const routeType = params.slug || ''

    const fetchData = () => {
        setIsLoading(true)
        const urlWithParams = `${api}/patent/get/admin?startYear=${filter1.trim()}&name=${filter2.trim()}&status=${filter3.trim()}&month=${filter4.trim()}&endYear=${filter5.trim()}&academicSession=${filter6.trim()}`

        axios
            .get(urlWithParams)
            .then((response) => {
                console.log(response.data)
                setPublications(response.data)
            })
            .catch((error) => {
                console.error('Error fetching data:', error)
            })
            .finally(() => {
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

    const fetchAcademicSession = () => {
        setIsLoading(true)
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/patent/getAcademicSession`
        axios
            .get(urlWithParams)
            .then((response) => {
                const fetchedYearOptions = response.data.data.map((obj) => ({
                    value: obj.name,
                    title: obj.name,
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

    const fetchStartYear = () => {
        setIsLoading(true)
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/patent/getYear`
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
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/patent/getYear`
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
        setIsLoading(true)
        setTimeout(() => {
            setIsLoading(false)
        }, 500)
    }, [routeType])

    useEffect(() => {
        fetchData()
        fetchFacultyName()
        fetchStartYear()
        fetchEndYear()
        fetchAcademicSession()
    }, [])

    // console.log('publications.data', publications.data)
    return (
        <div className='overflow-hidden'>
            <div id='peoplesPage' className='my-4'>
                <div className='text-center text-2xl lg:my-4 lg:text-3xl font-bold'>
                    Patents
                </div>
                <div className='flex flex-col my-12 mx-2 md:mx-6 place-content-center p-0 mt-3 mb-3 gap-4'>
                    <div className='flex flex-col lg:flex-row justify-center items-center gap-2'>
                        <FilterOptions
                            filterName='Start Year'
                            setFilterValue={setFilter1}
                            options={startYear}
                            selected={filter1}
                        />
                        <FilterOptions
                            filterName='End Year'
                            setFilterValue={setFilter5}
                            options={endYear}
                            selected={filter5}
                        />
                        {/* <FilterOptions
                            filterName='Month'
                            setFilterValue={setFilter4}
                            options={options.academicMonth}
                        /> */}
                        <FilterOptions
                            filterName='Patent status'
                            setFilterValue={setFilter3}
                            options={options.patentStatus}
                            selected={filter3}
                        />
                        <FilterOptions
                            filterName='Faculty member'
                            setFilterValue={setFilter2}
                            options={facultyName}
                            selected={filter2}
                        />
                        {/* <FilterOptions
                            filterName='Academic Session'
                            setFilterValue={setFilter6}
                            options={academicSession}
                        /> */}
                        <Button className='mx-4' onClick={fetchData}>
                            Filter
                        </Button>
                    </div>
                    <div className='place-content-center p-0 box-border mt-3 mb-3'>
                        <Table
                            publications={publications}
                            isLoading={isLoading}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

function Table({ publications, isLoading }) {
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
                                    Patent Details
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
                                {/* <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                    Actions
                                </th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {publications.data &&
                            publications.data.length > 0 ? (
                                publications.data.map((item, index) => (
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
                                            {new Date(
                                                item.filledDate
                                            ).toLocaleDateString('en-GB')}
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

export default PatentsPage
