//@ts-nocheck
'use client'
import React, { useEffect, useState } from 'react'
import ExportCSV from '@/components/admin-components/exportCSV'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import FilterOptions from '@/components/people-components/filterOptions'
import { CircularProgress } from '@mui/material'
import { Button } from '@/components/ui/button'
type Props = {}
const options1 = [
    { value: ' ', title: 'All' },
    { value: '2024', title: '2024' },
    { value: '2023', title: '2023' },
    {
        value: '2022',
        title: '2022',
    },
    {
        value: '2021',
        title: '2021',
    },
]
const options2 = [
    { value: ' ', title: 'All' },
    { value: 'January', title: 'January' },
    { value: 'February', title: 'February' },
    {
        value: 'March',
        title: 'March',
    },
    {
        value: 'june',
        title: 'june',
    },
]

const navMenu = [
    {
        title: 'Office Notices',
    },
    {
        title: 'Faculty Data',
    },
    {
        title: 'Research Data',
    },
]
const InputField = ({ label, value, onChange }) => (
    <div className='flex items-center my-2'>
        <label className='text-lg mr-2'>{label}:</label>
        <input
            type='text'
            className='border rounded px-2 py-1 flex-1'
            value={value}
            onChange={onChange}
        />
    </div>
)
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
]

export default function OfficeData({}: Props) {
    const [selectedState, setSelectedState] = useState('Achievements')
    const [facultyData, setFacultyData] = useState<FacultyCard[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filter1, setFilter1] = useState([])
    const [filter2, setFilter2] = useState([])
    const [filter3, setFilter3] = useState<string>('')
    const [data, setData] = useState([])
    const [headers, setHeaders] = useState({})

    useEffect(() => {
        // Check if we are running on the client side
        if (typeof window !== 'undefined') {
            const token = sessionStorage.getItem('auth')
            setHeaders({
                                   Authorization: `Bearer ${sessionStorage.getItem("access_token") as string}`,
            })
        }
    }, [])
    const fetchData = async () => {
        setIsLoading(true)
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/private/announcement/get?searchTerm=${searchTerm}`,
                { headers: headers },
            )
            console.log('response is:', response)
            setData(response.data.data)
        } catch (error) {
            console.error('Error fetching announcements:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchFacultyData = () => {
        setIsLoading(true)
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/faculty/get?position=${filter3}`

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
    useEffect(() => {
        fetchData()
        fetchFacultyData()
    }, [])
    return (
        <div className=' h-[92vh] '>
            <div className='grid place-items-start border-b-2 p-4'>
                <h1 className='font-semibold text-2xl'>
                    News and Events Page{' '}
                </h1>
            </div>
            <div className='flex h-full '>
                <div className='w-[20%] p-4  flex items-center flex-col border-r-2 hover:cursor-pointer'>
                    <div className=' flex flex-col  text-center '>
                        {navMenu.map((item) => {
                            return (
                                <span
                                    key={item.title}
                                    className={`px-3 my-1 rounded hover:[#d6d5d9] ${
                                        selectedState === item.title
                                            ? 'bg-[#d6d5d9]  hover:bg-[#d6d5d9]'
                                            : ''
                                    }`}
                                    onClick={() => setSelectedState(item.title)}
                                >
                                    {item.title}
                                </span>
                            )
                        })}
                    </div>
                </div>{' '}
                <div className='w-[80%] p-4'>
                    {selectedState === 'Office Notices' && (
                        <div
                            className='gap-2 w-full  overflow-y-scroll'
                            id='achievementSection'
                        >
                            <div className='grid grid-cols-[1fr] grid-rows-[45px] m-12 place-content-center p-0 box-border mt-3 mb-3 gap-4 overflow-hidden'>
                                <h3 className='text-center text-2xl  lg:text-3xl  font-semibold '>
                                    Office Notices
                                </h3>
                                <div className='  flex  justify-center items-center gap-2'>
                                    <Input
                                        type='text'
                                        className=' lg:w-[230px] '
                                        placeholder='Search by title...'
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                    />
                                    <FilterOptions
                                        filterName='Select Year'
                                        //@ts-ignore
                                        setFilterValue={setFilter1}
                                        options={options1}
                                    />
                                    <FilterOptions
                                        filterName='Select Month'
                                        //@ts-ignore
                                        setFilterValue={setFilter2}
                                        options={options2}
                                    />
                                    <Button
                                        className='mx-4'
                                        onClick={fetchData}
                                    >
                                        Filter
                                    </Button>
                                </div>
                                <div className='overflow-x-auto'>
                                    {isLoading ? (
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                minHeight: '300px', // Adjust height as needed
                                            }}
                                        >
                                            <CircularProgress color='inherit' />
                                        </div>
                                    ) : (
                                        <Table data={data} />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    {selectedState === 'Faculty Data' && (
                        <div
                            className='gap-2 w-full  overflow-y-scroll'
                            id='achievementSection'
                        >
                            <div className='grid grid-cols-[1fr] grid-rows-[45px] m-12 place-content-center p-0 box-border mt-3 mb-3 gap-4 overflow-hidden'>
                                <h3 className='text-center text-2xl  lg:text-3xl  font-semibold '>
                                    Faculty Data
                                </h3>
                                <div className='  flex  justify-center items-center gap-2'>
                                    {/* <Input
                                        type='text'
                                        className=' lg:w-[230px] '
                                        placeholder='Search by title...'
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                    /> */}
                                    {/* <FilterOptions
                                        filterName='Select Year'
                                        //@ts-ignore
                                        setFilterValue={setFilter1}
                                        options={options1}
                                    /> */}
                                    <FilterOptions
                                        filterName='Select Position'
                                        setFilterValue={setFilter3}
                                        options={options}
                                    />
                                    <Button
                                        className='mx-4'
                                        onClick={fetchFacultyData}
                                    >
                                        Filter
                                    </Button>
                                </div>
                                <div className='overflow-x-auto'>
                                    {isLoading ? (
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                minHeight: '300px', // Adjust height as needed
                                            }}
                                        >
                                            <CircularProgress color='inherit' />
                                        </div>
                                    ) : (
                                        <FacultyTable data={facultyData} />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
function Table({ data }) {
    return (
        <div className='font-sans'>
            <div className='border rounded  my-2 lg:mx-8'>
                <table className='border-1 border-l border-r border-solid border-black w-full'>
                    <thead>
                        <tr>
                            <th className='text-nowrap  p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff]'>
                                Sr. No.
                            </th>
                            <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] max-w-[200px] text-[#fff]'>
                                Announcements
                            </th>
                            <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff]'>
                                Date
                            </th>
                            <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff] '>
                                View
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data &&
                            data.map((item, index) => (
                                <tr key={item.id}>
                                    <td className='p-2 text-center border-b border-r border-1 border-solid border-black'>
                                        {index + 1}
                                    </td>
                                    <td className='p-2 text-left text-blue-800 border-b border-1 border-solid border-black text-lg'>
                                        {item.title}
                                    </td>
                                    <td className='p-2 text-center text-nowrap border-b border-l border-1 border-solid border-black'>
                                        16-04-2024
                                    </td>
                                    <td className='p-2 text-center border-b border-l border-1 border-solid border-black'>
                                        <a href={item.link} target='_blank'>
                                            <button className='font-medium text-nowrap p-2 text-center bg-green-600 text-[#fff] border border-1 place-content-center justify-center border-[#dde2e6] rounded-md pl-4 pr-4'>
                                                view pdf
                                            </button>
                                        </a>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function FacultyTable({ data }) {
    return (
        <div className='font-sans'>
            <div className='border rounded my-2 lg:mx-8'>
                <table className='border-1 border-l border-r border-solid border-black w-full'>
                    <thead>
                        <tr>
                            <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff]'>
                                Sr. No.
                            </th>
                            <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] max-w-[200px] text-[#fff]'>
                                Faculty
                            </th>
                            <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff]'>
                                Faculty Id
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data &&
                            data.map((item, index) => (
                                <tr key={item.id}>
                                    <td className='p-2 text-center border-b border-r border-1 border-solid border-black'>
                                        {index + 1}
                                    </td>
                                    <td className='p-2 text-left text-blue-800 border-b border-1 border-solid border-black text-lg'>
                                        {item.name}
                                    </td>
                                    <td className='p-2 text-center text-nowrap border-b border-l border-1 border-solid border-black'>
                                        {item.uniqueFacultyId}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
