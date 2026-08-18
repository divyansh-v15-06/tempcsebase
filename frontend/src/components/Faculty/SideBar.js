'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { title } from 'process'
import { useState } from 'react'
import { toast, Toaster } from 'react-hot-toast'
import { useSearchParams } from 'next/navigation'
import path from 'path'

export default function SideBar() {
    const [selectedState, setSelectedState] = useState('')
    const router = useRouter()
    const searchParams = useSearchParams()
    const type = searchParams.get('type')
    const publicationsType = {
        Journal: '1',
        Conference: '2',
        Book: '3',
        'Book Chapter': '4',
    }

    const handleMenuClick = (title, path) => {
        setSelectedState(title)

        if (publicationsType[title]) {
            const params = new URLSearchParams(searchParams)
            params.set('type', publicationsType[title]) // Correctly set type as string
            router.replace(`${path}?${params.toString()}`, { scroll: false })
        } else {
            router.replace(path)
        }
    }

    const navItems = [
        
        { title: 'Dashboard ', path: '/faculty/analytics' },
        // { title: 'Publications', path: '/faculty/publications' },
        {
            title: 'Qualification',
            path: '/faculty/educationQualification',
        },
        { title: 'Journal', path: '/faculty/publications' },
        { title: 'Conference', path: '/faculty/publications' },
        { title: 'Book', path: '/faculty/publications' },
        { title: 'Book Chapter', path: '/faculty/publications' },
        { title: 'Patents', path: '/faculty/patents' },
        { title: 'Projects', path: '/faculty/projects' },
        { title: 'Events', path: '/faculty/events' },
        { title: 'Consultancies', path: '/faculty/consultancies' },
        { title: 'Expert Talk', path: '/faculty/experttalk' },
        { title: 'Research Supervision', path: '/faculty/researchSupervision' },
        { title: 'Teaching Experience', path: '/faculty/teachingexp' },
        {title:'Courses Taught', path:'/faculty/CourseAssigned'},
        {
            title: 'Administrative Experience',
            path: '/faculty/administrativeexperience',
        },
        { title: 'Honors & Recognitions Achieved', path: '/faculty/honors' },
        {
            title: 'International & National Exposure',
            path: '/faculty/internationalAndNationalExposure',
        },
    ]

    return (
        <div className='h-full min-w-[12vw] border-r-2 p-5 bg-gray-100 overflow-auto'>
            <h1 className='py-5 text-center text-xl font-bold'>
                {/* Placeholder for admin panel link */}
            </h1>
            <div className='flex flex-col'>
                {navItems.map((item) => (
                    <div key={item.title} className='mb-3'>
                        <div
                            className={`block px-3 py-2 rounded cursor-pointer ${
                                selectedState === item.title
                                    ? 'bg-gray-300 font-semibold'
                                    : 'hover:bg-gray-200'
                            }`}
                            onClick={(e) => {
                                e.preventDefault() // Prevent navigation for the "Coming Soon" link
                                handleMenuClick(item.title, item.path)
                            }}
                        >
                            {item.title}
                        </div>
                    </div>
                ))}
            </div>
            <Toaster />
        </div>
    )
}
