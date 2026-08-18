'use client'
import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { useParams } from 'next/navigation'
import Link from 'next/link'

type Props = {}

export interface IFacultyInfo {
    details?: string
    dateOfBirth: string
    dateOfJoining: string
    phone: string
    educationalQualification: string
    teachingExperience: string
    administrativeExperience: string
    googleScholar: string
    linkedIn?: string
    rgLink?: string
    publons?: string
    orcid?: string
    vidwan?: string
    researchGate?: string
    scopus?: string
}

export default function ProjectsAdmin({ }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [headers, setHeaders] = useState({})
    const [isDataPresent, setIsDataPresent] = useState<boolean>(false)
    const [facultyInfo, setFacultyInfo] = useState<IFacultyInfo>({
        details: '',
        dateOfBirth: '',
        dateOfJoining: '',
        phone: '',
        educationalQualification: '',
        teachingExperience: '',
        administrativeExperience: '',
        googleScholar: '',
        linkedIn: '',
        rgLink: '',
        publons: '',
        orcid: '',
        vidwan: '',
        researchGate: '',
        scopus: '',
    })
    const [teaching, setTeaching] = useState([])

    const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false)
     const params = useParams()
            const userId = params.slug

    useEffect(() => {
        // Check if we are running on the client side
        if (typeof window !== 'undefined') {
            const token = sessionStorage.getItem('auth')
            setHeaders({
                Authorization: `Bearer ${sessionStorage.getItem('access_token') as string}`,
            })
        }
    }, [])
    

    const isAnyFieldPresent = (data: IFacultyInfo) => {
        return Object.values(data).some((value) => value !== '')
    }
    
    
    const fetchTeachingExp = () => {
        
        const urlWithParams = `${
            process.env.NEXT_PUBLIC_API_URL
        }/teachingExp/get?facultyId=${userId}`

        axios
            .get(urlWithParams)
            .then((response) => {
                setFacultyInfo((prev) => ({
                    ...prev,
                    teachingExperience: calculateNetYearsAndMonths(response.data.data),
                  }));

            })
            .catch((error) => {
                console.error('Error fetching data:', error)
            })
    }
    
    const fetchhighestqualification = () => {
        
        const urlWithParams = `${
            process.env.NEXT_PUBLIC_API_URL
        }/qualification/highest/get?facultyId=${userId}`

        axios
            .get(urlWithParams)
            .then((response) => {
                setFacultyInfo((prev) => ({
                    ...prev,
                    educationalQualification: response.data.data?.nameOfDegree||"",
                  }));

            })
            .catch((error) => {
                console.error('Error fetching data:', error)
            })
    }
    function calculateNetYearsAndMonths(intervals) {
        let totalMonths = 0;
      
        for (const interval of intervals) {
          const fromDate = new Date(interval.from);
          const toDate = interval.to === "Present" ? new Date() : new Date(interval.to);
      
          let years = toDate.getFullYear() - fromDate.getFullYear();
          let months = toDate.getMonth() - fromDate.getMonth();
          
      
          if (months < 0) {
            years--;
            months += 12;
          }
      
          totalMonths += (years * 12) + months;
        }
      
        const netYears = Math.floor(totalMonths / 12);
        const netMonths = totalMonths % 12;
      
        let result = "";
        if (netYears > 0) {
          result += netYears + (netYears === 1 ? " Year" : " Years");
        }
        if (netMonths > 0) {
          if (result !== "") {
            result += ", ";
          }
          result += netMonths + (netMonths === 1 ? " Month" : " Months");
        }
      
        return result || "0 Months";
      }


    const fetchData = async () => {
        
        setIsLoading(true)
        // userId is undefined here so using it from sessionStorage
        
        const url = `${process.env.NEXT_PUBLIC_API_URL}/facultyInfo/get/${userId}`
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            const { data } = await response.json()
            setFacultyInfo((prevInfo) => ({
                ...prevInfo,
                details: `${data?.faculty?.name}, ${data?.faculty?.position}`,
                dateOfBirth: data?.dateOfBirth,
                dateOfJoining: data?.dateOfJoining,
                googleScholar: data?.googleScholar,
                scopus: data?.scopus,
                publons: data?.publons,
                orcid: data?.orcid,
                researchGate: data?.researchGate,
                vidwan: data?.vidwan,
                phone: data?.faculty?.phoneNo,
                linkedIn: data?.linkedIn,
                rgLink: data?.rgLink,
            }))
            setIsLoading(false)
        } catch (error) {
            console.error('Error fetching faculty info:', error)
            setIsLoading(false)
        }
    }
    useEffect(() => {
        fetchData()
        fetchTeachingExp()
        fetchhighestqualification()
    }, [])

    useEffect(() => {
        if (isAnyFieldPresent(facultyInfo)) {
            setIsDataPresent(true)
        } else {
            setIsDataPresent(false)
        }
    }, [facultyInfo])

    console.log(facultyInfo, 'facultyInfo')

    const toggleUpdateModal = () => {
        setShowUpdateModal((prev) => !prev)
    }


    const facultyFields = [
        { label: 'Details', key: 'details' },
        { label: 'Date of Birth', key: 'dateOfBirth' },
        { label: 'Date of Joining', key: 'dateOfJoining' },
        { label: 'Phone', key: 'phone' },
        { label: 'Educational Qualification', key: 'educationalQualification' },
        { label: 'Teaching Experience', key: 'teachingExperience' },
    ]

    return (
        <div className='h-[80vh] w-full'>
            <Toaster />
            

            <div className='flex h-full w-full mt-2 '>
                <div className='w-full flex justify-between '>
                    <img
                        src='/nithbg12.jpg'
                        alt='My Image'
                        className='h-auto max-w-full ms-auto align-middle  rounded-md shadow-lg '
                    />

                    <div className='p-4 max-w-2xl mx-auto bg-white shadow-md rounded-md'>
                        <h1 className='text-xl font-bold mb-4'>
                            Faculty Information
                        </h1>
                        <div className='space-y-2'>
                            {facultyFields.map((field) => (
                                <div
                                    key={field.key}
                                    className='flex items-start'
                                >
                                    <span className='font-semibold w-1/3'>
                                        {field.label}:
                                    </span>
                                    <span className='w-2/3'>
                                        {/*  @ts-ignore */}
                                        {field.isLink ? (
                                            <a
                                                href={facultyInfo[field.key]}
                                                target='_blank'
                                                rel='noopener noreferrer'
                                                className='text-blue-500 underline'
                                            >
                                                {facultyInfo[field.key]}
                                            </a>
                                        ) : (
                                            facultyInfo[field.key] ||
                                            'Not Updated'
                                        )}
                                    </span>
                                </div>
                            ))}
                            {/* <div className='flex justify-left gap-5 pt-4'>
                                <td className='pl-5 pb-5'>
                                    <Link href={facultyInfo.googleScholar}>
                                        <svg
                                            xmlns='http://www.w3.org/2000/svg'
                                            x='0px'
                                            y='0px'
                                            width='25'
                                            height='25'
                                            viewBox='0 0 50 50'
                                        >
                                            <path d='M 25 2 C 12.309534 2 2 12.309534 2 25 C 2 37.690466 12.309534 48 25 48 C 37.690466 48 48 37.690466 48 25 C 48 12.309534 37.690466 2 25 2 z M 25 4 C 36.609534 4 46 13.390466 46 25 C 46 36.609534 36.609534 46 25 46 C 13.390466 46 4 36.609534 4 25 C 4 13.390466 13.390466 4 25 4 z M 21 11 L 11 20 L 17.78125 20 C 17.80125 22.847 19.967531 25.730469 23.769531 25.730469 C 24.129531 25.730469 24.529688 25.690391 24.929688 25.650391 C 24.749688 26.100391 24.560547 26.470078 24.560547 27.080078 C 24.560547 28.230078 25.140391 28.920078 25.650391 29.580078 C 24.020391 29.690078 20.989766 29.879531 18.759766 31.269531 C 16.629766 32.559531 15.980469 34.43 15.980469 35.75 C 15.980469 38.47 18.500469 41 23.730469 41 C 29.930469 41 33.220703 37.510547 33.220703 34.060547 C 33.220703 31.530547 31.779453 30.279922 30.189453 28.919922 L 28.900391 27.890625 C 28.500391 27.570625 27.949219 27.120312 27.949219 26.320312 C 27.949219 25.510313 28.500703 24.989766 28.970703 24.509766 C 30.480703 23.309766 32 21.960234 32 19.240234 C 32 18.197234 31.756203 17.348391 31.408203 16.650391 L 35 13.570312 L 35 17.277344 C 34.405 17.623344 34 18.261 34 19 L 34 25 C 34 26.104 34.896 27 36 27 C 37.104 27 38 26.104 38 25 L 38 19 C 38 18.262 37.595 17.624344 37 17.277344 L 37 12 C 37 11.957 36.980609 11.920906 36.974609 11.878906 L 38 11 L 21 11 z M 24.269531 14.240234 C 27.269531 14.240234 28.820312 18.35 28.820312 21 C 28.820312 21.65 28.739922 22.819922 27.919922 23.669922 C 27.339922 24.259922 26.370938 24.699219 25.460938 24.699219 C 22.370938 24.699219 20.949219 20.620156 20.949219 18.160156 C 20.949219 17.210156 21.14 16.220938 21.75 15.460938 C 22.33 14.710938 23.339531 14.240234 24.269531 14.240234 z M 26.039062 30.609375 C 26.409063 30.609375 26.590859 30.610391 26.880859 30.650391 C 29.620859 32.630391 30.800781 33.620234 30.800781 35.490234 C 30.800781 37.760234 28.97 39.460938 25.5 39.460938 C 21.64 39.460938 19.160156 37.590469 19.160156 34.980469 C 19.160156 32.370469 21.459766 31.499219 22.259766 31.199219 C 23.769766 30.679219 25.719062 30.609375 26.039062 30.609375 z'></path>
                                        </svg>
                                    </Link>
                                </td>
                                <td>
                                    <Link
                                        href={
                                            (facultyInfo.linkedIn as string) ||
                                            'https://www.researchgate.net/profile/John_Doe'
                                        }
                                    >
                                        <svg
                                            xmlns='http://www.w3.org/2000/svg'
                                            x='0px'
                                            y='0px'
                                            width='25'
                                            height='25'
                                            viewBox='0 0 50 50'
                                        >
                                            <path d='M41,4H9C6.24,4,4,6.24,4,9v32c0,2.76,2.24,5,5,5h32c2.76,0,5-2.24,5-5V9C46,6.24,43.76,4,41,4z M17,20v19h-6V20H17z M11,14.47c0-1.4,1.2-2.47,3-2.47s2.93,1.07,3,2.47c0,1.4-1.12,2.53-3,2.53C12.2,17,11,15.87,11,14.47z M39,39h-6c0,0,0-9.26,0-10 c0-2-1-4-3.5-4.04h-0.08C27,24.96,26,27.02,26,29c0,0.91,0,10,0,10h-6V20h6v2.56c0,0,1.93-2.56,5.81-2.56 c3.97,0,7.19,2.73,7.19,8.26V39z'></path>
                                        </svg>
                                    </Link>
                                </td>
                                <td>
                                    <Link href={facultyInfo.scopus as string}>
                                        <svg
                                            xmlns='http://www.w3.org/2000/svg'
                                            width='25'
                                            height='25'
                                            viewBox='0 0 24 24'
                                        >
                                            <path
                                                fill='black'
                                                d='m24 19.059l-.14-1.777c-1.426.772-2.945 1.076-4.465 1.076c-3.319 0-5.96-2.782-5.96-6.475c0-3.903 2.595-6.31 5.633-6.31c1.917 0 3.39.303 4.792 1.075L24 4.895c-1.286-.608-2.337-.889-4.698-.889c-4.534 0-7.97 3.53-7.97 8.017c0 5.12 4.09 7.924 7.9 7.924c1.916 0 3.506-.257 4.768-.888m-14.954-3.46c0-2.22-1.964-3.225-3.857-4.347C3.716 10.364 2.15 9.756 2.15 8.12c0-1.215.889-2.548 2.642-2.548c1.519 0 2.57.234 3.903 1.029l.117-1.847c-1.239-.514-2.127-.748-4.137-.748C1.8 4.006.047 5.876.047 8.26s2.103 3.413 4.02 4.581c1.426.865 2.922 1.45 2.922 2.992c0 1.496-1.333 2.571-2.922 2.571c-1.566 0-2.594-.35-3.786-1.075L0 19.176c1.215.56 2.454.818 4.16.818c2.385 0 4.885-1.473 4.885-4.395z'
                                            />
                                        </svg>
                                    </Link>
                                </td>
                                <td>
                                    <Link href={facultyInfo.publons as string}>
                                        <svg
                                            xmlns='http://www.w3.org/2000/svg'
                                            width='25'
                                            height='25'
                                            viewBox='0 0 320 512'
                                        >
                                            <path
                                                fill='black'
                                                d='M282.067 122.981c-3.221-7.856-7.836-15.067-12.993-21.776c-12.29-15.522-28.523-28.691-47.878-33.997c-29.087-8.043-61.327-.414-85.05 17.843c-5.098 3.864-9.623 8.389-13.812 13.2c-2.006-10.384-2.628-21.005-4.98-31.31c-1.205-1.294-2.372-3.23-4.446-2.905c-5.158.1-9.948 2.272-14.643 4.19c-20.224 8.793-40.38 17.724-60.594 26.507c-2.135 1.017-4.803 1.542-6.167 3.667c-.445 2.846-.414 5.8-.03 8.656c1.226 2.805 4.278 4.088 6.76 5.6c6.52 3.666 13.546 6.678 19.266 11.61c5.138 4.228 7.854 10.73 8.32 17.27c.206 2.165.277 4.338.286 6.52c-.019 79.378.012 158.766-.019 238.144c-.513 10.029.14 20.146-1.472 30.095c-.83 4.683-3.517 9.92-8.635 10.848c-7.668.591-15.404-.287-23.06.395c-2.046.078-2.766 2.302-2.639 4.02c.02 4.565-.128 9.14.079 13.714c-.01 1.254 1.353 1.848 2.056 2.707c14.306-.374 28.603-1.413 42.909-1.58c27.347-.533 54.715-.05 82.015 1.6c2.144.01 5.523.039 5.996-2.677c.426-4.882.367-9.83.04-14.703c-.04-2.164-2.243-3.192-4.12-3.192c-5.909-.305-11.816-.038-17.725-.099c-3.437-.09-7.173.414-10.304-1.334c-3.122-1.897-4.21-5.691-5.05-9.021c-2.49-12.47-1.57-25.264-2.035-37.892c-.307-28.069-.73-56.14-.83-84.218c11.619 5.237 24.237 7.964 36.893 9.08c21.984 2.114 44.639-2.233 64.034-12.873c24.434-13.122 43.188-35.511 53.778-60.962c8.389-19.95 12.083-41.724 11.709-63.313c-.072-14.875-1.851-30.002-7.66-43.815zm-53.452 115.915c-4.357 15.523-13.18 30.856-27.794 38.682c-12.33 6.865-27.14 6.025-40.528 3.37c-10.394-2.057-19.829-7.4-27.784-14.268c-6.806-6.66-9.338-16.53-9.208-25.807c.13-40.41-.187-80.84.158-121.24c9.119-12.786 23.94-21.055 39.402-23.18c14.682-2.154 30.213 2.678 40.786 13.14c14.327 13.961 21.4 33.534 25.55 52.692c4.96 25.175 6.345 51.663-.582 76.61z'
                                            />
                                        </svg>
                                    </Link>
                                </td>
                                <td>
                                    <Link href={facultyInfo.orcid as string}>
                                        <svg
                                            xmlns='http://www.w3.org/2000/svg'
                                            width='25'
                                            height='25'
                                            viewBox='0 0 512 512'
                                        >
                                            <path
                                                fill='#000000'
                                                d='M294.8 188.2h-45.9V342h47.5c67.6 0 83.1-51.3 83.1-76.9 0-41.6-26.5-76.9-84.7-76.9zM256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm-80.8 360.8h-29.8v-207.5h29.8zm-14.9-231.1a19.6 19.6 0 1 1 19.6-19.6 19.6 19.6 0 0 1 -19.6 19.6zM300 369h-81V161.3h80.6c76.7 0 110.4 54.8 110.4 103.9C410 318.4 368.4 369 300 369z'
                                            />
                                        </svg>
                                    </Link>
                                </td>
                                <td>
                                    <Link href={facultyInfo.vidwan as string}>
                                        <h6 className=' font-semibold'>
                                            Vidwan Link
                                        </h6>
                                    </Link>
                                </td>
                                <td>
                                    <Link
                                        href={
                                            facultyInfo.rgLink ||
                                            'https://www.researchgate.net/profile/John_Doe'
                                        }
                                    >
                                        <h6 className=' font-semibold'>
                                            RG Link
                                        </h6>
                                    </Link>
                                </td>
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
