'use client'
// AnnouncementTicker.js
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import Marquee from 'react-fast-marquee'
import { IoMenu } from 'react-icons/io5'
const AnnouncementTicker = () => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        const fetchTopAchievements = async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/public/announcement/top/10`,
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
        <div className='flex items-center  bg-[#fff9f6] '>
            <div className='bg-[#1c110c] text-white  pr-8 pl-4 font-semibold tracking-wider relative hidden md:block'>
                <p className='py-2'>Announcements</p>
                <div className='absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-[#fff9f6]'></div>
                <div className='absolute bottom-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-b-[20px] border-b-[#fff9f6]'></div>
            </div>
            {/* <div className='bg-[#1c110c] w-[30px] h-[40px] relative block md:hidden border-[#e4c7c6] '>
                <div className='absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-r-[#e4c7c6] border-t-[#fff9f6]'></div>
                <div className='absolute bottom-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-b-[20px] border-b-[#fff9f6] border-r-[#e4c7c6]'></div>
            </div> */}
            {loading === true ? (
                <div className='grow'></div>
            ) : (
                <Marquee
                    className='h-[40px] '
                    pauseOnHover={true}
                    speed={60}
                    autoFill={true}
                >
                    {data.map((announcement, index) => (
                        <div
                            key={index}
                            className='flex justify-center items-center'
                        >
                            {' '}
                            <a
                                target='_blank'
                                className='mx-4 hover:cursor-pointer hover:text-[#ce0101] italic font-light '
                                //@ts-ignore
                                href={announcement.link}
                            >
                                {/* @ts-ignore */}
                                {announcement.title}
                            </a>
                            <div className='h-[18px] w-[3px] bg-[#ce0000] mx-[30px]'></div>
                        </div>
                    ))}
                </Marquee>
            )}

            <div className='bg-black text-white px-2 lg:px-4 font-semibold tracking-wider '>
                <p className='py-3 '>
                    <a href='/news/announcements'>
                        <IoMenu />
                    </a>
                </p>
            </div>
        </div>
    )
}

export default AnnouncementTicker
