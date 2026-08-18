//@ts-nocheck
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogOverlay, DialogContent } from '@reach/dialog'
import '@reach/dialog/styles.css'
import Select from 'react-select'

const InputField = ({ label, value, onChange, id }) => (
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
        />
    </div>
)

const AdminModalStudent = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        rollNo: '',
        programmEnroled:'',
        year: '',
        Sem:''
    })

    const handleChange = (e) => {
        const { id, value } = e.target
        setFormData((prev) => ({ ...prev, [id]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit(formData)
    }

    return (
        <Dialog isOpen={isOpen} onDismiss={onClose}>
            <DialogOverlay className='z-[1000]'>
                <DialogContent
                    aria-labelledby='dialog-title'
                    className='bg-white p-6 rounded-lg shadow-lg w-96'
                >
                    <h2 id='dialog-title' className='text-2xl mb-4'>
                        Add new student
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className='flex flex-col my-2'>
                            <label className='text-lg mb-1'>Class:</label>
                            <Select
                                onChange={(option) => {
                                    setFormData((prev) => ({
                                        ...prev,
                                        // @ts-ignore
                                        programmEnroled: option.value,
                                    }))
                                }}
                                options={[
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
                                ]}
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
                    </form>
                </DialogContent>
            </DialogOverlay>
        </Dialog>
    )
}

export default AdminModalStudent
