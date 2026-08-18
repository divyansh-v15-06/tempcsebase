//@ts-nocheck
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Dialog, DialogOverlay, DialogContent } from '@reach/dialog'
import '@reach/dialog/styles.css'
import Select from 'react-select'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
const InputField = ({ label, value, onChange, id ,required}) => (
    <div className='flex flex-col my-2'>
        <label htmlFor={label} className='text-lg mb-1'>
            {label}:
        </label>
        <input
            type='text'
            id={id}
            className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            value={value}
            required={required}
            onChange={onChange}
        />
    </div>
)

const AdminModalAnnouncements = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        title: '',
        name: '',
        authors: [],
        volume: '',
        pageNo: '',
        month: '',
        year: '',
        issue: '',
        pdfLink: 'https://',
        type: '',
        date:''
    })
    const [faculties, setFaculties] = useState([])

    useEffect(() => {
        const fetchFaculties = async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/faculty/get`,
                )
                console.log('response.data', response.data)
                if (Array.isArray(response.data.data)) {
                    setFaculties(response.data.data)
                } else {
                    console.error('Unexpected response format:', response.data)
                }
            } catch (error) {
                console.error('Error fetching faculties:', error)
            }
        }

        fetchFaculties()
        console.log('faculties', faculties)

        const facultyOptions = faculties.map((faculty) => ({
            // @ts-ignore

            value: faculty.uniqueFacultyId,
            // @ts-ignore

            label: faculty.name,
        }))
        console.log('facultyOptions', facultyOptions)
    }, [])

    const handleChange = (e) => {
        const { id, value } = e.target
        console.log('id:', id)
        console.log('value:', value)
        if(id=='date'){
            setFormData((prev) => ({ ...prev, [id]: value,month:new Date(value).getMonth(),year:new Date(value).getFullYear() }))
        }else{
            setFormData((prev) => ({ ...prev, [id]: value }))
        }
        
        
    }
    

    const handleAuthorChange = (selectedOptions) => {
        const selectedAuthors = selectedOptions.map((option) => option.value)
        setFormData((prev) => ({ ...prev, authors: selectedAuthors }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit(formData)
        setFormData({
            title: '',
            name: '',
            authors: [],
            volume: '',
            pageNo: '',
            month: '',
            year: '',
            issue: '',
            pdfLink: 'https://',
            type: '',
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
                        Add New Announcement
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className='grid grid-cols-1 gap-4'>
                            <InputField
                                label='1. Title'
                                id='title'
                                required={true}
                                value={formData.title}
                                onChange={handleChange}
                            />
                            <InputField
                                label='2. Link '
                                id='pdfLink'
                                required={true}
                                value={formData.pdfLink}
                                onChange={handleChange}
                                
                            />
                            <label>3. Date :</label>
                            <DatePicker
                                label='3. Date '
                                required={true}
                                onChange={(date) =>

                                    handleChange({ target: { id:"date", value: new Date(date).toISOString() } })
                                }
                                value={formData.date&&new Date(formData.date).toLocaleDateString('en-GB')}
                                className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
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

export default AdminModalAnnouncements
