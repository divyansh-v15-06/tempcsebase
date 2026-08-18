'use client'
import React, { useEffect, useState } from 'react'

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import axios from 'axios'
import Link from 'next/link'
import SkeletonCard from './SkeletonCards'
type Props = {}

export default function AcademicNews({}: Props) {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTopAchievements = async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/achievement/top/3`,
                )
                console.log('responce is:', response)
                setData(response.data.data)
                setLoading(false)
            } catch (error) {
                console.error('Error fetching top achievements:', error)
            }
        }

        fetchTopAchievements()
    }, [])
    return (
        <div className='flex flex-col justify-between items-center'>
            <div className=' flex justify-between items-center w-full md:w-[65vw] pt-8 px-8'>
                <h2 className='text-xl lg:text-3xl font-bold '>
                    {' '}
                    <span className='border-l-4 border-[#c1361d] pr-4'></span>
                    Achievements News
                </h2>
                <Link
                    href='/news/achievements'
                    className='text-red-600 text-sm underline hover:cursor-pointer hover:text-red-400'
                >
                    View more
                </Link>
            </div>
            <div className=' flex justify-center items-center p-4 flex-wrap gap-4 w-full pb-8'>
                {loading === true ? (
                    <>
                        <SkeletonCard bg='white' bgInner='bg-gray-300' />
                        <SkeletonCard bg='white' bgInner='bg-gray-300' />
                        <SkeletonCard bg='white' bgInner='bg-gray-300' />
                    </>
                ) : (
                    data.map((obj) => (
                        <Card
                            //@ts-ignore
                            key={obj.id}
                            className='w-[20rem] h-[30rem] border-none transition-all duration-500'
                        >
                            <div className='h-[27rem] p-6'>
                                {/* @ts-ignore */}
                                <div className='h-[15rem] overflow-hidden flex items-center justify'>
                                    <Link
                                        //  @ts-ignore
                                        href={`/news/achievements/${obj.id}`}
                                        className='   hover:cursor-pointer '
                                    >
                                        <img
                                            // @ts-ignore
                                            src={obj.photo}
                                            // @ts-ignore
                                            alt={obj.title}
                                            className=''
                                        />
                                    </Link>
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
                    ))
                )}
            </div>
        </div>
    )
}
