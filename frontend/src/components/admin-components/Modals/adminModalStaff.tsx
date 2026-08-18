//@ts-nocheck
import React, { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogOverlay, DialogContent } from '@reach/dialog'
import '@reach/dialog/styles.css'
import axios from 'axios'

const InputField = ({ label, value, onChange, id,required }) => (
    <div className='flex items-center my-2'>
        <label htmlFor={label} className='text-lg mr-2'>
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

const AdminModalStaff = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        designation: '',
        name: '',
        email: '',
        photo: '',
    })

    const imageRef = useRef<HTMLInputElement>()

        const [isLoading, setLoading] = useState(false);
        const [image, setImage] = useState(null)
        const handleChange = (e) => {
            const { id, value, files } = e.target;
            if (files && files[0]) {
              setImage(files[0]);
            } else {
              setFormData((prev) => ({ ...prev, [id]: value }));
            }
          };

    const handleSubmit = async(e) => {
        e.preventDefault();
        const data = new FormData();
        data.append("file", image);
        data.append("upload_preset", "trials");
        setLoading(true);
        const res = await axios.post("https://api.cloudinary.com/v1_1/dvnrlqqpq/image/upload", data)
        const updatedFormData = { ...formData, photo: res.data.secure_url }
        onSubmit(updatedFormData)
        setLoading(false);
        setImage(null);
        setFormData({designation: '',
            name: '',
            email: '',
            photo: '',})
        
    }

    return (
        <Dialog isOpen={isOpen} onDismiss={onClose}>
            <DialogOverlay className='z-[1000]'>
                <DialogContent
                    aria-labelledby='dialog-title'
                    className='bg-white p-6 rounded-lg shadow-lg w-96'
                >
                   {isLoading?(<h1>Uploading Data ...</h1>): (<><h2 id='dialog-title' className='text-2xl mb-4'>
                        Add New Staff
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <InputField
                            label='Name'
                            id='name'
                            value={formData.name}
                            onChange={handleChange}
                            required=   {true}
                        />
                        <InputField
                            label='Email'
                            id='email'
                            value={formData.email}
                            onChange={handleChange}
                            required=   {true}
                        />
                        <InputField
                            label='Designation'
                            id='designation'
                            value={formData.designation}
                            onChange={handleChange}
                            required=   {true}
                        />
                            <input
                                type="file"
                                label="image"
                                id="image"
                                value={formData.image}
                                onChange={handleChange}
                                className='border rounded px-2 py-1 flex-1'
                                accept="image/*"
                                required=   {true}
                            />
                        
                        <p>{image ? "Image Selected" : ""}</p>
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

export default AdminModalStaff
