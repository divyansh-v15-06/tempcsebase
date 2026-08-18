'use client'

import { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { log } from 'util'

export default function LoginPage() {
    const[formData, setFormData] = useState({ 
        name: '',
        email: '',
        uniqueFacultyId: '',
        password: ''
    })  
    const [isSubmitted, setIssummited] = useState(false)
    const [responseMessage, setResponseMessage] = useState('')
    const router = useRouter()

    const handleSubmit = (formData) => {
        setIssummited(true);
        axios
            .post(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/signUp`,
                formData
            )
            .then(() => {
                toast.success('Credentials created successfully')
                setFormData({
                    name: '',
                    email: '',
                    uniqueFacultyId: '',
                    password: ''
                });
            })
            .catch((error) => {
                console.error(error)
                toast.error(error.response.data.error.explanation);
            })
            .finally(() => {
                setIssummited(false);
            })
    }
    const handleChange = (e) => {
        const { id, value, files } = e.target;
        if (files && files[0]) {
            setFormData((prev) => ({ ...prev, [id]: files[0] }));
        } else {
            setFormData((prev) => ({ ...prev, [id]: value }));
        }
    };

    return (
        <div className='flex items-center justify-center min-h-screen bg-gray-100 '>
            {isSubmitted?
            <div className='p-6 bg-white rounded shadow-md w-[30vw]'>
                <h2 className='mb-4 text-2xl font-bold'>Creating Faculty Credeantials</h2>
                <div className='mb-4 text-blue-600'>Please wait...</div>
            </div>
             :<div className='p-6 bg-white rounded shadow-md w-[30vw]'>
                <h2 className='mb-4 text-2xl font-bold'>Create Faculty Credeantials</h2>
                {responseMessage && (
                    <div className='mb-4 text-red-600'>{responseMessage}</div>
                )}
                <input
                    type='text'
                    id='name'
                    value={formData.name}
                    onChange={handleChange}
                    placeholder='Name'
                    className='w-full p-2 mb-4 border rounded border-gray-300'
                />
                <input
                    type='text'
                    id='email'
                    value={formData.email}
                    onChange={handleChange}
                    placeholder='Email'
                    className='w-full p-2 mb-4 border rounded border-gray-300'
                />
                <input
                    type='text'
                    id='uniqueFacultyId'
                    value={formData.uniqueFacultyId}
                    onChange={handleChange}
                    placeholder='Username (Unique faculty ID)'
                    className='w-full p-2 mb-4 border rounded border-gray-300'
                />
                <input
                    type='password'
                    id='password'
                    value={formData.password}
                    onChange={handleChange}
                    placeholder='Password'
                    className='w-full p-2 mb-4 border rounded border-gray-300'
                />
                <button
                    className='w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600 mb-4'
                    onClick={()=>handleSubmit(formData)}
                >
                    Log In
                </button>
            
            </div>}
        </div>
    )
}
