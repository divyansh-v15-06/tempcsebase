'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function AnnouncementSection() {
    const [announcement, setAnnouncement] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTopAchievements = async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/public/announcement/top/10`,
                )
                console.log('response is:', response.data.data)
                setAnnouncement(response.data.data)
                setLoading(false) // Stop loading when data is fetched
            } catch (error) {
                console.error('Error fetching top achievements:', error)
                // setLoading(false) // Stop loading even on error
            }
        }
        fetchTopAchievements()
    }, [])

    return (
        <div className='p-4 flex justify-center items-center flex-wrap gap-4 w-full'>
            <div className='w-[300px] h-[400px] border rounded flex flex-col'>
                <div className='p-4 text-xl text-center font-semibold'>
                    NEWS AND UPDATES
                    <hr className='mx-4 mt-2' />
                </div>
                <div className='p-4 grow overflow-auto no-scrollbar'>
                    {loading ? (
                        // Display skeleton cards while loading
                        <>
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                        </>
                    ) : (
                        announcement.map((obj) => (
                            // @ts-ignore
                            <div key={obj.id} className='mb-4 flex '>
                                <div>
                                    <span className='dot-indicator'></span>
                                </div>
                                <a
                                    target='_blank'
                                    className='hover:cursor-pointer text-blue-600 ml-2'
                                    // @ts-ignore

                                    href={obj.link}
                                >
                                    <span className='text-[#1388bf]'>
                                        {/* @ts-ignore */}
                                        {obj.title}
                                    </span>
                                </a>
                            </div>
                        ))
                    )}
                </div>
                <div className='p-4 text-end'>
                    <button className='px-3 py-2'>
                        <a href='/news/announcements' className='underline'>
                            Read More
                        </a>
                    </button>
                </div>
            </div>
            <style jsx>{`
                .dot-indicator {
                    height: 8px;
                    width: 8px;
                    background-color: #1388bf;
                    border-radius: 50%;
                    display: inline-block;
                }
            `}</style>
        </div>
    )
}

// Skeleton card component
function SkeletonCard() {
    return (
        <div className='mb-4 mx-4  animate-pulse '>
            {/* <div className='w-2 h-2 bg-[#fff9f6] rounded-full mr-2'></div> */}
            <div className='w-3.3/4 h-4 mb-1 bg-gray-300  rounded-xl'></div>
            <div className='w-3.3/4 h-4 mb-1 bg-gray-200  rounded-xl'></div>
            <div className='w-1/2 h-4 mb-1 bg-gray-100  rounded-xl'></div>
        </div>
    )
}
