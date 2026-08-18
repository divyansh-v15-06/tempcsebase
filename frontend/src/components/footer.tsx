import Image from 'next/image'
import React from 'react'
import nithLogo from '../../public/nitHamirpurLogo.png'
import { FaTwitter, FaLinkedin, FaFacebook } from 'react-icons/fa'
const socialLinks = [
    {
        id: 1,
        icon: <FaTwitter />,
        url: 'https://x.com/csedeptnith?t=frgcc4UGvCYPSLdWo8Wv2Q&s=08',
    },
    {
        id: 2,
        icon: <FaLinkedin />,
        url: 'https://www.linkedin.com/company/cse-department-nit-hamirpur/',
    },
    {
        id: 3,
        icon: <FaFacebook />,
        url: 'https://www.facebook.com/profile.php?id=61554639667601',
    },
]

const LINKS = [
    {
        title: 'Research',
        items: [
            { name: 'Publications', path: '/research/publications' },
            { name: 'Projects', path: '/research/projects' },
            { name: 'Patents', path: '/research/patents' },
        ],
    },
    {
        title: 'People',
        items: [
            { name: 'Students', path: '/people/students' },
            { name: 'Faculty', path: '/people/faculty' },
            { name: 'PHD scholars', path: '/people/phdscholars' },
            { name: 'Staff', path: '/people/staff' },
        ],
    },
    {
        title: 'News and Events',
        items: [
            { name: 'Announcements', path: '/news/announcements' },
            { name: 'Achievement', path: '/news/achievements' },
            { name: 'Research', path: '/news/research' },
            { name: 'Academic', path: '/news/academics' },
        ],
    },
]

const currentYear = new Date().getFullYear()

type Props = {}

function Footer({}: Props) {
    return (
        <div className='relative container max-w-full flex-wrap  bg-[#33110e] text-neutral-300 flex justify-between items-center p-10 '>
            <div className='mx-auto w-full  max-w-7xl lg:px-8 '>
                <div className='grid grid-cols-1 lg:grid-cols-2 justify-center items-center gap-4 '>
                    <Image src={nithLogo} alt='nitHamirpurLogo' className='' />
                    <div className='  p-4 grow overflow-auto no-scrollbar flex justify-center gap-6 '>
                        <div className=' grid place-content-center'>
                            <span className='text-lg font-semibold underline'>
                                Contact Us{' '}
                            </span>
                            <div>
                                <span className='block md:inline font-semibold text-nowrap'>
                                    Phone No :
                                </span>
                                <span className='block md:inline text-nowrap md:ml-2'>
                                    <a
                                        href='tel:+91-1972-254400'
                                        className='underline'
                                    >
                                        +91-1972-254400
                                    </a>
                                </span>
                            </div>
                            <div>
                                <span className='block md:inline font-semibold'>
                                    HoD Email:
                                </span>

                                <span>
                                    <a
                                        href='mailto:head.cse@nith.ac.in'
                                        className='block md:inline underline md:ml-2'
                                    >
                                        head.cse@nith.ac.in
                                    </a>
                                </span>
                            </div>
                            <div>
                                <span className='block md:inline font-semibold text-nowrap'>
                                    Office Email :
                                </span>

                                <a
                                    href='mailto:office.cse@nith.ac.in'
                                    className='block md:inline underline text-wrap md:ml-2'
                                >
                                    office.cse@nith.ac.in
                                </a>
                            </div>
                        </div>
                        <div className='text-center hidden md:flex'>
                            <iframe
                                src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3394.273281693904!2d76.52516391744383!3d31.708429100000007!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3904d5487e12c4a1%3A0x395f92d3a202a7d0!2sNational%20Institute%20of%20Technology%2C%20Hamirpur!5e0!3m2!1sen!2sin!4v1720725113641!5m2!1sen!2sin'
                                width='270'
                                height='150'
                                className='border-2 border-slate-300 rounded'
                                // style='border:0;'
                                // @ts-ignore
                                allowfullscreen=''
                                loading='lazy'
                                referrerpolicy='no-referrer-when-downgrade'
                            ></iframe>
                        </div>
                    </div>
                    {/* <div className='hidden md:grid grid-cols-3 justify-between gap-4'>
                            {LINKS.map(({ title, items }) => (
                                <ul key={title}>
                                    <span className='mb-3 font-medium opacity-40'>
                                        {title}
                                    </span>
                                    {items.map(({ name, path }) => (
                                        <li key={name}>
                                            <a
                                                href={path}
                                                className='py-1.5 font-normal transition-colors hover:text-blue-gray-900 text-nowrap'
                                            >
                                                {name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            ))}
                        </div> */}
                </div>
                <div className='mt-12 flex w-full flex-col items-center justify-center border-t border-blue-gray-50 py-4 md:flex-row md:justify-between'>
                    <span className='mb-4 text-center font-normal text-blue-gray-900 md:mb-0'>
                        &copy; {currentYear}{' '}
                        <a href='https://www.nith.ac.in/'>NIT Hamirpur</a>. All
                        Rights Reserved.
                    </span>

                    {/* addition */}
                    <span className='flex sm:justify-center'>
                        <div className='font-general-regular flex flex-col justify-center items-center  sm:mb-22'>
                            <ul className='flex gap-2 sm:gap-8'>
                                {socialLinks.map((link) => (
                                    <a
                                        href={link.url}
                                        target='__blank'
                                        key={link.id}
                                        className='  hover:text-blue-500 shadow-sm p-1 duration-300'
                                    >
                                        <i className='text-xl sm:text-2xl md:text-l'>
                                            {link.icon}
                                        </i>
                                    </a>
                                ))}
                            </ul>
                        </div>
                    </span>
                    <span className='text-sm text-white'>
                        Developed in-house by{' '}
                        <a
                            href={'/credits'}
                            className='text-slate-400 font-medium underline hover:text-slate-200'
                        >
                            NITH Developer Team
                        </a>{' '}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default Footer
