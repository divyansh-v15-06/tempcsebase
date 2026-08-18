import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '../ui/button'

type Props = { item: any }

export default function ProjectModal({ item }: Props) {
    const link = `https://${item?.publication_detail?.link}`
    const [isEditing, setIsEditing] = useState(false)
    const [projectData, setProjectData] = useState(item)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setProjectData((prevData) => ({
            ...prevData,
            [name]: value,
        }))
    }
    const location = window.location

    return (
        <div>
            {/* <button className=' 	place-content-center   text-center text-[#fff]     border-[#dde2e6] rounded-md pl-4 pr-4'>
                                        Details
                                    </button> */}
            <Dialog>
                <DialogTrigger className='items-center'>
                    <div className=' place-content-center justify-center'>
                        <Button className='bg-[#00b84c] hover:bg-[#2ca75f] pl-4 pr-4 text-base font-medium text-nowrap  '>
                            Details
                        </Button>
                    </div>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className='bg-[#d8f5d8] text-[#0f376f] text-2xl text-center pt-2 pb-2 font-semibold '>
                            Complete Project Details
                        </DialogTitle>

                        <DialogDescription>
                            <table className='border-1 rounded border border-solid border-[#dde2e6] w-full'>
                                <tbody>
                                    <tr>
                                        <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                            <div className='flex'>
                                                <div className='text-[#103870] w-1/3 md:w-1/5 text-base font-semibold'>
                                                    Title
                                                </div>
                                                <div className='text-[#202529] w-2/3 md:w-4/5 md:pl-4  '>
                                                    {item?.title}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                            <div className='flex'>
                                                <div className='text-[#103870] w-1/3 md:w-1/5 text-base font-semibold'>
                                                    Reference Number
                                                </div>
                                                <div className='text-[#202529] md:pl-4'>
                                                    {item?.referenceNo}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                            <div className='flex'>
                                                <div className='text-[#103870] w-1/3 md:w-1/5  text-base font-semibold'>
                                                    Funding Agency
                                                </div>
                                                <div className='text-[#202529] md:pl-4 '>
                                                    {item?.fundingAgency}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                            <div className='flex'>
                                                <div className='text-[#103870] w-1/3 md:w-1/5  text-base font-semibold'>
                                                    Funding Amount(Rs.)
                                                </div>
                                                <div className='text-[#202529] md:pl-4 '>
                                                    {item?.fundingAmount}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                            <div className='flex'>
                                                <div className='text-[#103870] w-1/3 md:w-1/5 text-base font-semibold'>
                                                    Status
                                                </div>
                                                <div className='text-[#202529] md:pl-4'>
                                                    {item?.status}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                            <div className='flex'>
                                                <div className='text-[#103870] w-1/3 md:w-1/5  text-base font-semibold'>
                                                    Year
                                                </div>
                                                <div className='text-[#202529] md:pl-4'>
                                                    {item?.year}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                            <div className='flex'>
                                                <div className='text-[#103870] w-1/3 md:w-1/5  text-base font-semibold'>
                                                    Duration(M)
                                                </div>
                                                <div className='text-[#202529] md:pl-4'>
                                                    {item?.duration}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                            <div className='flex'>
                                                <div className='text-[#103870] w-1/3 md:w-1/5 text-base font-semibold'>
                                                    Principal Investigator
                                                </div>
                                                <div className='text-[#202529] md:pl-4'>
                                                    {
                                                        item?.principalInvestigator
                                                    }
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                            <div className='flex'>
                                                <div className='text-[#103870] w-1/3 md:w-1/5 text-base font-semibold'>
                                                    Co-Principal Investigator
                                                </div>
                                                <div className='text-[#202529] md:pl-4'>
                                                    {
                                                        item?.coprincipalInvestigator
                                                    }
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    {item?.publication_detail?.link && (
                                        <tr>
                                            <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                                <div className='flex'>
                                                    <div className='text-[#103870] w-1/3 md:w-1/5 text-base font-semibold'>
                                                        Link
                                                    </div>
                                                    <div className='text-[#202529] md:pl-4'>
                                                        <Button className='bg-[#00b84c] hover:bg-[#2ca75f] p-2 pl-4 pr-4 text-base'>
                                                            <a
                                                                href={link}
                                                                target='_blank'
                                                                rel='noopener noreferrer'
                                                            >
                                                                Details
                                                            </a>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* <div className='flex gap-2'>
                                <div className='text-black text-base font-medium '>
                                    Title:
                                </div>
                                <div className='text-[#202529] md:pl-4  '>
                                    {item?.publication_detail?.title}
                                </div>
                            </div>
                            <div className='flex gap-2'>
                                <div className='text-black text-base font-medium '>
                                    Authors:
                                </div>
                                <div className='text-[#202529] md:pl-2  '>
                                    {item?.publication_detail?.title}
                                </div>
                            </div>
                            <div className='flex gap-2'>
                                <div className='text-black text-base font-medium '>
                                    Volume:
                                </div>
                                <div className='text-[#202529] md:pl-2  '>
                                    {item?.publication_detail?.title}
                                </div>
                            </div>
                            <div className='flex gap-2'>
                                <div className='text-black text-base font-medium '>
                                    Page No.:
                                </div>
                                <div className='text-[#202529]  '>
                                    {item?.publication_detail?.title}
                                </div>
                            </div>
                            <div className='flex gap-2'>
                                <div className='text-black text-base font-medium '>
                                    Date:
                                </div>
                                <div className='text-[#202529]  '>
                                    {item?.publication_detail?.title}
                                </div>
                            </div>
                            <div className='flex gap-2'>
                                <div className='text-black text-base font-medium '>
                                    Link:
                                </div>
                                <div className='text-[#202529]  '>
                                    {item?.publication_detail?.title}
                                </div>
                            </div> */}
                        </DialogDescription>
                        {/* <div className='flex justify-end gap-2 mt-4'>
                            {isEditing ? (
                                <>
                                    <Button
                                        className='bg-[#00b84c] hover:bg-[#2ca75f] text-base'
                                        onClick={handleSave}
                                    >
                                        Save
                                    </Button>
                                    <Button
                                        className='bg-gray-500 hover:bg-gray-600 text-base'
                                        onClick={toggleEdit}
                                    >
                                        Cancel
                                    </Button>
                                </>
                            ) : (
                                !location.pathname.includes('people') && (
                                    <Button
                                        className='bg-[#00b84c] hover:bg-[#2ca75f] text-base'
                                        onClick={toggleEdit}
                                    >
                                        Update
                                    </Button>
                                )
                            )}
                        </div> */}
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    )
}
