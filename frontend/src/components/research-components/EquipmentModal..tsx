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

export default function Equipmentmodal({ item }: Props) {
    const link = `https://${item?.link}`

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
                            Complete Equipment Details
                        </DialogTitle>

                        <DialogDescription>
                            <table className='border-1 rounded border border-solid border-[#dde2e6] w-full'>
                                <tbody>
                                    <tr>
                                        <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                            <div className='flex'>
                                                <div className='text-[#103870] w-1/4 text-base font-semibold'>
                                                    Name :
                                                </div>
                                                <div className='text-[#202529] w-3/4 md:w-4/5  '>
                                                    {item?.name}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                            <div className='flex'>
                                                <div className='text-[#103870] w-1/4 text-base font-semibold'>
                                                    Quantity :
                                                </div>
                                                <div className='text-[#202529]'>
                                                    {item?.quantity}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                            <div className='flex'>
                                                <div className='text-[#103870] w-1/4 text-base font-semibold'>
                                                    Date :
                                                </div>
                                                <div className='text-[#202529]'>
                                                    {new Date(item?.date).toLocaleDateString(
                                                        'en-GB')}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                            <div className='flex'>
                                                <div className='text-[#103870] w-1/4 text-base font-semibold'>
                                                    Stock :
                                                </div>
                                                <div className='text-[#202529]'>
                                                    {item?.stock}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                            <div className='flex'>
                                                <div className='text-[#103870] w-1/4 text-base font-semibold'>
                                                    Invoice No. :
                                                </div>
                                                <div className='text-[#202529]'>
                                                    {item?.invoice}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                            <div className='flex'>
                                                <div className='text-[#103870] w-1/4 text-base font-semibold'>
                                                    Indenter`s Name :
                                                </div>
                                                <div className='text-[#202529]'>
                                                    {item?.indenter}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                            <div className='flex'>
                                                <div className='text-[#103870] w-1/4 text-base font-semibold'>
                                                    Vender`s Name :
                                                </div>
                                                <div className='text-[#202529]'>
                                                    {item?.vender}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                            <div className='flex'>
                                                <div className='text-[#103870] w-1/4 text-base font-semibold'>
                                                    Address and Contact No. :
                                                </div>
                                                <div className='text-[#202529]'>
                                                    {item?.addressAndCon}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                            <div className='flex'>
                                                <div className='text-[#103870] w-1/4 text-base font-semibold'>
                                                    Amount (Rs.) :
                                                </div>
                                                <div className='text-[#202529]'>
                                                    {item?.amount}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                            <div className='flex'>
                                                <div className='text-[#103870] w-1/4 text-base font-semibold'>
                                                    Academic Session :
                                                </div>
                                                <div className='text-[#202529]'>
                                                    {item?.academicSession}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>


                                    
                                   
                                   
                                    
                                </tbody>
                            </table>

                            {/* <div className='flex gap-2'>
                                <div className='text-black text-base font-medium '>
                                    Title:
                                </div>
                                <div className='text-[#202529]  '>
                                    {item?.publication_detail?.title}
                                </div>
                            </div>
                            <div className='flex gap-2'>
                                <div className='text-black text-base font-medium '>
                                    Authors:
                                </div>
                                <div className='text-[#202529]  '>
                                    {item?.publication_detail?.title}
                                </div>
                            </div>
                            <div className='flex gap-2'>
                                <div className='text-black text-base font-medium '>
                                    Volume:
                                </div>
                                <div className='text-[#202529]  '>
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
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    )
}
