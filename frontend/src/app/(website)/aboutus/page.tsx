'use client'
import axios from 'axios'
import React, { useEffect, useState } from 'react'

type Props = {}

function AboutUs({}: Props) {
    return (
        <div className='bg-[#f4f0eb] flex justify-center items-center min-h-screen'>
            <div className='w-full md:w-[65vw] px-8'>
                <h1 className='text-2xl lg:text-3xl font-bold text-center m-8 '>
                    About Us
                </h1>
                <div className='flex justify-center items-center'>
                    <img
                        src='/aboutusimg.jpg'
                        alt='About Us'
                        className='w-full h-auto '
                    />
                </div>

                <div className='text-base lg:text-lg md:tracking-wider text-justify px-6 m-5'>
                    Located in Hamirpur district of Himachal Pradesh, NIT
                    Hamirpur enjoys a really scenic environment and pleasant
                    weather. Established in the year 1986, as REC Hamirpur, NIT
                    Hamirpur has been declared as the Institute of National
                    Importance under the Act of Parliament, 2007. Established in
                    1989 as the Department of Computer Science & Engineering, we
                    have an excellent & rich history and an outstanding record
                    of contributions to the profession and community. The
                    Department is well recognized for excellence in facilities
                    and teaching.
                </div>
                <h2 className='text-center text-xl lg:text-3xl font-bold pb-[2rem] p-5 text-red-900'>
                    Vision
                </h2>
                <div className='text-base lg:text-lg md:tracking-wider text-justify px-6'>
                    To build a vibrant multicultural learning environment
                    founded on value-based academic principles, where in all
                    involved shall contribute effectively, efficiently and
                    responsibly to the national and global community.
                </div>

                <h2 className='text-center text-xl lg:text-3xl font-bold pb-[2rem] text-red-900'>
                    Mission
                </h2>
                <ul className='text-base lg:text-lg md:tracking-wider text-justify px-6 list-disc list-inside mb-12'>
                    <li>
                        To achieve academic excellence in engineering,
                        technology and science by imparting quality and
                        value-based education.
                    </li>
                    <li>
                        To inspire our students to become responsible citizens
                        and competent professionals with high ethical values.
                    </li>
                    <li>
                        To meet the expectations of technical human resource at
                        national and international level.
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default AboutUs
