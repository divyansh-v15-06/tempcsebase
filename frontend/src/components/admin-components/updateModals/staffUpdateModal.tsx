//@ts-nocheck
import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogOverlay, DialogContent } from '@reach/dialog'
import '@reach/dialog/styles.css'
import axios from 'axios'
import { log } from 'console'

const InputField = ({ label, id, value, onChange }) => (
    <div className='flex items-center my-2'>
        <label htmlFor={id} className='text-lg mr-2'>
            {label}:
        </label>
        <input
            type='text'
            id={id}
            className='border rounded px-2 py-1 flex-1'
            value={value}
            onChange={onChange}
        />
    </div>
)

function StaffUpdateModal({
    isOpen,
    onClose,
    onSubmit,
    initialData, // New prop to provide initial values
}) {

    const [formData, setFormData] = useState({})
    const imageRef = useRef<HTMLInputElement>()
    const [image, setImage] = useState(null)
    const [isLoading, setLoading] = useState(false);
    useEffect(() => {
        setFormData({
            designation: initialData.designation||'',
            name: initialData.name||'',
            email: initialData.email||'',
            photo: initialData.photo||'',
        })
    }
        , [initialData])

    const handleChange = (e) => {
        const { id, value, files } = e.target;
        if (files && files[0]) {
            setImage(files[0]);
        } else {
            setFormData((prev) => ({ ...prev, [id]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        const data = new FormData();
        let updatedFormData = {}
        if (image) {
            data.append("file", image);
            data.append("upload_preset", "trials");
            setLoading(true);
            const res = await axios.post("https://api.cloudinary.com/v1_1/dvnrlqqpq/image/upload", data)
            setLoading(false);
            updatedFormData = { ...formData, photo: res.data.secure_url }
        }
        else {

            updatedFormData = { ...formData }
        }

        onSubmit(updatedFormData, initialData.id)
        setImage(null);
    }
    console.log(formData)

    return (
        <Dialog isOpen={isOpen} onDismiss={onClose}>
            <DialogOverlay className='z-[1000]'>
                <DialogContent
                    aria-labelledby='dialog-title'
                    className='bg-white p-6 rounded-lg shadow-lg w-96'
                >
                    {isLoading ? (<h1>Uploading Data ...</h1>) : (<><h2 id='dialog-title' className='text-2xl mb-4'>
                        Update Staff
                    </h2>
                        <form onSubmit={handleSubmit}>
                        <InputField
                            label='Name'
                            id='name'
                            value={formData.name}
                            onChange={handleChange}
                        />
                        <InputField
                            label='Email'
                            id='email'
                            value={formData.email}
                            onChange={handleChange}
                        />
                        <InputField
                            label='Designation'
                            id='designation'
                            value={formData.designation}
                            onChange={handleChange}
                        />
                            <input
                                type="file"
                                label="image"
                                id="image"
                                value={formData.image}
                                onChange={handleChange}
                            />

                            <div className='mt-4'>
                                <Button
                                    type='submit'
                                    className='bg-blue-500 text-white'
                                >
                                    Submit
                                </Button>
                                <Button
                                    onClick={onClose}
                                    className='ml-2 bg-gray-500 text-white'
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form></>)}
                </DialogContent>
            </DialogOverlay>
        </Dialog>
    )
}

export default StaffUpdateModal;
