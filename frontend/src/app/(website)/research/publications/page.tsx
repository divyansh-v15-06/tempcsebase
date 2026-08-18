'use client'
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'
import FilterOptions from '@/components/people-components/filterOptions'
import FacultyCards from '@/components/people-components/FacultyCards'
import { Button } from '@/components/ui/button'
import CircularProgress from '@mui/material/CircularProgress'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import PublicationsModal from '@/components/research-components/PublicationsModal'

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
        { value: '2013', title: '2013' },
        { value: '2015', title: '2015' },
        { value: '2016', title: '2016' },
        // { value: '2018', title: '2018' },
        // { value: '2019', title: '2019' },
        // { value: '2020', title: '2020' },
        // { value: '2021', title: '2021' },
        // { value: '2022', title: '2022' },
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

const Page: React.FC<Props> = ({ params }) => {
    const [publications, setPublications] = useState<FacultyCard[]>([])
    const searchParams = useSearchParams()
    const [filter1, setFilter1] = useState<string>(searchParams.get('startYear') || ' ')
    const [filter2, setFilter2] = useState<string>(searchParams.get('facultyName') || ' ')
    const [filter3, setFilter3] = useState<string>(searchParams.get('type')==='journal'?"1": (searchParams.get('type')==='conference'?"2":(searchParams.get('type')==='book'?"3":(searchParams.get('type')==='bookchapter'?"4":" "))))
    // const [filter4, setFilter4] = useState<string>('')
    const [filter5, setFilter5] = useState<string>(searchParams.get('endYear') || ' ')
    const [filter6, setFilter6] = useState<string>(' ')
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [facultyName, setFacultyName] = useState([
        { value: ' ', title: 'All' },
    ])
    const [indexingOptions, setIndexingOptions] = useState([
        { value: ' ', title: 'All' },
    ])
    const [startYear, setStartYear] = useState([{ value: ' ', title: 'All' }])
    const [endYear, setEndYear] = useState([{ value: ' ', title: 'All' }])

    const routeType = params.slug || ' '

    const fetchData = () => {
        setIsLoading(true)
        const urlWithParams = `${
            process.env.NEXT_PUBLIC_API_URL
        }/publication/get/admin?startYear=${filter1.trim()}&name=${filter2.trim()}&type=${filter3.trim()}&indexing=${filter6.trim()}&endYear=${filter5.trim()}`

        axios
            .get(urlWithParams)
            .then((response) => {
                console.log(response)
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
    const fetchIndexing = () => {
        setIsLoading(true)
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/publication/getIndexing`
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
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/publication/getYear`
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
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/publication/getYear`

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

    //

    useEffect(() => {
        fetchData()
        fetchFacultyName()
    }, [])

    useEffect(() => {
        fetchData()
        fetchStartYear()
    }, [])

    useEffect(() => {
        fetchData()
        fetchIndexing()
        fetchEndYear()
    }, [])

    useEffect(() => {
        setIsLoading(true)
        setTimeout(() => {
            setIsLoading(false)
        }, 500)
    }, [routeType])

    return (
        <div className='overflow-hidden'>
            <div id='peoplesPage' className='my-4'>
                <div className='text-center text-2xl lg:my-4 lg:text-3xl font-bold'>
                    Publications
                </div>
                <div className='flex flex-col my-12 mx-2 md:mx-6 place-content-center gap-4'>
                    <div className='flex flex-col lg:flex-row justify-center items-center gap-2'>
                        <FilterOptions
                            filterName='Publication Type'
                            setFilterValue={setFilter3}
                            options={options.publicationType}
                            selected={filter3}
                        />
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
                        <FilterOptions
                            filterName='Faculty Name'
                            setFilterValue={setFilter2}
                            options={facultyName}
                            selected={filter2}
                            
                        />
                        <FilterOptions
                            filterName='Indexing'
                            setFilterValue={setFilter6}
                            options={indexingOptions}
                            
                        />
                        <Button className='mx-4' onClick={fetchData}>
                            Filter
                        </Button>
                    </div>
                    <div className='place-content-center p-0 box-border relative'>
                        <Table
                            publications={publications}
                            isLoading={isLoading}
                        />
                        {isLoading && (
                            <div className='absolute inset-0 flex items-center justify-center bg-white opacity-75'>
                                <CircularProgress color='inherit' />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function Table({ publications, isLoading }) {
    return (
        <div className='font-sans'>
            {!isLoading ? (
                <div className='overflow-x-auto border rounded my-2 lg:mx-8'>
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
                            publications.data.length > 0 ? (
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
                                            {item?.volume && ',Vol. : '}
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
                                                        (part) => part !== '',
                                                    ) && (
                                                    <>
                                                        {',PP. : '}
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
                                            <PublicationsModal item={item} />
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
            ) : null}
        </div>
    )
}

export default Page
