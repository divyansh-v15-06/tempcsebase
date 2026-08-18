import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { BiBuilding } from 'react-icons/bi'

type Props = {}

export default function AboutUs({}: Props) {
    return (
        <div>
            <Link
                href='/aboutus'
                className=' tracking-tighter hover:text-red-500 my-2 flex gap-1 items-center '
            >
                <BiBuilding />
                About Us
                {/* <ChevronDown className='relative top-[1px] ml-1 h-3 w-3 ' /> */}
            </Link>
        </div>
    )
}
