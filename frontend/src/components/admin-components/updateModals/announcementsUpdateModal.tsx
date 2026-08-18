//@ts-nocheck
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Dialog, DialogOverlay, DialogContent } from '@reach/dialog'
import '@reach/dialog/styles.css'
import Select from 'react-select'
import Image from 'next/image'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const InputField = ({ label, id, value, onChange,required }) => (
    <div className='flex flex-col my-2'>
        <label htmlFor={id} className='text-lg mb-1'>
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

const AnnouncementsUpdateModal = ({
    isOpen,
    onClose,
    onSubmit,
    initialData = {},
}) => {
    const [formData, setFormData] = useState({
        title: '',
        name: '',
        authors: [],
        volume: '',
        pageNo: '',
        month: '',
        year: '',
        issue: '',
        link: '',
        type: '',
    })
    const [faculties, setFaculties] = useState([])

    useEffect(() => {
        if (isOpen) {
            // Pre-fill form with initial data if modal is open
            setFormData({
                title: initialData.title || '',
                name: initialData.name || '',
                authors: initialData.faculty_detail
                    ? initialData.faculty_detail.map(
                        (faculty) => faculty.uniqueFacultyId,
                    )
                    : [],
                volume: initialData.volume || '',
                pageNo: initialData.pageNo || '',
                month: initialData.month || '',
                year: initialData.year || '',
                issue: initialData.issue || '',
                pdfLink: initialData.pdfLink || '',
                type: initialData.research_detail
                    ? initialData.research_detail.name
                    : '',
                date:initialData.date||''
            })
        }
    }, [isOpen, initialData])

    useEffect(() => {
        const fetchFaculties = async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/faculty/get`,
                )
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
    }, [])

    const handleChange = (e) => {
        const { id, value } = e.target
        setFormData((prev) => ({ ...prev, [id]: value }))
    }

    const handleAuthorChange = (selectedOptions) => {
        const selectedAuthors = selectedOptions.map((option) => option.value)
        setFormData((prev) => ({ ...prev, authors: selectedAuthors }))
    }

    const handleTypeChange = (option) => {
        setFormData((prev) => ({ ...prev, type: option.value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        onSubmit(formData, initialData.id)
        onClose()
    }
    const facultyOptions = faculties.map((faculty) => ({
        value: faculty.uniqueFacultyId,
        label: faculty.name,
    }))

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
                        {initialData.id
                            ? 'Update Announcements'
                            : 'Add new Announcements'}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className='grid grid-cols-1 gap-4'>

                            {/* <div className='flex flex-col my-2'>
                                <label className='text-lg mb-1'>
                                    3. Authors:
                                </label>
                                <Select
                                    isMulti
                                    value={facultyOptions.filter((option) =>
                                        formData.authors.includes(option.value),
                                    )}
                                    options={facultyOptions}
                                    onChange={handleAuthorChange}
                                    className='basic-multi-select'
                                    classNamePrefix='select'
                                />
                            </div> */}
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

                                    handleChange({ target: { id: "date", value: new Date(date)} })
                                }
                                value={new Date(formData.date).toLocaleDateString('en-GB')}
                                className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                            />
                            {/* <div className='flex flex-col my-2'>
                                <label className='text-lg mb-1'>
                                    9. Select Type of Research:
                                </label>
                                <Select
                                    value={{
                                        value: formData.type,
                                        label: formData.type,
                                    }}
                                    onChange={handleTypeChange}
                                    options={[
                                        { value: 'Journal', label: 'Journal' },
                                        { value: 'Book', label: 'Book' },
                                        {
                                            value: 'Book Chapter',
                                            label: 'Book Chapter',
                                        },
                                        { value: 'Patent', label: 'Patent' },
                                    ]}
                                    className='basic-single'
                                    classNamePrefix='select'
                                />
                            </div> */}
                        </div>
                        <div className='mt-4 flex justify-end'>
                            <Button
                                type='submit'
                                className='bg-blue-500 text-white mr-2'
                            >
                                {initialData.id ? 'Update' : 'Submit'}
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

export default AnnouncementsUpdateModal
