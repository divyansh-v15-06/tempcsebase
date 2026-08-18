'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import FilterOptions from '@/components/people-components/filterOptions'
import FacultyCards from '@/components/people-components/FacultyCards'
import { Button } from '@/components/ui/button'
import { useSearchParams } from 'next/navigation'
import CircularProgress from '@mui/material/CircularProgress'
// import Modal from '@/components/research-components/Modal'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import ProjectModal from '@/components/research-components/ProjectModal'
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
        { value: '2019', title: '2019' },
        { value: '2020', title: '2020' },
        { value: '2021', title: '2021' },
        { value: '2022', title: '2022' },
        { value: '2023', title: '2023' },
    ],
    fundingAgency: [
        { value: ' ', title: 'All' },
        { value: 'Google', title: 'Google' },
        { value: 'Microsoft', title: 'Microsoft' },
        { value: 'JP Morgan', title: 'JP Morgan' },
        { value: 'Oracle', title: 'Oracle' },
    ],
    status: [
        { value: ' ', title: 'All' },
        { value: 'Ongoing', title: 'Ongoing' },
        { value: 'Completed', title: 'Completed' },
        { value: 'Transferred', title: 'Transferred' },
        { value: 'Closed', title: 'Closed' },
    ],
    facultyName: [
        { value: ' ', title: 'All' },
        { value: 'Dr. Naveen Chauhan', title: 'Dr. Naveen Chauhan' },
        { value: 'Dr. Rajeev Kumar', title: 'Dr. Rajeev Kumar' },
        { value: 'Dr. Jyoti Srivastava', title: 'Dr. Jyoti Srivastava' },
    ],
}

const ProjectsPage: React.FC<Props> = ({ params }) => {
    const searchParams = useSearchParams()
    const [publications, setPublications] = useState<FacultyCard[]>([])
    const [filter1, setFilter1] = useState<string>(searchParams.get('startYear') || '')
    const [filter2, setFilter2] = useState<string>(searchParams.get('facultyName') || '')
    const [filter3, setFilter3] = useState<string>('')
    const [filter4, setFilter4] = useState<string>('')
    const [filter5, setFilter5] = useState<string>(searchParams.get('endYear') || '')
    const [filter6, setFilter6] = useState<string>(searchParams.get('type') ||'') 
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [facultyName, setFacultyName] = useState([
        { value: ' ', title: 'All' },
    ])
    const [startYear, setStartYear] = useState([{ value: ' ', title: 'All' }])
    const [endYear, setEndYear] = useState([{ value: ' ', title: 'All' }])
    const Statusop = [
        { value: ' ', title: 'All' },
        { value: 'Ongoing', title: 'Ongoing' },
        { value: 'Completed', title: 'Completed' },
    ]
    const [fundingAgency, setFundingAgency] = useState([
        { value: ' ', title: 'All' },
    ])
    const routeType = params.slug || ''

    const fetchData = () => {
        setIsLoading(true)
        const urlWithParams = `${api}/project/get/admin?startYear=${filter1.trim()}&name=${filter2.trim()}&type=${filter3.trim()}&month=${filter4.trim()}&endYear=${filter5.trim()}&fundingAgency=${filter3.trim()}&status=${filter6.trim()}`

        axios
            .get(urlWithParams)
            .then((response) => {
                console.log('response in project page', response)
                setPublications(response.data.data)
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
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/project/getFaculty`
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
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/project/getYear`
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
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/project/getYear`
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

    const fetchFundingAgency = () => {
        setIsLoading(true)
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/project/fundingAgency`
        axios
            .get(urlWithParams)
            .then((response) => {
                const fetchedYearOptions = response.data.data.map((obj) => ({
                    value: obj,
                    title: obj,
                }))
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

    useEffect(() => {
        fetchData()
        fetchFacultyName()
        fetchStartYear()
        fetchEndYear()
        fetchFundingAgency()
    }, [])

    useEffect(() => {
        console.log('publications', publications)
    }, [publications])

    useEffect(() => {
        setIsLoading(true)
        setTimeout(() => {
            setIsLoading(false)
        }, 500)
    }, [routeType])
    

    return (
        <div className='overflow-hidden'>
            <div id='peoplesPage' className='my-4   '>
                <div className='text-center text-2xl lg:my-4 lg:text-3xl font-bold'>
                    Projects
                </div>
                <div className='flex flex-col my-12 mx-2 md:mx-6 place-content-center p-0  mt-3 mb-3 gap-4 '>
                    <div className='flex flex-col lg:flex-row justify-center items-center gap-2'>
                       {fundingAgency.length>1&& <FilterOptions
                            filterName='Funding Agency'
                            setFilterValue={setFilter3}
                            options={fundingAgency}
                        />}
                        {facultyName.length>1&&<FilterOptions
                            filterName='Faculty'
                            setFilterValue={setFilter2}
                            options={facultyName}
                            selected={filter2}
                        />}
                        {startYear.length>1&&<FilterOptions
                            filterName='Start Year'
                            setFilterValue={setFilter1}
                            options={startYear}
                            selected={filter1}
                        />}
                        {endYear.length>1&&<FilterOptions
                            filterName='End Year'
                            setFilterValue={setFilter5}
                            options={endYear}
                            selected={filter5}
                        />}
                        {<FilterOptions
                            filterName='Status'
                            setFilterValue={setFilter6}
                            options={Statusop}
                            selected={filter6}
                        />}

                        <Button className='mx-4' onClick={fetchData}>
                            Filter
                        </Button>
                        {/* <Button className='mx-4 hover:bg-red-500'>Reset</Button> */}
                    </div>
                    <div className='  place-content-center p-0 box-border relative min-h-[200px]'>
                        <Table
                            publications={publications}
                            isLoading={isLoading}
                        />
                    </div>
                </div>
            </div>
            {/* </div> */}
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
                                    Project Details
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
                                {/* <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                    Actions
                                </th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {publications && publications.length > 0 ? (
                                publications.map((item, index) => (
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
export default ProjectsPage
