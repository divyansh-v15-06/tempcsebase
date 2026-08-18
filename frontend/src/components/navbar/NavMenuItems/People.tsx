import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { IoPersonOutline } from 'react-icons/io5'

type Props = {}
const PeopleComponentList = [
    // { title: 'Overview', path: '/people/' },
    { title: 'Students', path: '/people/students' },
    { title: 'Faculty', path: '/people/faculty' },
    { title: 'Ph.D scholars', path: '/people/phdscholars' },
    { title: 'Staff', path: '/people/staff' },
    // { title: 'Alumini', path: '/people/alumini' },
]
export default function People({}: Props) {
    const [hover, setHover] = useState(false)

    return (
        <div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <div
                // href='/people'
                className=' tracking-tighter hover:text-red-500 hover:cursor-pointer my-2 flex gap-1 items-center '
            >
                <IoPersonOutline />
                People
                <ChevronDown className='relative top-[1px] ml-1 h-3 w-3 ' />
            </div>
            <div
                className={`bg-white shadow-lg w-[150px] absolute ${
                    hover ? 'block' : 'hidden'
                }`}
            >
                <ul className='text-sm flex flex-col '>
                    {PeopleComponentList &&
                        PeopleComponentList.map((obj) => {
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
