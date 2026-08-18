'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import FilterOptions from '@/components/people-components/filterOptions'
import { Button } from '@/components/ui/button'
import CircularProgress from '@mui/material/CircularProgress'
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
    facultyName: [
        {
            value: 'Dr. Robin Singh Bhadoria',
            title: 'Dr. Robin Singh Bhadoria',
        },
        { value: 'Dr. Sangeeta Sharma', title: 'Dr. Sangeeta Sharma' },
        { value: 'Dr. Ram Prakash Sharma', title: 'Dr. Ram Prakash Sharma' },
    ],
    academicYear: [
        { value: ' ', title: 'All' },
        { value: '2013', title: '2013' },
        { value: '2015', title: '2015' },
        { value: '2016', title: '2016' },
        { value: '2018', title: '2018' },
        { value: '2019', title: '2019' },
        { value: '2020', title: '2020' },
        { value: '2021', title: '2021' },
        { value: '2022', title: '2022' },
    ],
    publicationType: [
        { value: ' ', title: 'All' },
        { value: 'Journal', title: 'Journal' },
        { value: 'Conference', title: 'Conference' },
        { value: 'Book', title: 'Book' },
        { value: 'Book Chapter', title: 'Book Chapter' },
        { value: 'Workshop', title: 'Workshop' },
    ],
}

const Page: React.FC<Props> = ({ params }) => {
    const [publications, setPublications] = useState<FacultyCard[]>([])
    const [filter1, setFilter1] = useState<string>('')
    const [filter2, setFilter2] = useState<string>('')
    const [filter3, setFilter3] = useState<string>('')
    const [filter5, setFilter5] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [facultyName, setFacultyName] = useState([
        { value: ' ', title: 'All' },
    ])
    const [category, setCategory] = useState([{ value: ' ', title: 'All' }])
    const [type, setType] = useState([{ value: ' ', title: 'All' }])
    const [academicSession, setAcademicSession] = useState([
        { value: ' ', title: 'All' },
    ])

    const routeType = params.slug || ''

    const fetchData = () => {
        setIsLoading(true)
        const urlWithParams = `${
            process.env.NEXT_PUBLIC_API_URL
        }/event/get?category=${filter1.trim()}&faculty=${filter2.trim()}&type=${filter3.trim()}&academicSession=${filter5.trim()}`

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
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/event/getFaculty`
        axios
            .get(urlWithParams)
            .then((response) => {
                const fetchedFacultyOptions = response.data.data.map((obj) => ({
                    value: obj.name,
                    title: obj.name,
                }))
                setFacultyName([
                    { value: ' ', title: 'All' },
                    ...fetchedFacultyOptions,
                ])
            })
            .catch((error) => {
                console.error('Error fetching faculty data:', error)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    const fetchCategory = () => {
        setIsLoading(true)
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/event/category`
        axios
            .get(urlWithParams)
            .then((response) => {
                const fetchedCategoryOptions = response.data.data.map(
                    (obj) => ({
                        value: obj,
                        title: obj,
                    }),
                )
                setCategory([
                    { value: ' ', title: 'All' },
                    ...fetchedCategoryOptions,
                ])
            })
            .catch((error) => {
                console.error('Error fetching category data:', error)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    const fetchAcademicSession = () => {
        setIsLoading(true)
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/event/type`
        axios
            .get(urlWithParams)
            .then((response) => {
                const fetchedAcademicSessionOptions = response.data.data.map(
                    (obj) => ({
                        value: obj,
                        title: obj,
                    }),
                )
                setType([
                    { value: ' ', title: 'All' },
                    ...fetchedAcademicSessionOptions,
                ])
            })
            .catch((error) => {
                console.error('Error fetching type data:', error)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    const fetchType = () => {
        setIsLoading(true)
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/event/type`
        axios
            .get(urlWithParams)
            .then((response) => {
                const fetchedTypeOptions = response.data.data.map((obj) => ({
                    value: obj,
                    title: obj,
                }))
                setType([{ value: ' ', title: 'All' }, ...fetchedTypeOptions])
            })
            .catch((error) => {
                console.error('Error fetching type data:', error)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    // const fetchEndYear = () => {
    //     setIsLoading(true)
    //     const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/event/getYear`
    //     axios
    //         .get(urlWithParams)
    //         .then((response) => {
    //             const fetchedYearOptions = response.data.data.map((obj) => ({
    //                 value: obj,
    //                 title: obj,
    //             }))
    //             setEndYear([
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

    useEffect(() => {
        fetchData()
        fetchFacultyName()
    }, [])

    useEffect(() => {
        fetchData()
        fetchCategory()
    }, [])

    useEffect(() => {
        fetchData()
        fetchType()
    }, [])

    useEffect(() => {
        fetchData()
        fetchAcademicSession()
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
                    Consultancy
                </div>
                <div className='flex flex-col my-12 mx-6 place-content-center gap-4'>
                    <div className='flex flex-col lg:flex-row justify-center items-center gap-2'>
                        <FilterOptions
                            filterName='Author Name'
                            setFilterValue={setFilter1}
                            options={category}
                        />
                        <FilterOptions
                            filterName='Associated Faculty'
                            setFilterValue={setFilter3}
                            options={type}
                        />
                        <FilterOptions
                            filterName='Client Organization'
                            setFilterValue={setFilter5}
                            options={academicSession}
                        />
                        <FilterOptions
                            filterName='Academic Session'
                            setFilterValue={setFilter2}
                            options={facultyName}
                        />
                        <FilterOptions
                            filterName='Status'
                            setFilterValue={setFilter2}
                            options={facultyName}
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
                                    Details of the consultancy
                                </th>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                    Client Organization
                                </th>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                    Status
                                </th>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                    Academic Session
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
                                                {options.facultyName.map(
                                                    (faculty, idx) => (
                                                        <React.Fragment
                                                            key={faculty.value}
                                                        >
                                                            {faculty.title}
                                                            {idx <
                                                                options
                                                                    .facultyName
                                                                    .length -
                                                                    1 && ', '}
                                                        </React.Fragment>
                                                    ),
                                                )}
                                            </span>
                                            <span className='text-[#000] font-semibold tracking-tighter'>
                                                {item.title && ', '}
                                                {item.title}
                                            </span>
                                            <span className='text-[#0f376f] font-semibold tracking-tighter'>
                                                {item.name && ', '}
                                                {item.name}
                                            </span>
                                            <span className='text-[#800000] font-semibold'>
                                                {/* {options.academicYear && ', '} */}
                                                {/* {options.academicYear.map(
                                                    (year, idx) => (
                                                        <React.Fragment
                                                            key={year.value}
                                                        >
                                                            {year.title}
                                                            {idx <
                                                                options
                                                                    .academicYear
                                                                    .length -
                                                                    1 && ', '}
                                                        </React.Fragment>
                                                    ),
                                                )} */}
                                                {', 2024'}
                                            </span>
                                            {item?.volume && ',Vol: '}
                                            {item?.volume}
                                            {/* {item?.volume && ', '} */}
                                            {item?.issue && ',Issue: '}
                                            {item?.issue}
                                            {/* {item?.issue && ', '} */}
                                            {/* -------- */}
                                            {item?.pageNo &&
                                                item.pageNo.includes('-') &&
                                                item.pageNo
                                                    .split('-')
                                                    .every(
                                                        (part) =>
                                                            part.trim() !== '',
                                                    ) && (
                                                    <>
                                                        {',Pages: '}
                                                        {item.pageNo}
                                                    </>
                                                )}
                                        </td>
                                        <td className='p-2 text-center border border-1 border-solid border-black'>
                                            {/* {item?.year && ', '} */}
                                            {item?.category}
                                        </td>
                                        <td className='p-2 text-center border border-1 border-solid border-black'>
                                            {/* {item?.indexing && ', '} */}
                                            {item?.type}
                                        </td>
                                        <td className='p-2 text-center border border-1 border-solid border-black'>
                                            {/* {item?.indexing && ', '} */}
                                            {item?.venue}
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
