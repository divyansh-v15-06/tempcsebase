//@ts-nocheck
'use client'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import CountUp from 'react-countup'

type Props = {}

export default function CseStats({}: Props) {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/count/get`,
                )
                console.log('response is:', response)
                setData(response.data.data)
                console.log(response.data.data);
                
            } catch (error) {
                console.error('Error fetching top achievements:', error)
            } finally {
                setLoading(false) // Ensure loading is false after data fetch
            }
        }

        fetchData()
    }, [])

    useEffect(() => console.log('data:', data), [data])

    return (
        <>
            <div className='flex flex-col justify-between items-center bg-[url("https://res.cloudinary.com/dtxjhtjv2/image/upload/v1716709418/cseStats_rjpydd.webp")] text-white bg-cover bg-no-repeat bg-center'>
                <div className='flex justify-between items-center w-full md:w-[65vw] py-8 px-8'>
                    <h2 className='text-xl lg:text-3xl font-bold flex'>
                        <span className='border-l-4 border-[#c1361d] pr-4'></span>
                        <div>
                            Department of Computer Science and Engineering
                        </div>
                    </h2>
                </div>

                <div className='flex flex-wrap justify-center md:justify-start gap-4 w-full md:w-[65vw] py-8 px-8'>
                    {loading ? (
                        <div className='flex justify-center items-center w-full md:w-[65vw] h-[250px]'>
                            <div className='loading-dots'></div>
                        </div>
                    ) : (
                        <>
                            <div className='w-[130px] mb-8'>
                                <div className='font-bold text-3xl'>
                                    <CountUp
                                        enableScrollSpy={true}
                                        scrollSpyOnce={true}
                                        end={data.faculty}
                                    />
                                </div>
                                <div className='text-sm font-light'>
                                    Faculty
                                </div>
                            </div>
                            <div className='w-[130px] mb-8'>
                                <div className='font-bold text-3xl'>
                                    <CountUp
                                        enableScrollSpy={true}
                                        scrollSpyOnce={true}
                                        end={data.staff}
                                    />
                                </div>
                                <div className='text-sm font-light'>Staff</div>
                            </div>
                            <div className='w-[130px] mb-8'>
                                <div className='font-bold text-3xl'>
                                    <CountUp
                                        enableScrollSpy={true}
                                        scrollSpyOnce={true}
                                        end={
                                            data.bachelorStudent +
                                            data.dualdegreeStudent
                                        }
                                    />
                                </div>
                                <div className='text-sm font-light'>
                                    Undergraduate Students
                                </div>
                            </div>
                            <div className='w-[130px] mb-8'>
                                <div className='font-bold text-3xl'>
                                    <CountUp
                                        enableScrollSpy={true}
                                        scrollSpyOnce={true}
                                        end={data.masterStudent}
                                    />
                                </div>
                                <div className='text-sm font-light'>
                                    Postgraduate Students
                                </div>
                            </div>
                            <div className='w-[130px] mb-8'>
                                <div className='font-bold text-3xl'>
                                    <CountUp
                                        enableScrollSpy={true}
                                        scrollSpyOnce={true}
                                        end={data.pursuingPhdScholar}
                                    />
                                </div>
                                <div className='text-sm font-light'>
                                    Pursuing Ph.D. Scholars
                                </div>
                            </div>
                            <div className='w-[130px] mb-8'>
                                <div className='font-bold text-3xl'>
                                    <CountUp
                                        enableScrollSpy={true}
                                        scrollSpyOnce={true}
                                        duration={1}
                                        end={data.publication}
                                    />
                                </div>
                                <div className='text-sm font-light'>
                                    Publications
                                </div>
                            </div>
                            <div className='w-[130px] mb-8'>
                                <div className='font-bold text-3xl'>
                                    <CountUp
                                        enableScrollSpy={true}
                                        scrollSpyOnce={true}
                                        duration={1}
                                        end={data.Patent}
                                    />
                                </div>
                                <div className='text-sm font-light'>
                                    Patents
                                </div>
                            </div>
                            <div className='w-[130px] mb-8'>
                                <div className='font-bold text-3xl'>
                                    <CountUp
                                        enableScrollSpy={true}
                                        scrollSpyOnce={true}
                                        duration={1}
                                        end={data.Project}
                                    />
                                </div>
                                <div className='text-sm font-light'>
                                    Sponsored Ongoing Projects
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <style jsx>{`
                .loading-dots {
                    display: inline-block;
                    font-size: 24px;
                }

                .loading-dots::after {
                    content: '...';
                    animation: dots 1.5s steps(3, end) infinite;
                }

                @keyframes dots {
                    0% {
                        content: '';
                    }
                    33% {
                        content: '.';
                    }
                    66% {
                        content: '..';
                    }
                    100% {
                        content: '...';
                    }
                }
            `}</style>
        </>
    )
}
