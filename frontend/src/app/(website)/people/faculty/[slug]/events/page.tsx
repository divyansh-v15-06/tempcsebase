'use client'
import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { Button } from '@/components/ui/button'

import { CircularProgress } from '@mui/material'
import EventsModal from '@/components/research-components/EventsModal'
import FilterOptions from '@/components/people-components/filterOptions'


type Props = {}

export default function ProjectsAdmin({ }: Props) {
    const [data, setData] = useState([])
    const [filter1, setFilter1] = useState<string>('')
    const [filter3, setFilter3] = useState<string>('')
    const [filter5, setFilter5] = useState<string>('')
    const [category, setCategory] = useState([{ value: 'stc' }])
    // const [endDate, setEndDate] = useState([{ value: ' ', title: 'All' }])
    const [isLoading, setIsLoading] = useState(true)
    // const [startDate, setStartDate] = useState([{ value: ' ', title: 'All' }])
    const [headers, setHeaders] = useState({})
    const tableRef = useRef<HTMLDivElement>(null)
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
                                   Authorization: `Bearer ${sessionStorage.getItem("access_token") as string}`,
            })
        }
    }, [])
    const fetchData = () => {
        setIsLoading(true)
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL
            }/event/get?category=${filter3.trim()}&type=${filter5.trim()}&name=${username}`

        axios
            .get(urlWithParams)
            .then((response) => {
                console.log('response.data.data', response.data.data)
                setData(response.data.data)
                setIsLoading(false)
            })
            .catch((error) => {
                console.error('Error fetching data:', error)
                setIsLoading(false)
            })
    }



    const fetchCategory = () => {
        setIsLoading(true)
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/event/category`
        axios
            .get(urlWithParams)
            .then((response) => {
                const fetchedYearOptions = response.data.data.slice(1).map((obj) => ({
                    value: obj,
                }))
                setCategory(fetchedYearOptions)
                console.log('fetchedYearOptions', fetchedYearOptions)

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
            fetchCategory()
        }
    }, [username])




    return (
        <div className='h-[92vh] w-full'>
            <Toaster />
            <div className='flex justify-between items-center border-b-2 p-4'>
                <h1 className='font-semibold text-2xl'>Events</h1>
                <div className='flex justify-center gap-8 '>
                </div>
            </div>

            <div className='flex flex-col lg:flex-row justify-center items-center gap-2 mt-3'>
                <div className='flex pl-[18px]'>
                <FilterOptions
                    filterName='Category'
                    setFilterValue={setFilter3}
                    options={category}
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
                        <Table
                            isLoading={isLoading}
                            publications={data}
                        />
                    </div>
                </div>
            </div>

        </div>
    )
}
function Table({ publications, isLoading }) {
    return (
        <div className='font-sans my-2'>
            {!isLoading ? (
                <div className='max-h-[28rem] overflow-y-auto overflow-x-auto border rounded  lg:mx-8'>
                    <table className='border-1 rounded border border-solid border-[#dde2e6] w-full'>
                        <thead>
                            <tr className='text-lg bg-[#f7dcdd]'>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                    Sr. No.
                                </th>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] max-w-[200px] border border-1 border-[#dde2e6]'>
                                    Details of the Event
                                </th>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6] w-1/12'>
                                Venue
                                </th>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6] w-1/12'>
                                Category
                                </th>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6] w-1/12'>
                                Type
                                </th>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6] w-1/12'>
                                Start Date
                                </th>
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6] w-1/12'>
                                End Date
                                </th>
                                
                                {/* <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6] '>
                                    Academic Session
                                </th> */}
                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                    View
                                </th>
                                
                            </tr>
                        </thead>
                        <tbody>
                            {publications &&
                            publications.length > 0 ? (
                                publications.map((item, index) => (
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
                                                <span className='text-[#272b40]'>
                                                    {item.Convenor}
                                                </span>
                                                {item.Coordinator && ', '}
                                                {item.Coordinator}
                                            </span>
                                            <span className='text-[#000] font-semibold tracking-tighter'>
                                                {item.title && ', '}
                                                {item.title}
                                            </span>
                                            <span className='text-[#0f376f] font-semibold tracking-tighter'>
                                                {item.name && ', '}
                                                {item.name}
                                            </span>
                                           
                                            <span className='text-[#0e0707] font-semibold'>
                                                {item.sponsoringAgency &&
                                                    ', Sponsored by: '}
                                                {item.sponsoringAgency}
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
                                            {item.venue}
                                        </td>
                                        <td className='p-2 text-center border border-1 border-solid border-black'>
                                            {item.category}
                                        </td>
                                        <td className='p-2 text-center border border-1 border-solid border-black'>
                                            {item.type}
                                        </td>
                                        <td className='p-2 text-center border border-1 border-solid border-black'>
                                            {new Date(item.startDate).toLocaleDateString(
                                                'en-GB')}
                                        </td>
                                        <td className='p-2 text-center border border-1 border-solid border-black'>
                                            {new Date(item.endDate).toLocaleDateString(
                                                'en-GB')}
                                        </td>
                                        
                                        <td className='p-2 text-left border border-1 border-solid border-black'>
                                            <EventsModal item={item} />
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