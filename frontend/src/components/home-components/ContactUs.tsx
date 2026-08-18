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

const ContactUs = () => {
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
                    Connect @
                    <span className='text-[#ff0000]'> NIT Hamirpur</span>
                </span>
                <hr className='mx-4 mt-2' />
            </div>
            <div className='p-4 grow overflow-auto no-scrollbar flex flex-col gap-6'>
                <div className='text-center'>
                    <span className='text-lg font-semibold underline'>
                        Contact Us{' '}
                    </span>
                    <div>
                        <span className='font-semibold'>Phone No :</span>
                        +91-01972-254011
                    </div>
                    <div>
                        <span className='font-semibold'>Email :</span>
                        registrar@nith.ac.in
                    </div>
                    <div>
                        <span className='font-semibold'>Fax :</span>
                        +91-1972-223834
                    </div>
                </div>
                <div className='text-center'>
                    <span className='text-lg font-semibold underline'>
                        Visit Us
                    </span>
                    <div className='font-light mt-2'>
                        National Institute of Technology Hamirpur, Himachal
                        Pradesh, Pin No. 177005, India.
                    </div>
                    <iframe
                        src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3394.273281693904!2d76.52516391744383!3d31.708429100000007!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3904d5487e12c4a1%3A0x395f92d3a202a7d0!2sNational%20Institute%20of%20Technology%2C%20Hamirpur!5e0!3m2!1sen!2sin!4v1720725113641!5m2!1sen!2sin'
                        width='270'
                        height='150'
                        className='border-2 border-slate-300 rounded'
                        // style='border:0;'
                        // @ts-ignore
                        allowfullscreen=''
                        loading='lazy'
                        referrerpolicy='no-referrer-when-downgrade'
                    ></iframe>
                </div>
            </div>
        </div>
    )
}

export default ContactUs
