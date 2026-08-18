//@ts-nocheck
import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogOverlay, DialogContent } from '@reach/dialog'
import '@reach/dialog/styles.css'
import axios from 'axios'
import Select from 'react-select'

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

function StudentUpdateModal({
    isOpen,
    onClose,
    onSubmit,
    initialData, // New prop to provide initial values
}) {
    const options = [
        { value: 'bachelor', label: 'B.Tech.' },
        { value: 'master', label: 'M.Tech. CSE' },
        {
            value: 'dualdegree',
            label: 'Dual degree',
        },
        {
            value: 'master_ai',
            label: 'M.Tech. AI',
        },
    ]
    

    const [formData, setFormData] = useState({})
    const imageRef = useRef<HTMLInputElement>()
    const [selectedOption, setSelectedOption] = useState(null)
    const [image, setImage] = useState(null)
    const [isLoading, setLoading] = useState(false);
    useEffect(() => {
        setFormData({
            name: initialData.name|| '',
            email: initialData.email || '',
            rollNo: initialData.rollNo || '',
            programmEnroled:options[initialData.programmEnroled-1]?.value || '',
            year: initialData.year || '',
            Sem:initialData.currentSemester || ''
        })
        setSelectedOption(options[initialData.programmEnroled-1])
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
                        Update Student 
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className='flex flex-col my-2'>
                            <label className='text-lg mb-1'>Class:</label>
                            <Select
                            value={selectedOption}
                                onChange={(option) => {
                                    setSelectedOption(option)
                                    setFormData((prev) => ({
                                        ...prev,
                                        // @ts-ignore
                                        programmEnroled: option.value,
                                    }))
                                }}
                                options={options}
                                className='basic-single'
                                classNamePrefix='select'
                            />
                        </div>
                        <InputField
                            label='Name'
                            id='name'
                            value={formData.name}
                            onChange={handleChange}
                        />
                        <InputField
                            label='Roll No'
                            id='rollNo'
                            value={formData.rollNo}
                            onChange={handleChange}
                        />
                        <InputField
                            label='Email'
                            id='email'
                            // value={formData.email}
                            value={formData.email}
                            // value={formData.rollno + '@nith.ac.in'}
                            onChange={handleChange}
                        />
                        <InputField
                            label='Current Semester'
                            id='Sem'
                            // value={formData.email}
                            value={formData.Sem}
                            // value={formData.rollno + '@nith.ac.in'}
                            onChange={handleChange}
                        />
                        <InputField
                            label='Year'
                            id='year'
                            // value={formData.email}
                            value={formData.year}
                            // value={formData.rollno + '@nith.ac.in'}
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

export default StudentUpdateModal;
