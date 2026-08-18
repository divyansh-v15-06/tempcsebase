// @ts-nocheck
'use client'
import axios from 'axios'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function LabsPage() {
    const [data, setData] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        axios
            .get(`${process.env.NEXT_PUBLIC_API_URL}/labs/get`)
            .then((res) => {
                setData(res.data.data)
                setIsLoading(false)
            })
            .catch((err) => {
                console.error('Error fetching data:', err)
                setIsLoading(false)
            })
    }, [])

    return (
        <div className='max-w-[1700px] mx-auto p-10'>
            <h1 className='text-3xl font-bold text-center mb-8'>
                Laboratory List
            </h1>

            {isLoading ? (
                <p className='text-center text-gray-500'>Loading...</p>
            ) : (
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                    {data.map((item,index) => (
                        <Link
                            href={`Labs/${item.id}`}
                            key={item.id}
                            className='bg-white shadow-lg rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform border'
                        >
                            <img
                                src={item.photo || '/placeholder.jpg'}
                                alt={item.title}
                                className='w-full h-48 object-cover'
                            />
                            <div className='p-4'>
                                <span className='text-sm text-gray-500'>
                                    Lab No.: {index+1}
                                </span>
                                <h2 className='text-xl font-semibold text-gray-800 mt-1'>
                                    {item.title}
                                </h2>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

