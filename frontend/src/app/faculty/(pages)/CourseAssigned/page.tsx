"use client"
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import SubjectTaughtModal from '@/components/research-components/subjectModal'
import CircularProgress from '@mui/material/CircularProgress'

type Course = {
  courseName: string
  courseCode: string
  semester: string
  courseLevel: string
  academicYear: string
}

const AssignedCoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    const id = sessionStorage.getItem('facultyName')
    console.log('Fetching courses for faculty ID:', id);

    const fetchCourses = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/subjectTaught/get?name=${id}`)
        setCourses(res.data?.data || [])
      } catch (error) {
        console.error('Error fetching courses:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  return (
    <div className='min-h-screen  p-6'>
      <div className='max-w-5xl mx-auto'>
        <h1 className='text-3xl font-semibold mb-4 text-black'>Courses Taught</h1>

        {loading ? (
          <p className="text-gray-500">Loading assigned courses...</p>
        ) : courses.length === 0 ? (
          <p className="text-red-500">You have not been assigned any courses for this semester.</p>
        ) : (
          <>
            <p className='mb-4 text-gray-700'>
              You have been assigned the following <strong>{courses.length}</strong> course{courses.length > 1 ? 's' : ''}:
            </p>
            <div className='flex '>
              <div className='w-full'>
                <div className='gap-2 w-full  ' id='projectsSection'>
                  {loading ? (
                    <div className='flex items-center justify-center'>
                      <CircularProgress color='inherit' />
                    </div>
                  ) : (
                    <Table

                      data={courses}
                    />
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
function Table({ data }) {
    return (
        <div className='font-sans relative'>
            <div className='overflow-x-auto border rounded my-2 lg:mx-8'>
                <table className='border-1 rounded border border-solid border-[#dde2e6] w-full'>
                    <thead>
                        <tr className='text-md bg-[#f7dcdd]'>
                            <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6] w-1/12'>
                                Sr. No.
                            </th>
                            <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                Course Code
                            </th>
                            <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                Course Name
                            </th>
                            <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                Semester
                            </th>
                            <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                UG/PG
                            </th>
                            <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                L
                            </th>
                            <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                T
                            </th>
                            <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                P
                            </th>
                            <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                Credits
                            </th>
                            <th className='text-nowrap p-3 text-center  bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                Academic Year
                            </th>
                        </tr>
                    </thead>
                    <tbody
                        className='text-sm font-normal'>
                        {data && data.length > 0 ? (
                            data.map((item, index) => (
                                <tr
                                    key={item.id}
                                    className={index % 2 ? 'bg-gray-300' : ''}
                                >
                                    <td className='p-2 text-center border-b border-r border-l border-solid border-black'>
                                        {index + 1}
                                    </td>
                                    <td className='p-2 text-left border border-1 border-solid border-black'>
                                        {item.courseCode}
                                    </td>
                                    <td className='p-2 text-left border border-1 border-solid border-black'>
                                        {item.courseName}
                                    </td>
                                    <td className='p-2 text-left border border-1 border-solid border-black'>
                                        {item.semester}
                                    </td>

                                    <td className='p-2 text-left border border-1 border-solid border-black'>
                                        {item.courseLevel}
                                    </td>
                                    <td className='p-2 text-left border border-1 border-solid border-black'>
                                        {item.lectureHours}
                                    </td>
                                    <td className='p-2 text-left border border-1 border-solid border-black'>
                                        {item.tutorialHours}
                                    </td>
                                    <td className='p-2 text-left border border-1 border-solid border-black'>
                                        {item.practicalHours}
                                    </td>
                                    <td className='p-2 text-left border border-1 border-solid border-black'>
                                        {(item.practicalHours*0.5) + item.tutorialHours + item.lectureHours}
                                    </td>


                                    <td className='p-2 text-left border border-1 border-solid border-black'>
                                        {item.academicYear}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td className='p-4 text-center' colSpan={7}>
                                    No data
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default AssignedCoursesPage
