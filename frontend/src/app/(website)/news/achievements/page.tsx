'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Card, CardDescription } from '@/components/ui/card'
import Link from 'next/link'
import SkeletonCard from '../../../../components/SkeletonCards' // Import the SkeletonCard component
import CircularProgress from '@mui/material/CircularProgress'

type Props = {}
const options = [
    { value: ' ', title: 'All' },
    { value: 'Professor', title: '1' },
    { value: 'Associate Professor', title: '2' },
    {
        value: 'Assistant Professor Grade-I',
        title: '3',
    },
    {
        value: 'Assistant Professor Grade-II',
        title: '4',
    },
]

export default function News({}: Props) {
    const [filter1, setFilter1] = useState<string>('')
    const [data, setData] = useState([])
    const [isLoading, setIsLoading] = useState<boolean>(true)

    useEffect(() => {
        const fetchTopAchievements = async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/achievement/get/`,
                )
                console.log('response is:', response)
                setData(response.data.data)
            } catch (error) {
                console.error('Error fetching top achievements:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchTopAchievements()
    }, [])

    return (
        <div className='grid grid-cols-[1fr] grid-rows-[45px] m-12 place-content-center p-0 box-border mt-3 mb-3 gap-4 overflow-hidden'>
            <h3 className='text-center text-2xl lg:text-3xl font-semibold'>
                Achievements News
            </h3>
            {isLoading ? (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '300px', // Adjust height as needed
                    }}
                >
                    <div className='flex flex-wrap gap-4'>
                        <div style={{ paddingBottom: '16px' }}>
                            {' '}
                            {/* Adjust padding as needed */}
                            <SkeletonCard bg='white' bgInner='bg-gray-200' />
                        </div>
                        <div style={{ paddingBottom: '16px' }}>
                            {' '}
                            {/* Adjust padding as needed */}
                            <SkeletonCard bg='white' bgInner='bg-gray-200' />
                        </div>
                        <div style={{ paddingBottom: '16px' }}>
                            {' '}
                            {/* Adjust padding as needed */}
                            <SkeletonCard bg='white' bgInner='bg-gray-200' />
                        </div>
                    </div>
                </div>
            ) : (
                <div className='overflow-x-auto'>
                    <div className='flex justify-center items-center p-4 flex-wrap gap-4 w-full'>
                        {data.map((obj) => (
                            <Card
                                //@ts-ignore
                                key={obj.id}
                                className='w-[20rem] h-[30rem] border-none transition-all duration-500'
                            >
                                <div className='h-[27rem] p-6'>
                                    {/* @ts-ignore */}
                                    <div className='h-[15rem] overflow-hidden flex items-center justify'>
                                        <img
                                            // @ts-ignore
                                            src={obj.photo}
                                            // @ts-ignore
                                            alt={obj.title}
                                            className=''
                                        />
                                    </div>

                                    <div className='my-2 text-xl font-bold line-clamp-2 overflow-hidden '>
                                        {/* @ts-ignore */}
                                        {obj.title}
                                    </div>
                                    <CardDescription className=' line-clamp-4 overflow-hidden'>
                                        {/* @ts-ignore */}
                                        {obj.description}
                                    </CardDescription>
                                </div>
                                <div className='text-right px-6'>
                                    <Link
                                        //  @ts-ignore
                                        href={`/news/achievements/${obj.id}`}
                                        className='text-red-600 underline  hover:cursor-pointer hover:text-red-400'
                                    >
                                        View more &gt;
                                    </Link>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
