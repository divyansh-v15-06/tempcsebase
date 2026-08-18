'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import FacultyCards from '@/components/people-components/staffcards'
import CircularProgress from '@mui/material/CircularProgress'

const api = process.env.NEXT_PUBLIC_API_URL

type RouterParams = {
    slug: string
}

type Props = {
    params: RouterParams
}

type Faculty = {
    name: string;
    uniqueFacultyId: string;
    designation: string;
    phoneNo: string;
    email: string;
    photo: string;
    researchInterest: string;
    portfolio: string;
}

const Page: React.FC<Props> = ({ params }) => {
    const [facultyData, setFacultyData] = useState<Faculty[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [headers, setHeaders] = useState({})

    useEffect(() => {
        setHeaders({
            Authorization: `Bearer ${sessionStorage.getItem("auth") as string}`,
        })
    }, [])

    useEffect(() => {
        const fetchData = () => {
            const urlWithParams = `${api}/staff/get`

            axios
                .get(urlWithParams, { headers })
                .then((response) => {
                    console.log(response)
                    setFacultyData(response.data.data)
                    console.log('setFacultyData', response.data.data)
                })
                .catch((error) => {
                    console.error('Error fetching data:', error)
                })
                .finally(() => {
                    setIsLoading(false)
                })
        }

        if (Object.keys(headers).length > 0) {
            fetchData()
        }
    }, [headers])

    if (isLoading) {
        return (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                }}
            >
                <CircularProgress color='inherit' />
            </div>
        )
    }

    return (
        <div id='peoplesPage' className='my-4 min-h-[50vh]'>
            <div className='text-center text-2xl lg:my-4 lg:text-3xl font-bold'>
                Staff
            </div>

            <div
                id='facultyDataTable'
                className='flex flex-wrap justify-center items-center z-[-1]'
            >
                {facultyData.map((facultyCard, index) => (
                    <div key={index}>
                        
                        <FacultyCards
                            //@ts-ignore
                            name={facultyCard.name}
                            uniqueFacultyId={facultyCard.uniqueFacultyId}
                            //@ts-ignore
                            position={facultyCard.designation}
                            //@ts-ignore
                            contact={facultyCard.phoneNo}
                            //@ts-ignore
                            email={facultyCard.email}
                            //@ts-ignore
                            photo={facultyCard.photo}
                            //@ts-ignore
                            researchInterest={facultyCard.researchInterest}
                            //@ts-ignore
                            portfolio={facultyCard.portfolio}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Page
