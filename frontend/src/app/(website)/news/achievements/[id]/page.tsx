'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import Link from 'next/link'

type Props = {}

export default function News({}: Props) {
    // const [filter1, setFilter1] = useState<string>('')
    const [data, setData] = useState([])
    // const router = useRouter()
    const { id } = useParams<{ id: string }>()

    useEffect(() => {
        console.log('id', id)
        const fetchTopAchievements = async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/achievement/get/${id}`,
                )
                console.log('responceasdasd is:', response)
                setData(response.data.data)
                // setLoading(false)
            } catch (error) {
                console.error('Error fetching top achievements:', error)
            }
        }

        fetchTopAchievements()
    }, [])

    useEffect(() => {
        console.log('data', data)
    }, [data])

    return (
        <>
            <div id='PgContainer' className='py-[6rem] px-[1rem] lg:p-[8rem]'>
                <div id='Head' className=' px-[2.5rem] lg:px-[4rem] '>
                    <div
                        id='StoryTitle'
                        className=' font-poppins text-[1.8rem] lg:text-[3rem] py-[4rem] md:p-[4rem] text-center  font-bold'
                    >
                        {/* @ts-ignore */}
                        {data.title}
                    </div>

                    <div
                        id='StoryContainer  '
                        className='flex flex-col justify-center items-center'
                    >
                        <div>
                            {/* @ts-ignore */}
                            <img src={data.photo} alt='StoryBg' />
                        </div>
                        <div className='m-4 text-let'>
                            {/* @ts-ignore */}
                            {data.pdfLink && (
                                <>
                                    <a
                                        id='PublisherName'
                                        target='_blank'
                                        className='text-red-600 text-sm underline hover:cursor-pointer hover:text-red-400'
                                        // @ts-ignore
                                        href={data.pdfLink}
                                    >
                                        Link to pdf
                                    </a>
                                </>
                            )}
                        </div>
                        {/* <div className='text-black mt-[2rem] font-bold lg:flex lg:justify-end'>
                            {district},{state}
                        </div> */}

                        <div
                            id='Story'
                            className='font-poppins w-[100%] lg:text-[1.2rem] text-justify  my-[3rem] '
                        >
                            {/* @ts-ignore */}
                            {data.description}
                        </div>
                    </div>
                    <div
                        id='PublishingDetails'
                        className=' font-poppins flex flex-col lg:flex-row text-[1rem] items-end justify-between gap-2 my-[2rem] mx-[0rem]'
                    >
                        <div
                            id='PublishingDate '
                            className=' text-[0.8rem] md:text-[1rem] font-semibold flex items-center'
                        >
                            {/* @ts-ignore */}
                            Publish date: {data.date&&new Date(data.date).toLocaleDateString('en-GB')}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
