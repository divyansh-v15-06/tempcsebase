"use client"
import React, { useEffect } from 'react'
import hodImage from '../../../public/hod.jpg'
import axios from 'axios'

type Props = {}
function SkeletonCard() {
    return (
        <div className='mb-4 mx-4 animate-pulse'>
            <div className='w-3/4 h-4 mb-1 bg-gray-300 rounded-xl'></div>
            <div className='w-3/4 h-4 mb-1 bg-gray-200 rounded-xl'></div>
            <div className='w-1/2 h-4 mb-1 bg-gray-100 rounded-xl'></div>
        </div>
    )
}

function MessageDirector({}: Props) {

    const [data, setData] = React.useState({
        name: '',
        message:'',
        image: "",
        })
    const [isLoading, setIsLoading] = React.useState(true)
    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = () => {
        setIsLoading(true)
        const urlWithParams = `${
            process.env.NEXT_PUBLIC_API_URL
        }/hod/get`

        axios
            .get(urlWithParams)
            .then((response) => {
                console.log('response.data.data', response.data.data)
                setData(response.data.data)
                console.log('data', response.data.data);
                
                setIsLoading(false)
            })
            .catch((error) => {
                console.error('Error fetching data:', error)
                setIsLoading(false)
            })
    }
    return (
        // <div className=' bg-[#f4f0eb] flex justify-center items-center p-[4rem] h-[30vw]'>
        <div className=' bg-[#f4f0eb] flex justify-center items-center p-6 sm:p-8 md:p-12 lg:p-16 mt-8 md:mt-12 lg:mt-0 '>
            {/* <div className='w-[60vw]'> */}
            <div className='max-w-screen-lg w-full'>
                {/* <h2 className='text-3xl font-bold tracking-wide pb-[2rem] '> */}
                <h2 className='text-2xl md:text-3xl font-bold tracking-wide pb-4 sm:pb-6 lg:pb-8 '>
                    <span className='border-l-4 border-[#c1361d] pr-4'></span>
                    Message from Head Of Department
                </h2>
                {/* <div className='flex'> */}
                <div className='flex flex-col md:flex-row'>
                   { isLoading ? (
                <div className='border rounded w-full md:w-1/3 lg:w-1/4 mb-4 md:mb-0'>
                    
                </div>
            ) : <img
                        src={data.image||'https://portfolios.nith.ac.in/uploads/member_details/62.jpg'}
                        alt='hodImage'
                        // className='border rounded w-[20rem]'
                        className='border rounded w-full md:w-1/3 lg:w-1/4 mb-4 md:mb-0'
                    />}
                    {/* <div className='flex-1 text-base lg:text-lg pl-4 md:tracking-wider '> */}
                    <div className='flex-1 text-base md:text-lg lg:text-xl pl-0 md:pl-6 lg:pl-8 tracking-wider '>
                        {isLoading?<div className='mr-15'><SkeletonCard /></div>:<p className='font-bold'>Greetings to all!</p>}
                        {/* <p> */}
                        {isLoading?<div className='mt-2'>
                            <SkeletonCard /><SkeletonCard /><SkeletonCard />
                        </div>:
                        <p className='mt-2 text-lg'>
                            {data?.message||`It is with great pleasure that I write this in the
                            capacity of the Head of the Department (HOD) of the
                            Computer Science and Engineering (CSE) Department at
                            NIT Hamirpur. I thank all the faculty members,
                            students, and staff of our esteemed department for
                            their continuous efforts every day in maintaining
                            the excellence and reputation of our department`}
                        </p>}
                        {/* <span className='text-red-600 text-end font-bold text-lg '> */}
                        {!isLoading&&<span className='text-red-600 text-end font-bold text-lg mt-4'>
                            -{data?.name||`Dr. Siddhartha Chauhan`}
                        </span>}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MessageDirector
