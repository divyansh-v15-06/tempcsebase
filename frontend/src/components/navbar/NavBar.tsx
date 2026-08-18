'use client'

import React from 'react'
import nithLogo from '../../../public/image.png'
import Image from 'next/image'
import { Separator } from '@/components/ui/separator'
import { PiFlowerLotusBold } from 'react-icons/pi'
import HamburgerMenu from './hamburgerMenu/hamburgerMenu'
import { BiBook, BiHome, BiNote, BiSolidNews } from 'react-icons/bi'
import { IoPersonOutline } from 'react-icons/io5'
import People from './NavMenuItems/People'
import Academics from './NavMenuItems/Academics'
import Home from './NavMenuItems/Home'
import Research from './NavMenuItems/Research'
import News from './NavMenuItems/News'
import Placements from './NavMenuItems/placement'
import AboutUs from './AboutUs'
type Props = {}
const navList = [
    {
        title: 'Home',
        path: '/',
        icon: <BiHome />,
    },
    {
        title: 'Academics',
        path: '/academics',
        icon: <BiBook />,
    },
    {
        title: 'People',
        path: '/people',
        icon: <IoPersonOutline />,
    },
    {
        title: 'Research',
        path: '/research',
        icon: <BiNote />,
    },
    {
        title: 'News and Events',
        path: '/news',
        icon: <BiSolidNews />,
    },
    // {
    //     title: 'Placement Page',
    //     path: '/placementpage',
    //     icon: <BiHome />,
    // },
]
function NavBar({}: Props) {
    return (
        <nav className='shadow '>
            <div className='mx-auto md:max-w-screen-lg  pt-1 '>
                <div className=' flex justify-center items-center'>
                    <div className='bg-[#fff] flex justify-center items-center'>
                        <a href='/'>
                            <Image
                                src={nithLogo}
                                alt='nitHamirpurLogo'
                                className='md:h-36 w-auto 
                                '
                            />
                        </a>
                        {/* <div className='flex flex-col items-center '>
                            <span className='font-bold leading-tight tracking-wide  lg:text-2xl '>
                                National Institute of Technology Hamirpur{' '}
                            </span>
                            <span className='font-medium text-sm  lg:text-lg  tracking-tighter'>
                                DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING
                            </span>
                        </div> */}
                        {/* <div className='flex flex-col'>
                            <span className='font-extralight text-base tracking-tighter'>
                                राष्ट्रीय प्रौद्योगिकी संस्थान, हमीरपुर
                            </span>
                            <span className='font-bold text-[1.35rem] leading-tight lg:text-2xl tracking-wide'>
                                कंप्यूटर साइंस और इंजीनियरिंग
                            </span>
                        </div> */}
                    </div>
                    <div className='block lg:hidden p-2'>
                        <HamburgerMenu />
                    </div>
                </div>
                <Separator className='my-1 bg-[#dfc9c8] hidden lg:block' />
                <div className='lg:flex justify-center hidden gap-6'>
                    <Home />
                    <AboutUs />
                    <Academics />
                    <People />
                    <Research />
                    <News />
                    {/* <Placements /> */}
                </div>
            </div>
        </nav>
    )
}

export default NavBar
