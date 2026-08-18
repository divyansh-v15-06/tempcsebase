//@ts-nocheck
import React, { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogOverlay, DialogContent } from '@reach/dialog'
import '@reach/dialog/styles.css'
import axios from 'axios'

const InputField = ({ label, value, onChange, id, required = false }) => (
    <div className='flex items-center my-2'>
        <label htmlFor={label} className='text-lg mr-2'>
            {label}:
        </label>
        <input
            type='text'
            id={id}
            required={required}
            className='border rounded px-2 py-1 flex-1'
            value={value}
            onChange={onChange}
        />
    </div>
)

const AdminModalPhdScholar = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        Supervisor: '',
        researchArea: '',
        name: '',
        LinkedIn: '',
        email: '',
        photo: '',
        status: 'pursuing',
        GoogleScholar: '',
        Scopus: ''
    })

    const [image, setImage] = useState()
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
        let updatedFormData = { ...formData }
        if (image) {
            const data = new FormData();
            data.append("file", image);
            data.append("upload_preset", "trials");
            setLoading(true)
            const res = await axios.post("https://api.cloudinary.com/v1_1/dvnrlqqpq/image/upload", data)

             updatedFormData = { ...formData, photo: res.data.secure_url }

        }
        onSubmit(updatedFormData)
        setFormData({
            Supervisor: '',
            researchArea: '',
            name: '',
            LinkedIn: '',
            email: '',
            photo: '',
            status: 'pursuing',
            GoogleScholar: '',
            Scopus: ''
        })
        setLoading(false)
    }

    return (
        <Dialog isOpen={isOpen} onDismiss={onClose}>
            <DialogOverlay className='z-[1000]'>
                <DialogContent
                    aria-labelledby='dialog-title'
                    className='bg-white p-6 rounded-lg shadow-lg w-96'
                >
                    {isLoading ? (<h1>Uploading Data ...</h1>) : (<><h2 id='dialog-title' className='text-2xl mb-4'>
                        Add New Phd Scholar
                    </h2>
                        <form onSubmit={handleSubmit}>
                            <InputField
                                label='Name'
                                id='name'
                                value={formData.name}
                                onChange={handleChange}
                                required={true}
                            />
                            <InputField
                                label='Supervisor'
                                id='Supervisor'
                                value={formData.Supervisor}
                                onChange={handleChange}
                                required={true}
                            />
                            <InputField
                                label='Research Area'
                                id='researchArea'
                                value={formData.researchArea}
                                onChange={handleChange}
                            />
                            <InputField
                                label='email'
                                id='email'
                                value={formData.email}
                                required={true}
                                onChange={handleChange}
                            />
                            <input
                                type="file"
                                label="image"
                                id="image"

                                value={formData.image}
                                onChange={handleChange}
                            />

                            <InputField
                                label='LinkedIn'
                                id='LinkedIn'
                                value={formData.LinkedIn}
                                onChange={handleChange}
                            />
                            <InputField
                                label='GoogleScholar'
                                id='GoogleScholar'
                                value={formData.GoogleScholar}
                                onChange={handleChange}
                            />
                            <InputField
                                label='Scopus'
                                id='Scopus'
                                value={formData.Scopus}
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

export default AdminModalPhdScholar
