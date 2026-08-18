'use client'
import axios from 'axios'
import { useEffect, useState } from 'react'

export default function Page() {
    // const router = useRouter()
    const [data, setData] = useState([])
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/programOffered/get`,
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
            <div className='max-w-[1700px] mx-auto'>
                <h1 className='text-center text-2xl lg:text-3xl p-3 mt-5 font-bold'>
                    Programmes Offered
                </h1>
                <br />
                <h2 className='p-2 mb-1 text-lg md:text-2xl lin-h text-center tracking-tighter'>
                    The department offers following undergraduate, postgraduate
                    and research programmes :
                </h2>
            </div>

            <div className='flex flex-wrap justify-center gap-6 p-4'>
                <ProgramCard
                    title='B.Tech in Computer Science and Engineering'
                    description='B.Tech in Computer Science and Engineering is a 4-year undergraduation programme. The course curriculum of Bachelor programme is designed to include components like theory and practical course works, seminars and projects, through which a student can develop his/her concepts and intellectual skills.'
                    link='https://nith.ac.in/uploads/topics/15922919643061.pdf'
                />

                <ProgramCard
                    title='Dual-Degree in Computer Science and Engineering'
                    description='Dual-Degree in Computer Science and Engineering is a 5-year Integrated B.Tech and M.Tech programme. The course curriculum of this programme is designed to include components like theory and practical course works, seminars and projects. Along with these, students will be able to study Postgraduation subjects which will enhance their knowledge about subjects and they will be able to do research.'
                    link='https://nith.ac.in/uploads/topics/15922919825709.pdf'
                />

                <ProgramCard
                    title='M.Tech in Computer Science and Engineering'
                    description='M.Tech in Computer Science and Engineering is a 2-year postgraduate programme. The program provides a solid foundation in theoretical concepts, algorithms, data structures, and software development. Students gain expertise in areas like Cloud Computing, Data Analytics, Artificial Intelligence, and Database Management Techniques.'
                    link='https://nith.ac.in/syllabus/pg/M_Tech_%20Computer%20Science%20and%20Engg_Course%20Str_and_Syllabus.pdf'
                />

                <ProgramCard
                    title='M.Tech in Computer Science and Engineering (Artificial Intelligence)'
                    description="This program aims to enhance students' technical skills and expertise in implementing and deploying AI solutions for real-world applications. Graduates will comprehend the theoretical foundations of computing and the modeling and design of Artificial Intelligence (AI) systems."
                    link='https://nith.ac.in/syllabus/pg/M_Tech_Computer%20Science%20and%20Engineering%20(Artificial%20Intelligence)_Course_Str_and_Syllabus.pdf'
                />

                <ProgramCard
                    title='Doctoral Programs in Computer Science and Engineering'
                    description='A doctoral program in Computer Science and Engineering (CSE) aims to provide advanced education and research opportunities to students interested in pursuing careers in academia, industry research, or leadership positions in technology. The objectives of such a program typically include: Advanced Research Skills, Specialization in domain, Critical Thinking and Problem-Solving, Publication and Dissemination, Leadership and Collaboration, Teaching and Mentoring.'
                    link=''
                />
            </div>
        </>
    )
}

function ProgramCard({ title, description, link }) {
    return (
        <div className='flex flex-col shadow-md p-4 w-full md:w-1/3'>
            <h1 className='text-xl text-white font-bold mb-2 bg-[#33110e] p-2'>
                {title}
            </h1>
            <p className='text-justify'>{description}</p>
            {link === '' ? (
                <></>
            ) : (
                <a href={link} target='_blank' className='text-blue-800'>
                    View
                </a>
            )}
        </div>
    )
}
