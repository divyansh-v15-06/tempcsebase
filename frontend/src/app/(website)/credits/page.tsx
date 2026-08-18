import React from 'react'
import { FaGithub, FaLinkedin } from 'react-icons/fa'

const teamMembers = [
    {
        rollno: '22BCS107',
        name: 'Shryansh',
        department: 'Computer Science  ',
        role: 'Team_Lead',
        email: 'shryansh2024@gmail.com',
        linkedin: 'https://www.linkedin.com/in/shryansh-chaudhary',
        github: 'https://github.com/Shryansh107',
    },
    {
        rollno: '22BPH020',
        name: 'Karan Gill',
        department: ' Engineering Physics',
        role: 'Backend',
        email: 'karangill1810@gmail.com',
        linkedin: 'https://www.linkedin.com/in/karan-gill-61353a261/',
        github: 'https://github.com/Karanpal97',
    },
    {
        rollno: '22BEE067',
        name: 'Kirandeep Kaur Gill',
        department: 'Electrical  Engineering ',
        role: 'Backend',
        email: '22bee067@nith.ac.in',
        linkedin: 'https://www.linkedin.com/in/kirandeep-kaur-gill-561823270/',
        github: 'https://github.com/Kiran1810',
    },
    {
        rollno: '22DCS010',
        name: 'Kirti Sharma',
        department: 'Computer Science  ',
        role: 'Frontend',
        email: 'kirtisharma2745@gmail.com',
        linkedin: 'https://www.linkedin.com/in/kirti-sharma-687926266/',
        github: 'https://github.com/kirtisharma2745',
    },

    {
        rollno: '22DCS025',
        name: 'Seejal Sood',
        department: 'Computer Science  ',
        role: 'Frontend',
        email: 'seejalsood03@gmail.com',
        linkedin: 'https://www.linkedin.com/in/seejal-sood-73221325a/',
        github: 'https://github.com/Seejal03',
    },
    {
        rollno: '22BCS088',
        name: 'Rudransh Singh Athwal',
        department: 'Computer Science  ',
        role: 'Frontend',
        email: 'rsathwal04@gmail.com',
        linkedin: 'https://www.linkedin.com/in/rudransh-singh-athwal/',
        github: 'https://github.com/rudransh-singh-athwal',
    },
    {
        rollno: '23BCS036',
        name: 'Himanshu',
        department: 'Computer Science  ',
        role: 'Full Stack',
        email: 'himanshu10092004@gmail.com',
        linkedin: 'https://www.linkedin.com/in/himanshus2004/',
        github: 'https://github.com/himanshu1009',
    },
    {
        rollno: '23BCS063',
        name: 'Mritunjai Gupta',
        department: 'Computer Science  ',
        role: 'Backend',
        email: 'themritunjai@gmail.com',
        linkedin: 'https://www.linkedin.com/in/mritunjai-gupta/',
        github: 'https://github.com/Mritunjaii',
    },
]

const facultyMembers = [
    {
        id: 1,
        name: 'Dr. Arun Kumar Yadav',
        position: 'Assistant Professor Grade-I',
        department: 'Computer Science',
    },
    {
        id: 1,
        name: 'Dr. Mohit Kumar',
        position: 'Assistant Professor Grade-I',
        department: 'Computer Science',
    },
    {
        id: 1,
        name: 'Dr. Mohammad Khalid Pandit',
        position: 'Assistant Professor Grade-II',
        department: 'Computer Science',
    },
    {
        id: 1,
        name: 'Dr. Ram Prakash Sharma',
        position: 'Assistant Professor Grade-II',
        department: 'Computer Science',
    },
]

const getRoleClass = (role) => {
    switch (role) {
        case 'Frontend':
            return 'bg-[#fdffc3] text-[#a2690d] border border-[#a2690d]'
        case 'Backend':
            return 'bg-[#cdffe2] text-[#0d8c3c] border border-[#0d8c3c]'
        case 'Team_Lead':
            return 'bg-[#fff2e4] text-[#d93f00] border border-[#d93f00]'
        case 'Full Stack':
            return 'bg-[#fff2e4] text-[#d93f00] border border-[#d93f00]'
        default:
            return 'bg-gray-500 text-white'
    }
}

const DeveloperPage = () => {
    return (
        <div className='min-h-screen'>
            <main className='container mx-auto mt-8 p-4'>
                <h1 className='text-3xl font-bold text-center mb-6'>
                    Developer Team
                </h1>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
                    {/* Faculty section for mobile on top, for desktop on the right */}
                    <section className='md:col-span-1 md:order-2 order-1'>
                        <h2 className='text-2xl text-center font-semibold mb-4'>
                            Faculty Incharge
                        </h2>
                        <div className='bg-white shadow-md rounded-lg p-4'>
                            {facultyMembers.map((faculty) => (
                                <div
                                    key={faculty.id}
                                    className='mb-4 last:mb-0'
                                >
                                    <p className='font-medium'>
                                        {faculty.name}
                                    </p>
                                    <p className='text-[#01419a]'>
                                        {faculty.position}, {faculty.department}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Team members section, on mobile below the faculty section, on desktop takes left and main space */}
                    <section className='md:col-span-2 md:order-1 order-2'>
                        <h2 className='text-2xl text-center font-semibold mb-4'>
                            Team Members
                        </h2>
                        <div className='bg-white shadow-md rounded-lg overflow-x-auto'>
                            <table className='w-full'>
                                <thead className='bg-[#272b40] text-white'>
                                    <tr>
                                        <th className='p-2 text-left'>S.no</th>
                                        <th className='p-2 text-left'>
                                            RollNo
                                        </th>
                                        <th className='p-2 text-left'>Name</th>
                                        <th className='p-2 text-left'>
                                            Department
                                        </th>
                                        <th className='p-2 text-left'>Role</th>
                                        <th className='p-2 text-left'>Email</th>
                                        <th className='p-2 text-left'>
                                            LinkedIn
                                        </th>
                                        <th className='p-2 text-left'>
                                            GitHub
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teamMembers.map((member, index) => (
                                        <tr
                                            key={member.rollno}
                                            className={
                                                index % 2 === 0
                                                    ? 'bg-white'
                                                    : ''
                                            }
                                        >
                                            <td className='p-2'>{index + 1}</td>
                                            <td className='p-2'>
                                                {member.rollno}
                                            </td>
                                            <td className='p-2 font-bold'>
                                                {member.name}
                                            </td>
                                            <td className='p-2'>
                                                {member.department}
                                            </td>
                                            <td className='p-2'>
                                                <span
                                                    className={`px-2 py-1 rounded-full text-sm font-semibold ${getRoleClass(
                                                        member.role,
                                                    )}`}
                                                >
                                                    {member.role}
                                                </span>
                                            </td>
                                            <td className='p-2'>
                                                <a
                                                    href={`mailto:${member.email}`}
                                                    className='text-[#01419a] hover:text-[#1d72e9]'
                                                >
                                                    {member.email}
                                                </a>
                                            </td>
                                            <td className='p-2'>
                                                <a
                                                    href={member.linkedin}
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    className='text-[#01419a] hover:text-[#1d72e9]'
                                                >
                                                    <FaLinkedin className='inline mr-1' />
                                                </a>
                                            </td>
                                            <td className='p-2'>
                                                <a
                                                    href={member.github}
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    className='text-[#01419a] hover:text-[#1d72e9]'
                                                >
                                                    <FaGithub className='inline mr-1' />
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    )
}

export default DeveloperPage
