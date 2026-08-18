'use client'
import FilterOptions from '@/components/people-components/filterOptions'
import { Button } from '@/components/ui/button'
import axios from 'axios'
import { useEffect, useState } from 'react'
import CircularProgress from '@mui/material/CircularProgress'

const options = [
    { value: ' ', title: 'All' },
    { value: 'Professor', title: '1' },
    { value: 'Associate Professor', title: '2' },
    {
        value: 'Assistant Professor Grade-I',
        title: '3',
    },
    {
        value: 'Assistant Professor Grade-II',
        title: '4',
    },
]
export default function Announcements() {
    const [data, setData] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/public/announcement/get`,
                )
                console.log('response is:', response)
                setData(response.data.data)
            } catch (error) {
                console.error('Error fetching announcements:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    return (
        <div className='grid grid-cols-[1fr] grid-rows-[45px] mx-2 md:m-12 place-content-center p-0 box-border mt-3 mb-3 gap-4 overflow-hidden'>
            <h3 className='text-center text-2xl  lg:text-3xl  font-semibold '>
                Announcements
            </h3>
            {/* <div className='  flex  justify-center items-center gap-2'>
                <FilterOptions
                    filterName='Select Type'
                    //@ts-ignore
                    setFilterValue={setData}
                    options={options}
                />

                <Button className='mx-4'>Filter</Button>
            </div> */}
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
    )
}

function Table({ data }) {
    return (
        <div className='font-sans'>
            <div className='border rounded  my-2 lg:mx-8'>
                <table className='border-1 border-l border-r border-solid border-black w-full'>
                    <thead>
                        <tr>
                            <th className='text-nowrap  p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff] w-1/12'>
                                Sr. No.
                            </th>
                            <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] max-w-[200px] text-[#fff]'>
                                Announcement Details
                            </th>
                            <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff] w-1/12'>
                                Date
                            </th>
                            <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff] w-1/12'>
                                View
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr
                                key={item.id}
                                className={index % 2 ? 'bg-gray-300' : ''}
                            >
                                <td className='p-2 text-center border-b border-r border-1 border-solid border-black'>
                                    {index + 1}
                                </td>
                                <td className='p-2 text-left text-blue-800 border-b border-1 border-solid border-black text-lg'>
                                    {item.title}
                                </td>
                                <td className='p-2 text-center text-nowrap border-b border-l border-1 border-solid border-black'>
                                    {new Date(item.date).toLocaleDateString('en-GB')}
                                </td>
                                <td className='p-2 text-center border-b border-l border-1 border-solid border-black'>
                                    <a href={item.pdfLink} target='_blank'>
                                        <button className='font-medium text-nowrap p-2 text-center bg-green-600 text-[#fff] border border-1 place-content-center justify-center border-[#dde2e6] rounded-md pl-4 pr-4'>
                                            View
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
