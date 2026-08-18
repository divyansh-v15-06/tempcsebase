'use client'
import React, { useEffect, useState } from 'react'
import { MdDelete, MdModeEdit } from 'react-icons/md'
import InternationalNationalUpdateModal from '@/components/admin-components/updateModals/international&nationalExposureUpdateModal'
import axios from 'axios'
import toast from 'react-hot-toast'
import AdminTeachingExpModal from '@/components/admin-components/Modals/adminteachingExp'
import TeachingExpUpdateModal from '@/components/admin-components/updateModals/teachingExpUpdateModal'

const AdminteachingExperience: React.FC = () => {
    const [initialData, setInitialData] = useState({})
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [data, setData] = useState([])
    const [headers, setHeaders] = useState({})
    const [username, setUsername] = useState('')
    const [userId, setUserId] = useState('')

    useEffect(() => {
        // Read from sessionStorage after component mounts
        setUsername(sessionStorage.getItem('facultyName') || '')
        setUserId(sessionStorage.getItem('userId') || '')
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
        }/teachingExp/get?facultyId=${userId}`

        axios
            .get(urlWithParams)
            .then((response) => {
                setData(response.data.data)
            })
            .catch((error) => {
                console.error('Error fetching data:', error)
            })
    }

    function handleClose() {
        setIsUpdateModalOpen(false)
    }

    function handleDelete(id) {
        const userConfirmed = window.confirm(
            'Are you sure you want to delete this ? This action cannot be undone.',
        )
        if (!userConfirmed) {
            return // Exit if the user cancels
        }

        axios
            .delete(
                `${process.env.NEXT_PUBLIC_API_URL}/teachingExp/delete/${id}`,
                {
                    headers,
                },
            )
            .then((response) => {
                toast.success('teachingExp deleted successfully')
                fetchData()
            })
            .catch((error) => {
                toast.error('teachingExp deleting Honors')
                console.error(error)
            })
    }

    function handleUpdate(item) {
        // setInitialData(item)
        setIsUpdateModalOpen(true)
        setInitialData(item)
    }

    const handleUpdateSubmit = async (formData,id) => {
        axios
            .patch(
                `${process.env.NEXT_PUBLIC_API_URL}/teachingExp/update/${id}`,
                formData,
                {
                    headers,
                },
            )
            .then((response) => {
                toast.success('teachingExp added successfully')
                fetchData()
                setIsModalOpen(false)
            })
            .catch((error) => {
                toast.error('Error adding exposure ')
                console.error(error)
            })
    }
    

    const handleAddSubmit = async (formData) => {
        axios
        .post(
            `${process.env.NEXT_PUBLIC_API_URL}/teachingExp`,
            formData,
            {
                headers,
            },
        )
        .then((response) => {
            toast.success(' exposure added successfully')
            fetchData()
            setIsModalOpen(false)
        })
        .catch((error) => {
            toast.error('Error adding exposure')
            console.error(error)
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
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                data={data}
                setData={setData}
                setIsModalOpen={setIsModalOpen}
                fetchData={fetchData}
            />
            <AdminTeachingExpModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddSubmit}
                initialData={undefined}
            />

            <TeachingExpUpdateModal
                isOpen={isUpdateModalOpen}
                onClose={handleClose}
                onSubmit={handleUpdateSubmit}
                initialData={initialData} // New prop to provide initial values
            />
        </>
    )
}

function Table({ onUpdate, onDelete, data, setData, setIsModalOpen,fetchData }) {
    function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
        const searchTerm = e.target.value.toLowerCase()
        if (searchTerm === '') {
            // Reset to initial data if search term is empty
            fetchData()
        } else {
            setData((prevData) =>
                prevData.filter(
                    (international) =>
                        international.title
                            .toLowerCase()
                            .includes(searchTerm) ||
                        international.description
                            .toLowerCase()
                            .includes(searchTerm),
                ),
            )
        }
    }

    return (
        <div className='h-[92vh]'>
            <div className='flex justify-between items-center border-b-2 p-4'>
                <h1 className='font-semibold text-2xl'>
                Teaching Experience
                </h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className='bg-slate-950 text-white border-3 border rounded-3xl px-4 py-2'
                >
                    Add Teaching Experience
                </button>
            </div>

            <div className='flex justify-end p-1 lg:mx-8'>
                <input
                    type='text'
                    placeholder='Search'
                    className='p-2 border rounded w-full max-w-md border border-solid border-[#272e3f]'
                    onChange={handleSearch}
                />
            </div>
            <div className='font-sans relative'>
                <div className='overflow-x-auto border rounded my-2 lg:mx-8'>
                    <table className='border-1 rounded border border-solid border-[#dde2e6] w-full'>
                        <thead>
                            <tr className='text-lg bg-[#f7dcdd]'>
                                <th className='p-2 text-center bg-[#272e3f] text-[#fff] border border-[#dde2e6] w-1/12'>
                                    Sr.No
                                </th>
                                <th className='p-2 text-center bg-[#272e3f] text-[#fff] max-w-[100px] border border-[#dde2e6]'>
                                    Position
                                </th>
                                <th className='p-2 text-center bg-[#272e3f] text-[#fff] border border-[#dde2e6] max-w-[150px] '>
                                    Department
                                </th>
                                <th className='p-2 text-center bg-[#272e3f] text-[#fff] border border-[#dde2e6] max-w-[150px] '>
                                    From
                                </th>
                                <th className='p-2 text-center bg-[#272e3f] text-[#fff] border border-[#dde2e6] max-w-[150px] '>
                                    To
                                </th>
                                <th className='p-2 text-center bg-[#272e3f] text-[#fff] border border-[#dde2e6] max-w-[150px] '>
                                    Time Period
                                </th>

                                <th className='p-2 text-center bg-[#272e3f] text-[#fff] border border-[#dde2e6]'>
                                    Actions
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
                                            {data.position}
                                        </td>
                                        <td className='p-2 text-center border-b border-r border-l border-black'>
                                            {data.department}
                                        </td>
                                        <td className='p-2 text-center border-b border-r border-l border-black'>
                                            {new Date(data.from).toLocaleDateString(
                                                'en-GB')}
                                        </td>
                                        <td className='p-2 text-center border-b border-r border-l border-black'>
                                            {data.to==='Present'?"Present":new Date(data.to).toLocaleDateString(
                                                'en-GB')}
                                        </td>
                                        <td className='p-2 text-center border-b border-r border-l border-black'>
                                            {
                                                calculateYearsAndMonths(data.from, data.to)  
                                            }
                                        </td>

                                        <td className='p-2 text-left border border-black'>
                                            <div className='flex justify-center gap-2'>
                                                <button
                                                    onClick={() => onDelete(data.id)}
                                                    className='p-2 bg-red-500 text-white rounded'
                                                >
                                                    <MdDelete />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        onUpdate(data)
                                                    }
                                                    className='p-2 bg-[#10132b] text-white rounded'
                                                >
                                                    <MdModeEdit />
                                                </button>
                                            </div>
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
function calculateYearsAndMonths(fromDate, toDate) {
    const from = new Date(fromDate);
    const to = toDate === "Present" ? new Date() : new Date(toDate);
  
    let years = to.getFullYear() - from.getFullYear();
    let months = to.getMonth() - from.getMonth();
  
    if (months < 0) {
      years--;
      months += 12;
    }
  
    let result = "";
    if (years > 0) {
      result += years + (years === 1 ? " Year" : " Years");
    }
    if (months > 0) {
      if (result !== "") {
        result += ", ";
      }
      result += months + (months === 1 ? " Month" : " Months");
    }
  
    return result || "0 Months";
  }

export default AdminteachingExperience
