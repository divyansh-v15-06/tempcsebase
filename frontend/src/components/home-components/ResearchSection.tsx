'use client'
import axios from 'axios'
import React, { useEffect, useState } from 'react'

export default function ResearchSection() {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true) // Loading state

    useEffect(() => {
        const fetchTopAchievements = async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/research/get`,
                )
                console.log('response is:', response.data.data)
                setData(response.data.data)
                setLoading(false) // Stop loading when data is fetched
            } catch (error) {
                console.error('Error fetching top achievements:', error)
                // setLoading(false) // Stop loading even on error
            }
        }
        fetchTopAchievements()
    }, [])

    const getResearchTypeLink = (research) => {
        if (research.fundingAmount) {
            return '/research/projects' // It's a project
        } else if (research.place) {
            return '/research/patents' // It's a patent
        } else {
            return '/research/publications' // It's a publication
        }
    }

    const getResearchTypeText = (research) => {
        if (research.fundingAmount) {
            return 'Project on' // It's a project
        } else if (research.place) {
            return 'Patent for' // It's a patent
        } else {
            return 'Research on' // It's a publication
        }
    }

    return (
        <div className='p-4 flex justify-center items-center flex-wrap gap-4 w-full'>
            <div className='w-[300px] h-[400px] border rounded flex flex-col'>
                <div className='p-4 text-xl text-center font-semibold'>
                    <span className='p-4 text-xl text-center font-semibold'>
                        Research news
                    </span>
                    <hr className='mx-4 mt-2' />
                </div>
                <div className='p-4 grow overflow-auto no-scrollbar'>
                    {loading ? (
                        // Show skeleton cards while loading
                        <>
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                        </>
                    ) : (
                        data.map((research, index) => (
                            <div key={index} className='mb-4 flex'>
                                <div>
                                    <span className='dot-indicator'></span>
                                </div>
                                <a
                                    target='_blank'
                                    className='hover:cursor-pointer text-blue-600'
                                    href={getResearchTypeLink(research)}
                                >
                                    <span className='text-[#1388bf] ml-2'>
                                        {getResearchTypeText(research)}{' '}
                                        {/* @ts-ignore */}
                                        {research.title && (
                                            <span className='text-[#1388bf]'>
                                                {/* @ts-ignore */}
                                                {research.title}
                                            </span>
                                        )}
                                        {/* @ts-ignore */}
                                        {research.authorName && (
                                            <span className='text-[#165978]'>
                                                {' by '}
                                                {
                                                    // @ts-ignore
                                                    research.authorName.split(
                                                        ',',
                                                    )[0]
                                                }
                                            </span>
                                        )}
                                    </span>
                                </a>
                            </div>
                        ))
                    )}
                </div>
                <div className='p-4 text-end'>
                    <button className='px-3 py-2'>
                        <a href='/research/publications' className='underline'>
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
        <div className='mb-4 mx-4 animate-pulse'>
            <div className='w-3/4 h-4 mb-1 bg-gray-300 rounded-xl'></div>
            <div className='w-3/4 h-4 mb-1 bg-gray-200 rounded-xl'></div>
            <div className='w-1/2 h-4 mb-1 bg-gray-100 rounded-xl'></div>
        </div>
    )
}
