// @ts-nocheck
'use client'
import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { saveAs } from 'file-saver'
import { Button } from '@/components/ui/button'
import { MdCheck, MdDelete, MdModeEdit } from 'react-icons/md'
import { parse } from 'json2csv'
import Modal from '@/components/admin-components/Modals/adminModalFaculty'
import CSVUploadModal from '@/components/admin-components/Modals/adminCsvModal'
import AdminModalPhdScholar from '@/components/admin-components/Modals/adminModalPhdScholar'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import PhdUpdateModal from '@/components/admin-components/updateModals/phdUpdateModal'
import PhdUpdateStatusModal from '@/components/admin-components/updateModals/PhdpassingModal'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdminModalPhdPassedScholar from '@/components/admin-components/Modals/adminModalPhdPassed'
import UpdatePhdPassedScholar from '@/components/admin-components/updateModals/phdPassedUpdateModal'

type Props = {}

export default function PhDScholarsAdmin({ }: Props) {
    const [data, setData] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isModal2Open, setIsModal2Open] = useState(false)
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
    const [isUpdateModal2Open, setIsUpdateModal2Open] = useState(false)
    const [initialData, setInitialData] = useState({})
    const [initialDataStatus, setInitialDataStatus] = useState({})
    const [isCSVModalOpen, setIsCSVModalOpen] = useState(false)
    const [headers, setHeaders] = useState({})
    const tableRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = sessionStorage.getItem('auth')
            setHeaders({
                Authorization: `Bearer ${sessionStorage.getItem("access_token") as string}`,
            })
        }
    }, [])

    const fetchData = () => {
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/phdScholar/get`

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
        fetchData()
    }, [])

    const handleDelete = (id) => {

        const userConfirmed = window.confirm(
            'Are you sure you want to delete this ? This action cannot be undone.',
        )
        if (!userConfirmed) {
            return // Exit if the user cancels
        }

        axios
            .delete(
                `${process.env.NEXT_PUBLIC_API_URL}/phdScholar/delete/${id}`,
                {
                    headers,
                },
            )
            .then((response) => {
                toast.success('PhD Scholar deleted successfully')
                fetchData()
            })
            .catch((error) => {
                toast.error('Error deleting PhD Scholar')
                console.error(error)
            })
    }

    const handleUpdate = (id) => {
        const item = data.find((item) => item.id === id)
        setInitialData(item)
        setIsUpdateModalOpen(true)
    }
    const handleUpdate2 = (id) => {
        const item = data.find((item) => item.id === id)
        setInitialData(item)
        setIsUpdateModal2Open(true)
    }
    const handleChangeStatus = (item) => {
        setIsStatusModalOpen(true)
        setInitialDataStatus({ id: item.id })

    }
    const handleChangeStatusSubmit = (formdata, id) => {
        axios
            .patch(
                `${process.env.NEXT_PUBLIC_API_URL}/phdScholar/update/${id}`,
                {
                    ...formdata,
                    status: 'passed'
                },
                {
                    headers,
                },
            )
            .then((response) => {
                toast.success('PhD Scholar status changed successfully')
                fetchData()
            })
            .catch((error) => {
                toast.error('Error changing PhD Scholar status')
                console.error(error)
            })
    }

    const handleExportCSV = () => {
        const fields = [
            'id',
            'name',
            'email',
            'guide',
            'lastQualification',
            'link',
            'researchArea',
            'photo',
        ] // Add more fields as needed
        const opts = { fields }
        try {
            const csv = parse(data, opts)
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
            saveAs(blob, 'phd_scholars_data.csv')
        } catch (err) {
            console.error('Error exporting data to CSV:', err)
        }
    }

    const handleDownloadTemplate = () => {
        const inputFields =
            'time,email,name,lastQualification,guide,link,researchArea,photo'
        const fieldsArray = inputFields.split(',')

        const csvContent = fieldsArray.join(',') + '\n'
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        saveAs(blob, 'template.csv')
    }

    const handleExportPDF = () => {
        if (tableRef.current) {
            html2canvas(tableRef.current).then((canvas) => {
                const imgData = canvas.toDataURL('image/png')
                const pdf = new jsPDF('p', 'mm', 'a4')
                const imgProps = pdf.getImageProperties(imgData)
                const pdfWidth = pdf.internal.pageSize.getWidth()
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
                pdf.save('phd_scholars_data.pdf')
            })
        }
    }

    const handleModalSubmit = (formData) => {
        axios
            .post(`${process.env.NEXT_PUBLIC_API_URL}/phdScholar`, formData, {
                headers,
            })
            .then((response) => {
                toast.success('PhD Scholar added successfully')
                fetchData()
                setIsModalOpen(false)
            })
            .catch((error) => {
                toast.error('Error adding PhD Scholar')
                console.error(error)
            })
    }

    const handleCSVSubmit = ({ file, type }) => {
        const formData = new FormData()
        formData.append('avatar', file)

        axios
            .post(
                `${process.env.NEXT_PUBLIC_API_URL}/phdScholar/bulk`,
                formData,
                {
                    headers: {
                        ...headers,
                        'Content-Type': 'file',
                    },
                },
            )
            .then((response) => {
                toast.success('CSV uploaded successfully')
                fetchData()
                setIsCSVModalOpen(false)
            })
            .catch((error) => {
                toast.error('Error uploading CSV')
                console.error(error)
            })
    }
    const handleUpdateSubmit = (formData, id) => {
        axios
            .patch(
                `${process.env.NEXT_PUBLIC_API_URL}/phdScholar/update/${id}`,
                formData,
                {
                    headers,
                },
            )
            .then((response) => {
                toast.success('PhD Scholar updated successfully')
                fetchData()
                setIsUpdateModalOpen(false)
            })
            .catch((error) => {
                toast.error('Error updating PhD Scholar')
                console.error(error)
            })
    }


    return (
        <div className='h-[92vh]'>
            <Toaster />
            <Tabs defaultValue="pursuing" className="w-full">
            <div className='flex justify-between items-center border-b-2 p-4'>
                <h1 className='font-semibold text-2xl'>PhD Scholars Page</h1>
                <div className='flex justify-center gap-8 '>

                    <TabsContent value="pursuing" className="mt-[-2] ">

                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className='bg-slate-950 text-white border-3 border rounded-3xl px-4 py-2'
                        >
                        Add Phd Scholar
                    </Button>
                    </TabsContent>
                    <TabsContent value="passed" className="mt-[-2]">

                    <Button
                        onClick={() => setIsModal2Open(true)}
                        className='bg-slate-950 text-white border-3 border rounded-3xl px-4 py-2'
                        >
                        Add Passed-Phd Scholar
                    </Button>
                    </TabsContent>
                    <Button
                        onClick={() => setIsCSVModalOpen(true)}
                        className='bg-slate-950 text-white border-3 border rounded-3xl px-4 py-2'
                    >
                        Upload CSV
                    </Button>
                    <Button
                        onClick={handleExportCSV}
                        className='bg-emerald-800 text-white border-3 border rounded-3xl px-4 py-2'
                    >
                        Export CSV
                    </Button>
                    <Button
                        onClick={handleDownloadTemplate}
                        className='bg-slate-950 text-white border-3 border rounded-3xl px-4 py-2'
                    >
                        Download Template
                    </Button>
                    <Button
                        onClick={handleExportPDF}
                        className='bg-slate-950 text-white border-3 border rounded-3xl px-4 py-2'
                    >
                        Export as PDF
                    </Button>
                </div>
            </div>

            <div className='font-bold text-2xl p-4 justify-center flex items-center'>
                Uploaded Data:
            </div>

            <div className='flex '>
                <div className='w-full'>
                    <div
                        className='gap-2 w-full  '
                        id='researchSection'
                        ref={tableRef} // Reference to capture table content
                    >
                        
                            <TabsList className="grid grid-cols-2 w-1/2 mx-auto bg-slate-500">
                                <TabsTrigger className='text-black' value="pursuing" >Pursuing</TabsTrigger>
                                <TabsTrigger className='text-black' value="passed">Passed</TabsTrigger>
                            </TabsList>
                            <TabsContent value="pursuing" className="space-y-4 mt-4">

                                <PhDScholarsTable
                                    data={data.filter((item) => item.status === 'pursuing')}
                                    onDelete={handleDelete}
                                    onUpdate={handleUpdate}
                                    onChangeStatus={handleChangeStatus}
                                />
                            </TabsContent>
                            <TabsContent value="passed" className="space-y-4 mt-4">

                                <PhDScholarsTable2
                                    data={data.filter((item) => item.status === 'passed')}
                                    onDelete={handleDelete}
                                    onUpdate={handleUpdate2}
                                />
                            </TabsContent>


                    </div>
                </div>
            </div>
            </Tabs>


            <AdminModalPhdScholar
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
            />
            <AdminModalPhdPassedScholar
                isOpen={isModal2Open}
                onClose={() => setIsModal2Open(false)}
                onSubmit={handleModalSubmit}
            />
            <UpdatePhdPassedScholar
                isOpen={isUpdateModal2Open}
                onClose={() => setIsUpdateModal2Open(false)}
                onSubmit={handleUpdateSubmit}
                InitalData={initialData}
            /> 
            <PhdUpdateModal
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                onSubmit={handleUpdateSubmit}
                initialData={initialData}
            />

            <CSVUploadModal
                isOpen={isCSVModalOpen}
                onClose={() => setIsCSVModalOpen(false)}
                onSubmit={handleCSVSubmit}
            />
            <PhdUpdateStatusModal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                onSubmit={handleChangeStatusSubmit}
                initialData={initialDataStatus}
            />
        </div >
    )
}

function PhDScholarsTable({ data, onDelete, onUpdate, onChangeStatus }) {
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
                                PhD Scholar
                            </th>
                            <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff]'>
                                Supervisor
                            </th>
                            <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff]'>
                                Research Area
                            </th>
                            <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff]'>
                                Email
                            </th>
                            <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff]'>
                                Photo
                            </th>
                            <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff]'>
                                Photo
                            </th>
                            <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff]'>
                                Actions
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

                                    <td className='p-2 text-left  border-b border-1 border-l border-solid border-black text-lg'>
                                        {item.Supervisor}
                                    </td>
                                    <td className='p-2 text-left  border-b border-l border-1 border-solid border-black text-lg'>
                                        {item.researchArea}
                                    </td>
                                    <td className='p-2 text-left  border-b border-l border-1 border-solid border-black text-lg'>
                                        {item.email}
                                    </td>
                                    <td className='p-2 text-center border-b border-l border-1 border-solid border-black'>
                                        <img
                                            src={item.photo}
                                            alt={`${item.name}'s photo`}
                                            className='h-16 w-16 object-cover rounded-full'
                                        />
                                    </td>
                                    <td className='p-2 text-center text-nowrap border-b border-l border-1 border-solid border-black'>
                                        <a
                                            href={item.photo}
                                            className='text-blue-800 underline'
                                        >
                                            view
                                        </a>
                                    </td>
                                    <td className='text-center p-3 border-b border-l border-1 border-solid border-black'>
                                        <div className='flex justify-center gap-2'>
                                            <button
                                                onClick={() =>
                                                    onDelete(item.id)
                                                }
                                                className='p-2 bg-red-500 text-white rounded'
                                            >
                                                <MdDelete />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    onUpdate(item.id)
                                                }
                                                className='p-2 bg-[#10132b] text-white rounded'
                                            >
                                                <MdModeEdit />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    onChangeStatus(item)
                                                }
                                                className='p-2 bg-[#10132b] text-white rounded'
                                            >
                                                <MdCheck />
                                            </button>

                                        </div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
function PhDScholarsTable2({ data, onDelete, onUpdate, }) {
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
                                PhD Scholar
                            </th>
                            <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff]'>
                                Thesis Title
                            </th>
                            <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff]'>
                                Supervisor
                            </th>
                            <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff]'>
                                Passing Date
                            </th>
                            <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff]'>
                                Photo
                            </th>
                            <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff]'>
                                Photo
                            </th>
                            <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff]'>
                                Actions
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

                                    <td className='p-2 text-left  border-b border-1 border-l border-solid border-black text-lg'>
                                        {item.title}
                                    </td>
                                    <td className='p-2 text-left  border-b border-l border-1 border-solid border-black text-lg'>
                                        {item.Supervisor}
                                    </td>
                                    <td className='p-2 text-left  border-b border-l border-1 border-solid border-black text-lg'>
                                        {new Date(item.endDate).toLocaleDateString('en-GB')}
                                    </td>
                                    <td className='p-2 text-center border-b border-l border-1 border-solid border-black'>
                                        <img
                                            src={item.photo}
                                            alt={`${item.name}'s photo`}
                                            className='h-16 w-16 object-cover rounded-full'
                                        />
                                    </td>
                                    <td className='p-2 text-center text-nowrap border-b border-l border-1 border-solid border-black'>
                                        <a
                                            href={item.photo}
                                            className='text-blue-800 underline'
                                        >
                                            view
                                        </a>
                                    </td>
                                    <td className='text-center p-3 border-b border-l border-1 border-solid border-black'>
                                        <div className='flex justify-center gap-2'>
                                            <button
                                                onClick={() =>
                                                    onDelete(item.id)
                                                }
                                                className='p-2 bg-red-500 text-white rounded'
                                            >
                                                <MdDelete />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    onUpdate(item.id)
                                                }
                                                className='p-2 bg-[#10132b] text-white rounded'
                                            >
                                                <MdModeEdit />
                                            </button>


                                        </div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
