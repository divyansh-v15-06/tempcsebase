'use client'
import Link from 'next/link'
import path from 'path'
import React, { useState } from 'react'

type Props = {}

const navMenu = [
    {
        title: 'Analytics',
        subPaths: [
            {
                title: 'Dashboard',
                path: '/admin/analytics/',
            },
            {
                title: 'Reports',
                path: '/admin/report/',

            }
            
        ],
    },
    {
        title: 'Home ',
        subPaths: [
            {
                title: 'Carousel',
                path: '/admin/home/carousel',
            },
            {
                title: 'About Us',
                path: '/admin/home/aboutus',
            },
        ],
    },
    {
        title: 'Academics ',
        subPaths: [
            {
                title: 'Courses Taught',
                path: '/admin/academics/courses',
            },
            {
                title: 'Labs',
                path: '/admin/academics/labs',
            },
        ],
    },
    {
        title: 'People',
        subPaths: [
            {
                title: 'Faculty',
                path: '/admin/people/faculty',
            },
            {
                title: 'PhD Scholar',
                path: '/admin/people/phdscholars',
            },
            {
                title: 'Staff',
                path: '/admin/people/staff',
            },
            {
                title: 'Students',
                path: '/admin/people/students',
            },
        ],
    },
    {
        title: 'Researches',
        subPaths: [
            {
                title: 'Publications',
                path: '/admin/research/publications',
            },
            {
                title: 'Patents',
                path: '/admin/research/patents',
            },
            {
                title: 'projects',
                path: '/admin/research/projects',
            },
        ],
    },
    {
        title: 'News and events',
        subPaths: [
            {
                title: 'Announcements',
                path: '/admin/news/announcements',
            },
            {
                title: 'Achievements',
                path: '/admin/news/achievements',
            },
        ],
    },
    {
        title: 'Department Data',
        subPaths: [
            {
                title: 'Department Notices',
                path: '/admin/departmentdata/departmentnotices',
            },
            {
                title: 'Equipments Data',
                path: '/admin/equipments',
            },
        ],
    },
    {
        title: 'Credentials',
        subPaths: [
            {
                title: 'Faculties Credentials',
                path: '/admin/credentials/facultiescredentials',
            },
        ], 
    }
    ,
    {
        title: 'HOD',
        subPaths: [
            {
                title: 'Hod Details',
                path: '/admin/hod',
            },
        ], 
    }
]

export default function AdminNavbar({}: Props) {
    const [selectedState, setSelectedState] = useState('')
    const [selectedSubPath, setSelectedSubPath] = useState('')

    const handleMenuClick = (title: string) => {
        setSelectedState(selectedState === title ? '' : title)
    }

    const handleSubPathClick = (path: string) => {
        setSelectedSubPath(path)
    }

    return (
        <div className='h-[65vh] overflow-auto min-w-[12vw] border-r-2 p-5 bg-gray-100'>
            <h1 className='py-5 text-center text-xl font-bold'>
                <Link href='/admin/'>Admin Panel</Link>
            </h1>
            <div className='flex flex-col'>
                {navMenu.map((item) => (
                    <div key={item.title} className='mb-3'>
                        <div
                            className={`px-3 py-2 rounded cursor-pointer ${
                                selectedState === item.title
                                    ? 'bg-gray-300 font-semibold'
                                    : 'hover:bg-gray-200'
                            }`}
                            onClick={() => handleMenuClick(item.title)}
                        >
                            {item.title}
                        </div>
                        {selectedState === item.title && item.subPaths && (
                            <div className='ml-3 mt-2 flex flex-col'>
                                {item.subPaths.map((subItem) => (
                                    <Link
                                        href={subItem.path}
                                        key={subItem.title}
                                        className={`px-3 py-2 rounded cursor-pointer ${
                                            selectedSubPath === subItem.path
                                                ? 'bg-gray-400 font-semibold'
                                                : 'hover:bg-gray-200'
                                        }`}
                                        onClick={() =>
                                            handleSubPathClick(subItem.path)
                                        }
                                    >
                                        {subItem.title}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
                <button className='mx-3 mt-16 bg-red-600 text-white px-7 py-2 rounded-lg '
                onClick={()=>{
                    sessionStorage.removeItem('authToken')
                    window.location.href = '/admin/login'
                }
                }>Logout</button>
        </div>
    )
}
