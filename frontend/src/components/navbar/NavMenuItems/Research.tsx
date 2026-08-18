import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'
import { BiNote } from 'react-icons/bi'

type Props = {}
const ResearchComponentList = [
    // { title: 'Overview', path: '/research/' },
    { title: 'Publications', path: '/research/publications' },
    { title: 'Projects', path: '/research/projects' },
    { title: 'Patents', path: '/research/patents' },
    { title: 'Events', path: '/research/events' },
    // { title: 'Consultancy', path: '/research/consultancy' },
]
export default function Research({}: Props) {
    const [hover, setHover] = useState(false)
    return (
        <div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <div
                // href='/research'
                className=' tracking-tighter hover:text-red-500 hover:cursor-pointer my-2 flex gap-1 items-center '
            >
                <BiNote />
                Research
                <ChevronDown className='relative top-[1px] ml-1 h-3 w-3 ' />
            </div>
            <div
                className={`bg-white shadow-lg w-[150px] absolute ${
                    hover ? 'block' : 'hidden'
                }`}
            >
                <ul className='text-sm flex flex-col '>
                    {ResearchComponentList &&
                        ResearchComponentList.map((obj) => {
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
