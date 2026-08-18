import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { BiHome } from 'react-icons/bi'

type Props = {}

export default function Home({}: Props) {
    return (
        <div>
            <Link
                href='/'
                className=' tracking-tighter hover:text-red-500 my-2 flex gap-1 items-center '
            >
                <BiHome />
                Home
                {/* <ChevronDown className='relative top-[1px] ml-1 h-3 w-3 ' /> */}
            </Link>
        </div>
    )
}
