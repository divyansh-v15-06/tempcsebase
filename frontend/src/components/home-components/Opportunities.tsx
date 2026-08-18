import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '../ui/card'
import axios from 'axios'
import { Scrollbar } from 'react-scrollbars-custom'
const announcementsData = [
    'Result for Summer Internship 2024',
    'In relation to making the Check Points effective for progressive use of the official language Hindi as per Rule 12 of the Official Language Rules, 1976.',
    'CHCI Launch Agenda | May 08, 2024',
    'Hindi Incentive Scheme, Year 2023 prevalent in the Institute',
    'Original Book Writing in Hindi - Rajbhasha Vibhag, MHA, GOI',
    'CCE, IIT Mandi in collaboration with NSDC offering Micro-Specialization certificate program in Artificial Intelligence and Machine Learning.',
    'Deadline Extended: Call for Proposals (CfP -2024-2025) Applications by April 25th, 2024.',
    'International Conference on 60 Years of DFT: Advancements in Theory & Computation July 21-26, 2024, IIT Mandi.',
]

const Opportunities = () => {
    const [data, setData] = useState([])
    useEffect(() => {
        const fetchTopAchievements = async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/public/announcement/top/10`,
                )
                console.log('responce is:', response)
                setData(response.data.data)
                // setLoading(false)
            } catch (error) {
                console.error('Error fetching top achievements:', error)
            }
        }
        fetchTopAchievements()
    }, [])
    return (
        <div className='w-[300px] h-[500px] border rounded flex flex-col'>
            <div className=' p-[0.94rem] text-xl text-center font-semibold'>
                <span className='text-black text-xl'>
                    JOBS AND OPPORTUNITIES
                </span>
                <hr className='mx-4 mt-2' />
            </div>
            <div className='p-4 grow overflow-auto no-scrollbar'>
                {announcementsData.map((announcement, index) => (
                    <div key={index} className='mb-4'>
                        <a
                            target='_blank'
                            className=' hover:cursor-pointer text-blue-600 '
                            //@ts-ignore
                            href={announcement.link}
                        >
                            {/* <span className='text-black'>{index + 1} : </span> */}
                            {/* @ts-ignore */}
                            <span className='text-[#1388bf] '>
                                {announcement}
                            </span>
                            {/* <div className='text-center'>---</div> */}
                        </a>
                    </div>
                ))}
            </div>
            <div className='p-4 text-end'>
                <button className='px-3 py-2  '>
                    <a href='/news/announcements' className='underline '>
                        Read More
                    </a>
                </button>
            </div>
        </div>
    )
}

export default Opportunities
