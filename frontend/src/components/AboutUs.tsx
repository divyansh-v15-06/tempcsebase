'use client'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
type Props = {}
function AboutUs({}: Props) {
    const [data, setData] = useState([])
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/aboutus/get`,
                )
                setData(response.data.data)
                // setLoading(false)
            } catch (error) {
                console.error('Error fetching top achievements:', error)
            }
        }
        fetchData()
    }, [])
    return (
        <div className='w-full md:w-[65vw] py-2 px-8'>
            <h2 className='text-xl lg:text-3xl font-bold pb-[2rem]'>
                <span className='border-l-4 border-[#c1361d] pr-4'></span>
            </h2>
            <div className='text-base lg:text-lg md:tracking-wider text-justify px-6'>
                Located in Hamirpur district of Himachal Pradesh, NIT Hamirpur
                enjoys a really scenic environment and pleasant weather.
                Established in the year 1986, as REC Hamirpur, NIT Hamirpur has
                been declared as the Institute of National Importance under the
                Act of Parliament, 2007. Established in 1989 as the Department
                of Computer Science & Engineering, we have an excellent & rich
                history and an outstanding record of contributions to the
                profession and community. The Department is well recognized for
                excellence in facilities and teaching.
            </div>
        </div>
    )
}
export default AboutUs
