'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import FilterOptions from '@/components/people-components/filterOptions'
import FacultyCards from '@/components/people-components/FacultyCards'
import { Button } from '@/components/ui/button'
import CircularProgress from '@mui/material/CircularProgress'

const api = process.env.NEXT_PUBLIC_API_URL

type RouterParams = {
    slug: string
}

type Props = {
    params: RouterParams
}

interface FacultyCard {
    name: string
    position: string
    phone_no: number
    email: string
    photo: string
    portfolio: string
    researchInterest: string
    uniqueFacultyId:string
}

const options = [
    { value: ' ', title: 'All' },
    { value: 'Professor', title: 'Professor' },
    { value: 'Associate Professor', title: 'Associate Professor' },
    {
        value: 'Assistant Professor Grade-I',
        title: 'Assistant Professor Grade-I',
    },
    {
        value: 'Assistant Professor Grade-II',
        title: 'Assistant Professor Grade-II',
    },
    {
        value: '---',
        title: 'Temporary Faculty',
    },
]
const Page: React.FC<Props> = ({ params }) => {
    const [facultyData, setFacultyData] = useState<FacultyCard[]>([])
    const [filter1, setFilter1] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isTempFaculty, setIsTempFaculty] = useState<boolean>(true)

    // const routeType = params.slug || ''

    const fetchData = () => {
        setIsLoading(true)
        const urlWithParams = `${api}/faculty/get?position=${filter1}`

        axios
            .get(urlWithParams)
            .then((response) => {
                console.log(response)
                setFacultyData(response.data.data)
            })
            .catch((error) => {
                console.error('Error fetching data:', error)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    useEffect(() => fetchData(), [filter1])

    useEffect(() => {
        if (filter1 === '---') {
            setIsTempFaculty(false)
        } else {
            setIsTempFaculty(true)
        }
    }, [filter1])

    return (
        <>
            <div id='peoplesPage' className='my-4 min-h-[50vh]'>
                {(filter1 === ' ' || filter1 === '') && (
                    // remove the following component
                    <>
                        {/* <>{setIsTempFaculty(true)}</> */}
                        <div className='text-center text-2xl lg:my-4 lg:text-3xl font-bold'>
                            Faculty
                        </div>
                    </>
                )}

                {filter1 !== 'All' &&
                    filter1 !== '---' &&
                    filter1 !== ' ' &&
                    filter1 !== '' && (
                        <>
                            <div className='w-full col-span-full text-center text-xl lg:my-4 lg:text-2xl text-[#33110e]'>
                                {filter1}
                            </div>
                        </>
                    )}

                {filter1 === '---' && (
                    <div className='w-full col-span-full text-center text-xl lg:my-4 lg:text-2xl text-[#33110e]'>
                        Temporary Faculty
                    </div>
                )}

                <div className='z-10 flex justify-center items-center gap-2'>
                    <FilterOptions
                        filterName='Faculty'
                        setFilterValue={setFilter1}
                        options={options}
                    />
                    <Button className='mx-4' onClick={fetchData}>
                        Filter
                    </Button>
                </div>

                <div
                    id='facultyDataTable'
                    className='grid md:grid-cols-2 lg:grid-cols-4 m-7 md:px-10 place-items-center z-[-1]'
                >
                    {isLoading ? (
                        <div
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 9999,
                            }}
                        >
                            <CircularProgress color='inherit' />
                        </div>
                    ) : (
                        <>
                            {/* permanent faculty */}
                            <>
                                {facultyData
                                    .filter(
                                        (facultyCard) =>
                                            filter1 !== '---' &&
                                            facultyCard.position !== '---',
                                    )
                                    .map((facultyCard, index) => (
                                        <div key={index}>
                                            <FacultyCards
                                            uniqueFacultyId={facultyCard.uniqueFacultyId}
                                                name={facultyCard.name}
                                                position={facultyCard.position}
                                                contact={facultyCard.phone_no}
                                                email={facultyCard.email}
                                                photo={facultyCard.photo}
                                                portfolio={
                                                    facultyCard.portfolio
                                                }
                                                researchInterest={
                                                    facultyCard.researchInterest
                                                }
                                            />
                                        </div>
                                    ))}
                            </>

                            {/* guest faculty */}
                            <>
                                {facultyData
                                    .filter(
                                        (facultyCard) =>
                                            filter1 === '---' ||
                                            facultyCard.position === '---',
                                    )
                                    .map((facultyCard, index) => (
                                        <div key={index}>
                                            <FacultyCards
                                            uniqueFacultyId={facultyCard.uniqueFacultyId}
                                                name={facultyCard.name}
                                                position={'Temporary Faculty'}
                                                contact={facultyCard.phone_no}
                                                email={facultyCard.email}
                                                photo={facultyCard.photo}
                                                portfolio={
                                                    facultyCard.portfolio
                                                }
                                                researchInterest={
                                                    facultyCard.researchInterest
                                                }
                                            />
                                        </div>
                                    ))}
                            </>
                        </>
                    )}
                </div>
            </div>
        </>
    )
}

export default Page
