import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { BiHome } from 'react-icons/bi'
import { MdHandshake } from 'react-icons/md'

type Props = {}

export default function Placements({}: Props) {
    return (
        <div>
            <Link
                href='/placementpage'
                className=' tracking-tighter hover:text-red-500 my-2 flex gap-1 items-center '
            >
                <MdHandshake />
                Placements
                {/* <ChevronDown className='relative top-[1px] ml-1 h-3 w-3 ' /> */}
            </Link>
        </div>
    )
}
