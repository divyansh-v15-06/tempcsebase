//@ts-nocheck
import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Dialog, DialogOverlay, DialogContent } from '@reach/dialog'
import '@reach/dialog/styles.css'
import Select from 'react-select'
import toast from 'react-hot-toast'

const InputField = ({ label, value, onChange, id }) => (
    <div className='flex flex-col my-2'>
        <label htmlFor={label} className='text-lg mb-1'>
            {label}:
        </label>
        <input
            type='text'
            id={id}
            className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            value={value}
            onChange={onChange}
        />
    </div>
)

const AdminModalHod = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: '',
        message: '',
        image: '',
    })
    const [faculties, setFaculties] = useState([])
    const imageRef = useRef<HTMLInputElement>(null)
        const [image, setImage] = useState<File | null>(null)


    const handleChange = (e) => {
        const { id, value,files } = e.target
        setFormData((prev) => ({ ...prev, [id]: value }))
        setImage(files[0]);
    }



    const handleSubmit = async(e) => {
        e.preventDefault()
        if (!image) {
            toast.error('No image selected')
            return
        }
        const data = new FormData();
        data.append("file", image);
        data.append("upload_preset", "trials");
        const res = await axios.post("https://api.cloudinary.com/v1_1/dvnrlqqpq/image/upload", data)
        const updatedFormData={...formData,image:res.data.secure_url}
        onSubmit(updatedFormData)
        setFormData({
            name: '',
            message: '',
            image: '',
        })
    }

    return (
        <Dialog isOpen={isOpen} onDismiss={onClose}>
            <DialogOverlay className='z-[1000]'>
                <DialogContent
                    aria-labelledby='dialog-title'
                    className='bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative'
                >
                    <button
                        onClick={onClose}
                        className='absolute top-4 right-4 text-xl text-gray-600 hover:text-gray-800'
                        aria-label='Close'
                    >
                        &times;
                    </button>
                    <h2 id='dialog-title' className='text-2xl mb-4'>
                        Add new HOD
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className='grid grid-cols-1 gap-4'>
                            <InputField
                                label='Name'
                                id='name'
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                            />
                            <InputField
                                label='Message'
                                id='message'
                                value={formData.message}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        message: e.target.value,
                                    }))
                                }
                            />
                                <input
                                    type="file"
                                    label="image"
                                    id="image"
                                    value={formData.image}
                                    onChange={handleChange}
                                    
                                />
                                
                        </div>
                        <div className='mt-4 flex justify-end'>
                            <Button
                                type='submit'
                                className='bg-blue-500 text-white mr-2'
                            >
                                Submit
                            </Button>
                            <Button
                                onClick={onClose}
                                className='bg-gray-500 text-white'
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </DialogOverlay>
        </Dialog>
    )
}

export default AdminModalHod
