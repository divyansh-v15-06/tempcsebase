import { ChevronDown, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'
import { BiBook } from 'react-icons/bi'

type Props = {}

const AcademicsComponentList = [
    { title: 'Programs Offered', path: '/academics/programsoffered' },
    {
        title: 'Syllabus',
        path: '/academics/syllabus',
    },
    {
        title: 'Institute Calendar',
        path: '/academics/collegecalendar',
        subParts: [
            {
                title: 'Odd Sem',
                path: 'https://nith.ac.in/uploads/topics/academic-calander-odd17180751936202.pdf',
            },
            {
                title: 'Even Sem',
                path: 'https://nith.ac.in/uploads/topics/academic-calander-even17180752079089.pdf',
            },
        ],
    },
    { title: 'Labs', path: '/academics/Labs' },
]

export default function Academics({}: Props) {
    const [hover, setHover] = useState(false)
    const [subHover, setSubHover] = useState<string | null>(null)

    return (
        <div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            className='relative'
        >
            <div className='tracking-tighter hover:text-red-500 hover:cursor-pointer my-2 flex gap-1 items-center'>
                <BiBook />
                Academics
                <ChevronDown className='relative top-[1px] ml-1 h-3 w-3' />
            </div>
            <div
                className={`bg-white shadow-lg w-[200px] absolute ${
                    hover ? 'block' : 'hidden'
                }`}
            >
                <ul className='text-sm flex flex-col'>
                    {AcademicsComponentList.map((obj) => (
                        <li key={obj.title}>
                            {obj.subParts ? (
                                <div
                                    onMouseEnter={() => setSubHover(obj.title)}
                                    onMouseLeave={() => setSubHover(null)}
                                    className='relative'
                                >
                                    <div className='hover:bg-slate-200 border-b-2 px-4 py-2 hover:cursor-pointer flex justify-between items-center'>
                                        {obj.title}
                                        <ChevronRight className='ml-1 h-3 w-3' />
                                    </div>
                                    <div
                                        className={`bg-white shadow-lg w-[200px] absolute left-full top-0 ${
                                            subHover === obj.title
                                                ? 'block'
                                                : 'hidden'
                                        }`}
                                    >
                                        <ul>
                                            {obj.subParts.map((subPart) => (
                                                <li key={subPart.title}>
                                                    <Link
                                                        href={subPart.path}
                                                        className='hover:bg-slate-300 px-4 py-2 block'
                                                    >
                                                        {subPart.title}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    href={obj.path}
                                    className='hover:bg-slate-200 border-b-2 px-4 py-2 block'
                                >
                                    {obj.title}
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
