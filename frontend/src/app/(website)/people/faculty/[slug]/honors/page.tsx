'use client'
import React, { useEffect, useState } from 'react'
import { MdDelete, MdModeEdit } from 'react-icons/md'
import HonorsUpdateModal from '@/components/admin-components/updateModals/honorsUpdateModal'
import axios from 'axios'
import toast from 'react-hot-toast'
import AdminModalHonors from '@/components/admin-components/Modals/adminModalHonors'
import { set } from 'react-datepicker/dist/date_utils'

const HonorsAdmin: React.FC = () => {

    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [data, setData] = useState([])
    const [initialData, setInitialData] = useState({})
    const [headers, setHeaders] = useState({})
    const [username, setUsername] = useState('')
    const [userId, setUserId] = useState('')

    useEffect(() => {
        // Read from sessionStorage after component mounts
        setUsername(sessionStorage.getItem('facultyName') || '')
        setUserId(sessionStorage.getItem('facultyId') || '')
    }, []) // Empty dependency array ensures this runs only on mount

    useEffect(() => {
        // Check if we are running on the client side
        if (typeof window !== 'undefined') {
            const token = sessionStorage.getItem('auth')
            setHeaders({
                Authorization: `Bearer ${
                    sessionStorage.getItem('access_token') as string
                }`,
            })
        }
    }, [])
    const fetchData = () => {
        const urlWithParams = `${
            process.env.NEXT_PUBLIC_API_URL
        }/honor/get?facultyId=${userId}`

        axios
            .get(urlWithParams)
            .then((response) => {
                
                setData(response.data.data)
            })
            .catch((error) => {
                console.error('Error fetching data:', error)
            })
    }
    
     useEffect(() => {
            if (username !== '') {
                fetchData()
            }
        }, [username])

    return (
        <>
            <Table
                
                data={data}
                setData={setData}
                setIsModalOpen={setIsModalOpen}
                fetchdata={fetchData}
            />
        </>
    )
}

function Table({  data, setData, setIsModalOpen ,fetchdata}) {
    function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
        const searchTerm = e.target.value.toLowerCase()
        if (searchTerm === '') {
            // Reset to initial data if search term is empty
            fetchdata()
        } else {
            setData((prevData) =>
                prevData.filter(
                    (honors) =>
                        honors.title.toLowerCase().includes(searchTerm) ||
                        honors.givenBy.toLowerCase().includes(searchTerm) ||
                        honors.year.toLowerCase().includes(searchTerm),
                ),
            )
        }
    }

    return (
        <div className='h-[80vh] w-full overflow-y-auto'>
            <div className='flex justify-between items-center border-b-2 p-4'>
                <h1 className='font-semibold text-2xl'>Honors</h1>
                
            </div>

            
            <div className='font-sans relative'>
                <div className='overflow-x-auto border rounded my-2 lg:mx-8'>
                    <table className='border-1 rounded border border-solid border-[#dde2e6] w-full'>
                        <thead>
                            <tr className='text-lg bg-[#f7dcdd]'>
                                <th className='p-2 text-center bg-[#272e3f] text-[#fff] border border-[#dde2e6] w-1/12'>
                                    Sr.No
                                </th>
                                <th className='p-2 text-center bg-[#272e3f] text-[#fff] max-w-[200px] border border-[#dde2e6]'>
                                    Title
                                </th>
                                <th className='p-2 text-center bg-[#272e3f] text-[#fff] border border-[#dde2e6] w-1/12'>
                                    Given By
                                </th>
                                <th className='p-2 text-center bg-[#272e3f] text-[#fff] border border-[#dde2e6] w-1/12'>
                                    Year
                                </th>
                                
                            </tr>
                        </thead>
                        <tbody>
                            {data.length > 0 ? (
                                data.map((data, index) => (
                                    <tr
                                        key={index}
                                        className={
                                            index % 2 ? 'bg-gray-300' : ''
                                        }
                                    >
                                        <td className='p-2 text-center border-b border-r border-l border-black'>
                                            {index + 1}
                                        </td>
                                        <td className='p-2 text-center border-b border-r border-l border-black'>
                                            {data.title}
                                        </td>
                                        <td className='p-2 text-center border-b border-r border-l border-black'>
                                            {data.givenBy}
                                        </td>
                                        <td className='p-2 text-center border-b border-r border-l border-black'>
                                            {data.year}
                                        </td>

                                        
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className='p-4 text-center' colSpan={3}>
                                        No data
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default HonorsAdmin
