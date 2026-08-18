import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import nithLogo from '../../../../public/nith.png'
import { IoMenu } from 'react-icons/io5'
import { BiHome, BiNote, BiBook, BiSolidNews } from 'react-icons/bi'
import { IoPersonOutline } from 'react-icons/io5'
import { MdHandshake } from 'react-icons/md'
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
        title: 'Academics',
        icon: <BiBook />,
        list: [
            // { title: 'Overview', path: '/academics/' },
            { title: 'Programs Offered', path: '/academics/programsoffered' },
            { title: 'Syllabus', path: '/academics/syllabus' },
            // { title: 'Time Table', path: '/academics/timetable' },
            { title: 'College Calendar', path: '/academics/collegecalendar' },
        ],
    },
    {
        title: 'People',
        icon: <IoPersonOutline />,
        list: [
            // { title: 'Overview', path: '/people/' },
            { title: 'Students', path: '/people/students' },
            { title: 'Faculty', path: '/people/faculty' },
            { title: 'Ph.D scholars', path: '/people/phdscholars' },
            { title: 'Staff', path: '/people/staff' },
            // { title: 'Alumini', path: '/people/alumini' },
        ],
    },
    {
        title: 'Research',
        icon: <BiNote />,
        list: [
            // { title: 'Overview', path: '/research/' },
            { title: 'Publications', path: '/research/publications' },
            { title: 'Projects', path: '/research/projects' },
            { title: 'Patents', path: '/research/patents' },
            { title: 'Events', path: '/research/events' },
            // { title: 'Consultancy', path: '/research/consultancy' },
        ],
    },
    {
        title: 'News and Events',
        icon: <BiSolidNews />,
        list: [
            // { title: 'Overview', path: '/news/' },
            { title: 'Announcements', path: '/news/announcements' },
            { title: 'Achievements News', path: '/news/achievements' },
            // { title: 'Research News', path: '/news/research' },
            // { title: 'Academic News', path: '/news/academics' },
        ],
    },
]

const HamburgerMenu: React.FC<Props> = () => {
    return (
        <div>
            <Drawer direction='left'>
                <DrawerTrigger className='text-3xl'>
                    <IoMenu />
                </DrawerTrigger>
                <DrawerContent className='h-full w-[85vw]'>
                    <div className='h-full grid grid-cols-2'>
                        <div className='w-[85vw]'>
                            <div id='mainContainer' className='m-8'>
                                <div className='border-b-2 border-muted p-2 flex justify-center items-center gap-1'>
                                    <Image
                                        src={nithLogo}
                                        alt='nitHamirpurLogo'
                                        className='h-[4.0rem] w-[4.7rem]'
                                    />
                                    <div className='flex flex-col'>
                                        <span className='font-light text-sm tracking-tighter'>
                                            NIT Hamirpur
                                        </span>
                                        <span className='font-bold text-lg leading-tight lg:text-3xl tracking-tighter'>
                                            DEPARTMENT OF COMPUTER SCIENCE &
                                            ENGINEERING
                                        </span>
                                    </div>
                                </div>
                                <div id='nav' className='flex flex-col my-10'>
                                    <DrawerClose asChild>
                                        <Link
                                            href='/'
                                            className='flex gap-2 items-center font-semibold border-b-2 py-2 hover:cursor-pointer'
                                        >
                                            Home
                                        </Link>
                                    </DrawerClose>
                                    {navList.map((obj) => (
                                        <Accordion
                                            key={obj.title}
                                            type='single'
                                            collapsible
                                        >
                                            <AccordionItem value={obj.title}>
                                                <AccordionTrigger>
                                                    {obj.title}
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <ul className='text-sm flex flex-col'>
                                                        {obj.list &&
                                                            obj.list.map(
                                                                (item) => (
                                                                    <DrawerClose
                                                                        asChild
                                                                        key={
                                                                            item.title
                                                                        }
                                                                    >
                                                                        <Link
                                                                            href={
                                                                                item.path
                                                                            }
                                                                            className='hover:bg-slate-200  px-4 py-2 hover:cursor-pointer'
                                                                        >
                                                                            {
                                                                                item.title
                                                                            }
                                                                        </Link>
                                                                    </DrawerClose>
                                                                ),
                                                            )}
                                                    </ul>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    ))}
                                    {/* <DrawerClose asChild>
                                        <Link
                                            href='/placementpage'
                                            className='flex gap-2 items-center font-semibold border-b-2 py-2 hover:cursor-pointer'
                                        >
                                            Placements
                                        </Link>
                                    </DrawerClose> */}
                                </div>
                            </div>
                        </div>
                        {/* <div
                            id='sidebar'
                            className='flex h-full items-center w-0'
                        >
                            <div className='absolute right-0 mr-4 w-2 h-[100px] rounded-full bg-muted' />
                        </div> */}
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    )
}

export default HamburgerMenu
