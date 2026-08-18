import React from 'react'

type Props = {
    studentData: {
        name: string
        rollNo: string
        email: string
    }[]
}

export default function StudentCards({ studentData }: Props) {
    return (
        <div className='overflow-x-auto w-full my-2 lg:mx-8'>
            {studentData.length === 0 ? (
                <div>No data available</div>
            ) : (
                <div className='border rounded  my-2 lg:mx-8'>
                    <table className='border-1 border-l border-r border-solid border-black w-full'>
                        <thead>
                            <tr>
                                <th className='text-nowrap  p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff] w-1/12 '>
                                    Sr. No.
                                </th>
                                <th className='text-nowrap  p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff] w-1/12 '>
                                    Roll Number
                                </th>
                                <th className='text-nowrap p-3 text-left text-xl font-medium bg-[#272e3f] w-[40%] text-[#fff]'>
                                    Name
                                </th>
                                <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff] w-1/12'>
                                    Email
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {studentData.map((student, index) => (
                                <tr
                                    key={student.rollNo}
                                    className={index % 2 ? 'bg-gray-300 ' : ''}
                                >
                                    <td className='p-2 text-center border-b border-r border-1 border-solid border-black'>
                                        {index + 1}
                                    </td>
                                    <td className='p-2 text-center border-b border-r border-1 border-solid border-black'>
                                        {student.rollNo}
                                    </td>
                                    <td className='p-2 text-left border-b border-1 border-solid border-black text-lg'>
                                        {student.name}
                                    </td>
                                    <td className='p-2 text-center text-nowrap border-b border-l border-1 border-solid border-black'>
                                        {student.email}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
