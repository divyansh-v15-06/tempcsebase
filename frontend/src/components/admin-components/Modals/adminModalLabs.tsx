//@ts-nocheck
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Dialog, DialogOverlay, DialogContent } from '@reach/dialog'
import '@reach/dialog/styles.css'
import Select from 'react-select'
import { set } from 'react-datepicker/dist/date_utils'

const InputField = ({ label, value, onChange, id, type, required = false }) => (
    <div className='flex flex-col my-2'>
        <label htmlFor={label} className='text-lg mb-1'>
            {label}:
        </label>

        {type === 'textarea' ? (
            <textarea
                id={id}
                className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                value={value}
                required={required}
                onChange={onChange}
                rows={4}
            />
        ) : type === 'file' ? (
            <input
                type='file'
                id={id}
                required={required}
                className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                onChange={(e) => onChange({ target: { id, value: e.target.files[0] } })}
            />
        ) : (< input
            type='text'
            id={id}
            required={required}
            className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            value={value}
            onChange={onChange}
        />)}
    </div>
)

const AdminModalLabs = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        photo: "",
        OIC: "",
        technician: ""

    })
    const [isLoading, setIsLoading] = useState(false)

    const handleChange = (e) => {
        const { id, value } = e.target
        setFormData((prev) => ({ ...prev, [id]: value }))
    }
    const  handleSubmit = async (e) => {
        e.preventDefault()
        if (formData.photo instanceof File) {
            setIsLoading(true)
            const data = new FormData();
            data.append("file", formData.photo);
            data.append("upload_preset", "trials");
            const res = await axios.post("https://api.cloudinary.com/v1_1/dvnrlqqpq/image/upload", data)
            setIsLoading(false)
            const updatedFormData = { ...formData, photo: res.data.secure_url }
            onSubmit(updatedFormData)
        }
        else {
            onSubmit(formData)
        }
        setFormData({
            title: "",
            description: "",
            photo: "",
            OIC: "",
            technician: ""
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
                        Add new Lab
                    </h2>
                    {
                        isLoading ? (
                            <div className=' flex items-center justify-center bg-gray-100 bg-opacity-50 z-10'>
                                <div className='text-blue-400'>Uploading Data</div>
                            </div>
                        )
:(
                   
                    <form onSubmit={handleSubmit}>
                        <div className='grid grid-cols-1 gap-4'>
                            <InputField
                                label='1. Lab Name'
                                id='title'
                                value={formData.title}
                                onChange={handleChange}
                                required={true}
                            />
                            <InputField
                                label='2. Description'
                                id='description'
                                type='textarea'
                                value={formData.description}
                                onChange={handleChange}
                                required={true}
                            />
                            <InputField
                                label='3. Photo'
                                id='photo'
                                required={true}
                                type='file'
                                value={formData.photo}
                                onChange={handleChange}
                            />
                            <InputField
                                label='4. Officer In Charge (OIC)'
                                id='OIC'
                                required={true}
                                value={formData.OIC}
                                onChange={handleChange}
                            />
                            <InputField
                                label='5. Technician'
                                id='technician'
                                required={true}
                                value={formData.technician}
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
                    </form>)}
                </DialogContent>
            </DialogOverlay>
        </Dialog>
    )
}

export default AdminModalLabs
