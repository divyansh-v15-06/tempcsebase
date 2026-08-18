//@ts-nocheck
'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import CircularProgress from '@mui/material/CircularProgress'
import { Card, CardDescription } from '@/components/ui/card'
import Link from 'next/link'
import SkeletonCard from './SkeletonCards'
import { GoChevronRight } from 'react-icons/go'
import { GoChevronLeft } from 'react-icons/go'
type Props = {}

export default function AcademicNews({}: Props) {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/research/top/5`,
                )
                console.log('response is:', response)
                setData(response.data.data)
                setLoading(false)
            } catch (error) {
                console.error('Error fetching top achievements:', error)
                setLoading(false) // Handle error by setting loading to false
            }
        }

        fetchData()
    }, [])

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % data.length)
    }

    const handlePrev = () => {
        setCurrentIndex(
            (prevIndex) => (prevIndex - 1 + data.length) % data.length,
        )
    }

    return (
        <div className='flex flex-col justify-between items-center bg-[#f1ebe8]'>
            <div className='flex justify-between items-center w-full md:w-[65vw] py-8 px-8'>
                <h2 className='text-xl lg:text-3xl font-bold '>
                    <span className='border-l-4 border-[#c1361d] pr-4'></span>
                    Research News
                </h2>
                <Link
                    href='/news/research'
                    className='text-red-600 text-sm underline hover:cursor-pointer hover:text-red-400'
                >
                    View more &gt;
                </Link>
            </div>
            <div className='flex justify-center items-center p-4 flex-wrap gap-4 w-full'>
                {loading ? (
                    <>
                        <SkeletonCard
                            bg='bg-[#f2ebe7]'
                            bgInner='bg-[#d1c8c2]'
                        />
                        <SkeletonCard
                            bg='bg-[#f2ebe7]'
                            bgInner='bg-[#d1c8c2]'
                        />
                        <SkeletonCard
                            bg='bg-[#f2ebe7]'
                            bgInner='bg-[#d1c8c2]'
                        />
                    </>
                ) : (
                    <>
                        <button onClick={handlePrev} className='mr-4'>
                            <GoChevronLeft />
                        </button>
                        <div
                            key={data[currentIndex].id}
                            className=' bg-[#f2ebe7]  border-none  transition-all duration-500 w-full md:w-[65vw]'
                        >
                            <div className=' px-6 my-2 text-xl  lg:text-3xl font-bold line-clamp-2 overflow-hidden'>
                                {data[currentIndex].title}
                            </div>
                            <div className=' p-6 lg:flex'>
                                <div className=' overflow-hidden flex items-center px-6'>
                                    <img
                                        src={data[currentIndex].link}
                                        alt={data[currentIndex].title}
                                        className=''
                                    />
                                </div>
                                <div className='line-clamp-4 overflow-hidden p-6 lg:px-6  flex justify-center '>
                                    {data[currentIndex].description}
                                </div>
                            </div>
                            <div className='text-right px-6'>
                                <Link
                                    href={`/news/academics/${data[currentIndex].id}`}
                                    className='text-red-600 underline hover:cursor-pointer hover:text-red-400 py-2'
                                >
                                    View more &gt;
                                </Link>
                            </div>
                        </div>
                        <button onClick={handleNext} className='ml-4'>
                            <GoChevronRight />
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}
