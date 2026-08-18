'use client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'

export default function PublicSideBar() {
    const [selectedState, setSelectedState] = useState('')
    const params = useParams() // extract slug ( name of faculty as slug )
    const facultyName = params.slug // 'faculty-name'
    const publicationsType = {
        Journal: '1',
        Conference: '2',
        Book: '3',
        'Book Chapter': '4',
    }
    const handleMenuClick = (title) => {
        setSelectedState(selectedState === title ? '' : title)
    }

    const navItems = [

        {
            title: 'Faculty Profile',
            path: `/people/faculty/${facultyName}/facultyInfo`,
        },
        {
            title: 'Journal',
            path: `/people/faculty/${facultyName}/publications?type=${publicationsType.Journal}`,
        },
        {
            title: 'Conference',
            path: `/people/faculty/${facultyName}/publications?type=${publicationsType.Conference}`,
        },
        {
            title: 'Book',
            path: `/people/faculty/${facultyName}/publications?type=${publicationsType.Book}`,
        },
        {
            title: 'Book Chapter',
            path: `/people/faculty/${facultyName}/publications?type=${publicationsType['Book Chapter']}`,
        },
        { title: 'Patents', path: `/people/faculty/${facultyName}/patents` },
        { title: 'Projects', path: `/people/faculty/${facultyName}/projects` },
        { title: 'Events', path: `/people/faculty/${facultyName}/events` },
        { title: 'Consultancies', path: `/people/faculty/${facultyName}/consultancies` },
        { title: 'Expert Talk', path: `/people/faculty/${facultyName}/experttalk` },
        { title: 'Research Supervision', path: `/people/faculty/${facultyName}/researchSupervision` },
        { title: 'Administrative Experience', path: `/people/faculty/${facultyName}/administrativeexperience` },
        { title: 'Honors & Recognitions Achieved ', path: `/people/faculty/${facultyName}/honors` },
        { title: 'International And National Exposure', path: `/people/faculty/${facultyName}/internationalAndNationalExposure` },
    ]

    return (
        <div className='h-screen min-w-[12vw] border-r-2 p-5 bg-gray-100'>
            <h1 className='py-5 text-center text-xl font-bold'>
                {/* <Link href='/admin/'>Admin Panel</Link> */}
            </h1>
            <div className='flex flex-col overflow-y-auto h-[70vh] no-scrollbar'>
                {navItems.map((item) => (
                    <div key={item.title} className='mb-3'>
                        <Link
                            href={item.path}
                            replace={true}
                            className={`block px-3 py-2 rounded cursor-pointer ${
                                selectedState === item.title
                                    ? 'bg-gray-300 font-semibold'
                                    : 'hover:bg-gray-200'
                            }`}
                            onClick={() => handleMenuClick(item.title)}
                        >
                            {item.title}
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    )
}
