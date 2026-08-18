//@ts-nocheck
import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'

const Modal = ({ isOpen, data, onClose, onSubmit }) => {
    if (!isOpen) return null

    return (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
            <div className='bg-white p-6 rounded-lg w-[90vw] h-[90vh] overflow-y-auto'>
                <div className='flex justify-between items-center mb-4'>
                    <h2 className='text-xl font-bold'>Data</h2>
                    <button
                        onClick={onClose}
                        className='text-gray-500 hover:text-gray-700 focus:outline-none'
                    >
                        <svg
                            className='w-6 h-6'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                            xmlns='http://www.w3.org/2000/svg'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M6 18L18 6M6 6l12 12'
                            />
                        </svg>
                    </button>
                </div>
                <div>
                    <table className='w-full border-collapse border'>
                        <thead>
                            <tr>
                                {data.length > 0 &&
                                    Object.keys(data[0]).map((key) => (
                                        <th
                                            key={key}
                                            className='border px-4 py-2'
                                        >
                                            {key}
                                        </th>
                                    ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, index) => (
                                <tr key={index}>
                                    {Object.values(row).map((value, idx) => (
                                        <td
                                            key={idx}
                                            className='border px-4 py-2'
                                        >
                                            {value}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Modal
