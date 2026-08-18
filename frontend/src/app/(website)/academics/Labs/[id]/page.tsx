// @ts-nocheck
import axios from 'axios'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function LabDetailPage({ params }) {
    const { id } = params
    let lab = null

    try {
        const res = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/labs/get/${id}`
        )
        lab = res.data.data
    } catch (err) {
        console.error('Error fetching lab detail:', err)
    }

    if (!lab) {
        return (
            <div className='p-6 text-center text-red-500'>
                Lab not found.
            </div>
        )
    }

    return (
        <div className='max-w-5xl mx-auto px-6 py-10'>
            <Link
                href="/academics/Labs"
                className="flex items-center text-sm text-blue-600 hover:underline mb-6"
            >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Labs
            </Link>

            <div className='bg-white rounded-2xl shadow-lg overflow-hidden'>
                <img
                    src={lab.photo || '/placeholder.jpg'}
                    alt={lab.title}
                    className='w-full h-72 object-cover'
                />

                <div className='p-6'>
                    <h1 className='text-4xl font-bold text-gray-800 mb-4'>
                        {lab.title}
                    </h1>

                    <p className='text-gray-700 leading-relaxed mb-6'>
                        {lab.description || 'No description available.'}
                    </p>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div className='bg-gray-50 border rounded-xl p-5'>
                            <h2 className='text-lg font-semibold text-gray-700 mb-2'>
                                Officer In Charge (OIC)
                            </h2>
                            <p className='text-gray-900 text-base'>{lab.OIC}</p>
                        </div>

                        <div className='bg-gray-50 border rounded-xl p-5'>
                            <h2 className='text-lg font-semibold text-gray-700 mb-2'>
                                Technician
                            </h2>
                            <p className='text-gray-900 text-base'>{lab.technician}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
