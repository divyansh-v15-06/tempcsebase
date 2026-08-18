import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '../ui/button'
import Link from 'next/link'

type Props = { item: any }

export default function ResearchSupervisionModal({ item }: Props) {
    const link = `https://${item?.link}`

    return (
        <div>
            <Dialog>
                <DialogTrigger className='items-center'>
                    <div className='place-content-center justify-center'>
                        <Button className='bg-[#00b84c] hover:bg-[#2ca75f] pl-4 pr-4 text-base font-medium text-nowrap'>
                            Details
                        </Button>
                    </div>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className='bg-[#d8f5d8] text-[#0f376f] text-2xl text-center pt-2 pb-2 font-semibold'>
                            Complete Research Supervision Details
                        </DialogTitle>

                        <DialogDescription>
                            <table className='border-1 rounded border border-solid border-[#dde2e6] w-full'>
                                <tbody>
                                    {item?.program && (
                                        <tr>
                                            <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                                <div className='flex'>
                                                    <div className='text-[#103870] w-1/4 md:w-1/5 text-base font-semibold'>
                                                        Program:
                                                    </div>
                                                    <div className='text-[#202529] w-3/4 md:w-4/5 place-items-center flex'>
                                                        {item.program}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {/* {item?.category && (
                                        <tr>
                                            <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                                <div className='flex'>
                                                    <div className='text-[#103870] w-1/4 md:w-1/5 text-base font-semibold'>
                                                        Category:
                                                    </div>
                                                    <div className='text-[#202529] w-3/4 md:w-4/5 place-items-center flex'>
                                                        {item.category}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )} */}
                                    {/* {item?.type && (
                                        <tr>
                                            <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                                <div className='flex'>
                                                    <div className='text-[#103870] w-1/4 md:w-1/5 text-base font-semibold'>
                                                        Type:
                                                    </div>
                                                    <div className='text-[#202529] w-3/4 md:w-4/5 place-items-center flex'>
                                                        {item.type}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )} */}
                                    {item?.scholarName && (
                                        <tr>
                                            <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                                <div className='flex'>
                                                    <div className='text-[#103870] w-1/4 md:w-1/5 text-base font-semibold'>
                                                        Scholar Name:
                                                    </div>
                                                    <div className='text-[#202529] w-3/4 md:w-4/5 place-items-center flex'>
                                                        {item.scholarName}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {/* {item?.sponsoringAgency && (
                                        <tr>
                                            <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                                <div className='flex'>
                                                    <div className='text-[#103870] w-1/4 md:w-1/5 text-base font-semibold mr-2'>
                                                        Sponsoring Agency:
                                                    </div>
                                                    <div className='text-[#202529] w-3/4 md:w-4/5 place-items-center flex'>
                                                        {item.sponsoringAgency}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )} */}
                                    {item?.rollNo && (
                                        <tr>
                                            <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                                <div className='flex'>
                                                    <div className='text-[#103870] w-1/4 md:w-1/5 text-base font-semibold'>
                                                        Roll No:
                                                    </div>
                                                    <div className='text-[#202529] w-3/4 md:w-4/5 place-items-center flex'>
                                                        {item.rollNo}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {item?.researchTopic && (
                                        <tr>
                                            <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                                <div className='flex'>
                                                    <div className='text-[#103870] w-1/4 md:w-1/5 text-base font-semibold'>
                                                        Research Topic:
                                                    </div>
                                                    <div className='text-[#202529] w-3/4 md:w-4/5 place-items-center flex'>
                                                        {item.researchTopic}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {item?.status && (
                                        <tr>
                                            <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                                <div className='flex'>
                                                    <div className='text-[#103870] w-1/4 md:w-1/5 text-base font-semibold'>
                                                        Status:
                                                    </div>
                                                    <div className='text-[#202529] w-3/4 md:w-4/5 place-items-center flex'>
                                                        {item.status}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {item?.year && (
                                        <tr>
                                            <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                                <div className='flex'>
                                                    <div className='text-[#103870] w-1/4 md:w-1/5 text-base font-semibold'>
                                                        Year:
                                                    </div>
                                                    <div className='text-[#202529] w-3/4 md:w-4/5 place-items-center flex'>
                                                        {item.year}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {item?.academicSession && (
                                        <tr>
                                            <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                                <div className='flex'>
                                                    <div className='text-[#103870] w-1/4 md:w-1/5 text-base font-semibold'>
                                                        Academic Session:
                                                    </div>
                                                    <div className='text-[#202529] w-3/4 md:w-4/5 place-items-center flex'>
                                                        {item.academicSession}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {item?.coSupervisor && (
                                        <tr>
                                            <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                                <div className='flex'>
                                                    <div className='text-[#103870] w-1/4 md:w-1/5 text-base font-semibold'>
                                                        Co Supervisors:
                                                    </div>
                                                    <div className='text-[#202529] w-3/4 md:w-4/5 place-items-center flex'>
                                                        {item.coSupervisors}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {item?.associatedFaculty && (
                                        <tr>
                                            <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                                <div className='flex'>
                                                    <div className='text-[#103870] w-1/4 md:w-1/5 text-base font-semibold'>
                                                        Associated Faculty:
                                                    </div>
                                                    <div className='text-[#202529] w-3/4 md:w-4/5 place-items-center flex'>
                                                        {item.associatedFaculty}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    )
}
