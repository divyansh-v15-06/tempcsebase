import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import nithLogo from '../../../public/nith.png'
import { IoMenu } from 'react-icons/io5'
import { BiHome, BiNote, BiBook, BiSolidNews } from 'react-icons/bi'
import { ChevronDown } from 'lucide-react'

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerTrigger,
} from '@/components/ui/drawer'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'

type DrawerState = boolean

type Props = {}

const navList = [
    {
        title: 'Web Mail',
        link: 'https://mail.google.com/a/nith.ac.in',
    },
    {
        title: 'Faculty Portfolio',
        link: 'https://portfolios.nith.ac.in/index.php?/login',
    },
    {
        title: 'Home',
        link: 'https://nith.ac.in',
    },
    {
        title: 'Intranet',
        link: 'http://172.16.28.5/',
    },
    {
        title: 'eOffice',
        link: 'https://eoffice.nith.ac.in/',
    },
    {
        title: 'Directory',
        link: 'https://nith.ac.in/td/index.html',
    },
    {
        title: 'Contact Us',
        link: 'https://nith.ac.in/contact-us',
    },
]

const HamburgerMenu: React.FC<Props> = () => {
    return (
        <div>
            <Drawer direction='bottom' dismissible>
                <DrawerTrigger className='text-xs'>
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='16'
                        height='16'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        stroke-width='2'
                        stroke-linecap='round'
                        stroke-linejoin='round'
                        className='lucide lucide-chevron-down'
                    >
                        <path d='m6 9 6 6 6-6' />
                    </svg>
                </DrawerTrigger>
                <DrawerContent className=' '>
                    <div className=' grid grid-cols-2'>
                        <div className='w-[85vw]'>
                            <div id='mainContainer' className='m-8'>
                                <div
                                    id='nav'
                                    className='flex flex-col gap-2 flex-wrap text-sm'
                                >
                                    {navList.map((obj) => (
                                        <Link
                                            key={obj.title}
                                            href={obj.link}
                                            className='hover:bg-slate-200  hover:cursor-pointer'
                                        >
                                            {obj.title}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    )
}

export default HamburgerMenu
