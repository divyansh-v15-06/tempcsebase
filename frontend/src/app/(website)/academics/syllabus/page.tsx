//@ts-nocheck
'use client'
// import { useRouter } from 'next/router'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import axios from 'axios'
import { useEffect, useState } from 'react'

const dataa = [
    {
        title: 'Course Structure and Syllabus as per NEP-2020 for Bachelor of Technology in Computer Science and Engineering',
        pdfLink:
            'https://nith.ac.in/uploads/topics/new-nep-cse-syllabus17222307132912.pdf',
    },
    {
        title: 'B. Tech. First year Curriculum as per NEP-2020 is being started w.e.f. July 2023',
        pdfLink:
            'https://nith.ac.in/uploads/topics/btech-first-year-curriculum-nep-202016910359689198.pdf',
    },
    {
        title: 'Course Curriculum (Course Structure and Syllabi) for First Year Bachelor Programmes w.e.f. 2019 and Onwards',
        pdfLink:
            'https://nith.ac.in/uploads/topics/btech-first-year-curriculum-booklet16097421083587.pdf',
    },
    {
        title: 'Course Curriculum (Course Structure and Syllabi) for Second Year and onwards Bachelor Programmes for Students admitted in 2019 and Onwards',
        pdfLink: 'https://nith.ac.in/uploads/topics/15922919643061.pdf',
    },
    {
        title: 'Course Syllabi of Open Electives for Third Year Bachelor Programmes of Various Departments (Applicable for Both Old & New Schemes)',
        pdfLink:
            'https://nith.ac.in/uploads/topics/new-open-elective-course-third-year16009490689435.pdf',
    },
]

export default function Page() {
    // const router = useRouter()
    const [data, setData] = useState([])
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/syllabus/get`,
                )
                console.log('responce is:', response)
                setData(response.data.data)
                // setLoading(false)
            } catch (error) {
                console.error('Error fetching top achievements:', error)
            }
        }
        fetchData()
    }, [])
    return (
        <>
            <div className='max-w-[1700px] mx-auto py-5 px-8'>
                <h1 className=' text-2xl lg:text-3xl font-bold text-center m-8  '>
                    Course Structure and Syllabus
                </h1>

                {/* <hr /> */}
            </div>
            <div className=' relative flex flex-col flex-wrap items-center justify-center my-2 '>
                {' '}
                {dataa.map((item, index) => {
                    return (
                        <>
                            <div className=' flex shadow-md p-4 w-full md:w-1/2 gap-4 items-center'>
                                <h1 className='text-xl text-white font-bold mb-2 bg-[#33110e] py-1 px-2 '>
                                    {index + 1}
                                </h1>
                                <p className='text-justify grow font-semibold'>
                                    {item.title}
                                </p>
                                <a
                                    href={item.pdfLink}
                                    target='_blank'
                                    className='text-blue-800'
                                >
                                    View
                                </a>
                            </div>
                        </>
                    )
                })}
            </div>
        </>
    )
}
