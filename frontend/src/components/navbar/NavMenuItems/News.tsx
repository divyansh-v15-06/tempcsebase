import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'
import { BiSolidNews } from 'react-icons/bi'

type Props = {}
const NewsComponentList = [
    // { title: 'Overview', path: '/news/' },
    { title: 'Announcements', path: '/news/announcements' },
    { title: 'Achievements News', path: '/news/achievements' },
    // { title: 'Research News', path: '/news/research' },
    // { title: 'Academic News', path: '/news/academics' },
]
export default function News({}: Props) {
    const [hover, setHover] = useState(false)
    return (
        <div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <div
                // href='/news'
                className=' tracking-tighter hover:text-red-500 hover:cursor-pointer my-2 flex gap-1 items-center '
            >
                <BiSolidNews />
                News and Events
                <ChevronDown className='relative top-[1px] ml-1 h-3 w-3 ' />
            </div>
            <div
                className={`bg-white shadow-lg w-[150px] absolute ${
                    hover ? 'block' : 'hidden'
                }`}
            >
                <ul className='text-sm flex flex-col '>
                    {NewsComponentList &&
                        NewsComponentList.map((obj) => {
                            return (
                                <Link
                                    key={obj.title}
                                    href={obj.path}
                                    className='hover:bg-slate-200 border-b-2 px-4 py-2 hover:cursor-pointer'
                                >
                                    {obj.title}
                                </Link>
                            )
                        })}
                </ul>
            </div>
        </div>
    )
}
