'use client'
import { Separator } from '../ui/separator'
import Link from 'next/link'
import React from 'react'

type Props = {
    cardtitle: string
    data: {
        title: string
        link: string
    }[]
}

export default function BulletCard({ cardtitle, data }: Props) {
    return (
        <div className='border-2 rounded '>
            <div className=' border-t-[#c1361d] p-4 border-t-8 rounded '>
                <span className='text-black text-2xl flex justify-center font-normal '>
                    {cardtitle}
                </span>
                <div className='p-4'>
                    <Separator />
                </div>
                <div className='flex flex-col gap-4 h-[50vh] overflow-y-auto scrollbar-hide'>
                    {data.map((obj) => {
                        return (
                            <Link
                                key={obj.title}
                                href={obj.link}
                                className='text-blue-800 hover:underline hover:cursor-pointer'
                            >
                                {obj.title}
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
