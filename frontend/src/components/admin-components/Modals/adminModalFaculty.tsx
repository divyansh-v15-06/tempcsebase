//@ts-nocheck
import React, { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogOverlay, DialogContent } from '@reach/dialog'
import '@reach/dialog/styles.css'
import axios from 'axios'

const InputField = ({ label, id, value, onChange,required }) => (
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
            required={required}
        />
    </div>
)

const AdminModalFaculty = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        researchInterests: '',
        name: '',
        position: '',
        phoneNo: '',
        email: '',
        portfolio: '',
        photo: '',
    })

    const imageRef = useRef<HTMLInputElement>( null)
    const [image, setImage] = useState(null)
    const [isLoading, setLoading] = useState(false);

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
        let updatedFormData = formData;
        if (image) {
            const data = new FormData();
            data.append("file", image);
            data.append("upload_preset", "trials");
            setLoading(true);
            const res = await axios.post("https://api.cloudinary.com/v1_1/dvnrlqqpq/image/upload", data)
            setLoading(false);
            updatedFormData = { ...formData, photo: res.data.secure_url }
        }
        onSubmit(updatedFormData)
        setFormData({
            researchInterests: '',
            name: '',
            position: '',
            phoneNo: '',
            email: '',
            portfolio: '',
            photo: '',
            image: ''
        })
        setImage(null);
    }

    return (
        <Dialog isOpen={isOpen} onDismiss={onClose}>
            <DialogOverlay className='z-[1000]'>
                <DialogContent
                    aria-labelledby='dialog-title'
                    className='bg-white p-6 rounded-lg shadow-lg w-96'
                >
                    {isLoading ? (<h1>Uploading Data ...</h1>) : (<><h2 id='dialog-title' className='text-2xl mb-4'>
                        Add New Faculty
                    </h2>
                        <form onSubmit={handleSubmit}>
                            <InputField
                                label='Name'
                                id='name'
                                value={formData.name}
                                required={true}
                                onChange={handleChange}
                            />
                            <span className='text-sm text-gray-500'>*For Temporary Faculty write --- </span> 
                            <InputField
                                label='Position'
                                id='position'
                                required={true}
                                value={formData.position}
                                onChange={handleChange}
                            />
                            <InputField
                                label='Research Interest'
                                id='researchInterests'
                                // required={true}
                                value={formData.researchInterests}
                                onChange={handleChange}
                            />
                            <InputField
                                label='Phone No.'
                                id='phoneNo'
                                required={true}
                                value={formData.phoneNo}
                                onChange={handleChange}
                            />
                            <InputField
                                label='Email'
                                id='email'
                                required={true}
                                value={formData.email}
                                onChange={handleChange}
                            />
                            <InputField
                                label='Portfolio'
                                id='portfolio'
                                value={formData.portfolio}
                                onChange={handleChange}
                            />
                            <input
                                type="file"
                                label="image"
                                id="image"
                                required={true}
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

export default AdminModalFaculty
