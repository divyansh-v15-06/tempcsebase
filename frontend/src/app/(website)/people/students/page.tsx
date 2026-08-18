'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import FilterOptions from '@/components/people-components/filterOptions'
import StudentCards from '@/components/people-components/StudentCards'
import { Button } from '@/components/ui/button'
import CircularProgress from '@mui/material/CircularProgress'
import Calendar from 'react-calendar'
const api = process.env.NEXT_PUBLIC_API_URL

type RouterParams = {
    slug: string
}

type Props = {
    params: RouterParams
}

interface StudentData {
    name: string
    rollno: string
    email: string
}

interface Option {
    value: string
    title: string
}

const programOptions = [
    { value: ' ', title: 'All' },
    { value: '1', title: 'B.Tech' },
    { value: '2', title: 'M.Tech (CSE)' },
    { value: '3', title: 'Dual Degree' },
    { value: '4', title: 'M.Tech (AI)' },
]

const Page: React.FC<Props> = ({ params }) => {
    const [studentsData, setStudentsData] = useState<StudentData[]>([])
    const [SemId, setSemId] = useState<string>('')
    const [programId, setProgramId] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [SemOptions, setSemOptions] = useState<Option[]>([
        { value: ' ', title: 'All' },
    ])

    const fetchSemData = (selectedProgramId: string) => {
        setIsLoading(true)
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/student/getSem/${selectedProgramId || '1'}`
        axios
            .get(urlWithParams)
            .then((response) => {
                console.log(response);
                
                const fetchedSemOptions = response.data.data.map(
                    (Sem: { id: string; Sem: string }) => ({
                        
                        value: Sem,
                        title: Sem,
                    }),
                )
                console.log('Year data fetched successfully:', fetchedSemOptions);
                
                setSemOptions([
                    { value: ' ', title: 'All' },
                    ...fetchedSemOptions,
                ])
            })
            .catch((error) => {
                console.error('Error fetching Sem data:', error)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    useEffect(() => {
        fetchSemData(programId)
    }, [programId])

    const fetchStudentsData = () => {
        setIsLoading(true)
    
        const Sem = SemId ? String(SemId).trim() : ''
        const program = programId ? String(programId).trim() : ''
    
        // Specify queryParams as an array of strings
        const queryParams: string[] = []
        if (Sem) queryParams.push(`Sem=${Sem}`)
        if (program) queryParams.push(`programmEnroled=${program}`)
        
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/student/get${queryParams.length ? '?' + queryParams.join('&') : ''}`
        
        console.log("SemId || programId ", Sem || program)
        console.log("the url params is ", urlWithParams)
        
        axios
            .get(urlWithParams)
            .then((response) => {
                console.log('Student data fetched successfully:', response.data)
                setStudentsData(response.data.data)
            })
            .catch((error) => {
                console.error('Error fetching students data:', error)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }
    
    
    

    useEffect(() => {
        fetchStudentsData()
    }, [])

    return (
        <>
            <div id='peoplesPage' className='my-4 min-h-[50vh]'>
                <div className='text-center text-2xl lg:my-4 lg:text-3xl font-bold'>
                    Students
                </div>
                <div className='flex flex-col my-12 mx-2 md:mx-6 place-content-center p-0 mt-3 mb-3 gap-4'>
                    <div className='flex flex-col lg:flex-row justify-center items-center gap-2'>
                        <FilterOptions
                            filterName='Select Course'
                            setFilterValue={setProgramId}
                            options={programOptions}
                        />
                        <FilterOptions
                            filterName='Select Current Semester'
                            setFilterValue={setSemId}
                            options={SemOptions}
                        />
                        <Button className='mx-4' onClick={fetchStudentsData}>
                            Filter
                        </Button>
                    </div>
                    <div
                        id='studentsDataTable'
                        className='flex flex-wrap justify-center w-full items-center'
                    >
                        {isLoading ? (
                            <p>Loading...</p>
                        ) : (
                            //@ts-ignore
                            <StudentCards studentData={studentsData} />
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Page
