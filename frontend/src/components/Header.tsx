import Link from 'next/link'
import React from 'react'
import HamburgerMenu from './header/hamburgerMenu'
import { User } from 'lucide-react'
import { usePathname } from 'next/navigation'

type Props = {}

export default function Header({}: Props) {
    const pathname = usePathname()
     const isadmin= pathname.startsWith('/admin')
    return (
        <div className='bg-[#33110e]  h-7 text-neutral-100 font-normal text-xs lg:text-sm  flex justify-end lg:justify-center items-center'>
            <div className=' md:w-[60vw] lg:flex justify-between  '>
                <div className=''>
                    <Link
                        target='_blank'
                        href='https://mail.google.com/a/nith.ac.in'
                        className='hover:text-gray-300 '
                    >
                        Web Mail
                    </Link>
                    <span className=' text-gray-400'>|</span>
                    <Link
                        href='https://portfolios.nith.ac.in/index.php?/login'
                        target='_blank'
                        className='hover:text-gray-300'
                    >
                        Faculty Portfolio
                    </Link>
                </div>
                <div className='hidden lg:block'>
                    <Link
                        href='https://nith.ac.in'
                        className='hover:text-gray-300'
                    >
                        Home
                    </Link>
                    <span className=' text-gray-400'>|</span>
                    <Link
                        href='http://172.16.28.5/'
                        className='hover:text-gray-300'
                    >
                        Intranet
                    </Link>
                    <span className=' text-gray-400'>|</span>
                    <Link
                        href='https://eoffice.nith.ac.in/'
                        className='hover:text-gray-300'
                    >
                        eOffice
                    </Link>
                    <span className=' text-gray-400'>|</span>
                    <Link
                        href='https://nith.ac.in/td/index.html'
                        className='hover:text-gray-300'
                    >
                        Directory
                    </Link>
                    <span className=' text-gray-400'>|</span>
                    <Link
                        href='https://nith.ac.in/contact-us'
                        className='hover:text-gray-300'
                    >
                        Contact Us
                    </Link>
                    {!isadmin&&
                    <><span className=' text-gray-400'>|</span>
                    <Link href='/login' className='hover:text-gray-300'>
                        <User className='inline mr-1 ml-2 border-2 border-white rounded-full ' />
                        Login
                    </Link></>}
                    {/* <Link href='/admin' className='hover:text-gray-300'>
                        Admin
                    </Link> */}
                </div>
            </div>
            <div className='block lg:hidden p-2'>
                <HamburgerMenu />
            </div>
        </div>
    )
}
