//@ts-nocheck
import React, { useState, useEffect } from 'react'
import { Dialog, DialogOverlay, DialogContent } from '@reach/dialog'
import '@reach/dialog/styles.css'
import { Button } from '@/components/ui/button'
import Select from 'react-select'
import axios from 'axios'
import { on } from 'events'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const InputField = ({
    label,
    value,
    onChange,
    id,
    type = "text",
    disabled = false,
    minDate,
    options
}) => (
    <div className='flex flex-col my-2'>
        <label htmlFor={id} className='text-lg mb-1'>
            {label}:
        </label>
        {type === 'text' ? (
            <input
                type='text'
                id={id}
                className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                value={value}
                onChange={onChange}
            />
        ) : type === 'select' ? (
            <Select
                id={id}
                value={options.find(option => option.value === value)} // Ensure the selected option is passed correctly
                onChange={(selectedOption) => onChange({ target: { id, value: selectedOption.value } })}
                options={options}
                className="basic-single"
                classNamePrefix="select"
            />
        ) : type === 'year' ? (
            <DatePicker
                minDate={minDate}
                selected={value as Date}
                onChange={(date: Date) => onChange({ target: { id, value: date } })}
                showYearPicker
                dateFormat="yyyy"
                disabled={disabled}
                placeholderText="yyyy"
                className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
        ) : (
            <DatePicker

                selected={value as Date}
                onChange={(date: Date) => onChange({ target: { id, value: date } })}
                dateFormat="dd/MM/yyyy"
                disabled={disabled}
                placeholderText="dd/mm/yyyy"
                className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
        )}
    </div>
);

const EventUpdateModal = ({ isOpen, onClose, onSubmit, initialData = {} }) => {
    const [formData, setFormData] = useState({
        title: '',
        authorName: '',
        associatedFaculties: '',
        designation: '',
        academicSession: '',
        startDate: '',
        faculties:'',
        endDate: '',
        sponsoringAgency: '',
        venue: '',
        category: '',
        type: '',
    })
    const [facultyList, setFacultyList] = useState([])
    console.log(formData);
    

    useEffect(() => {
        if (isOpen) {
            // Pre-fill form with initial data if modal is open
            setFormData({
                title: initialData.title || '',
                faculties: initialData.faculties.map((faculty)=>faculty.uniqueFacultyId) || '',
                academicSession: initialData.academicSession || '',
                startDate: initialData.startDate || '',
                endDate: initialData.endDate || '',
                sponsoringAgency: initialData.sponsoringAgency || '',
                venue: initialData.venue || '',
                category: initialData.category || '',
                Convenor: initialData.Convenor || '',
                Coordinator: initialData.Coordinator || '',
                type: initialData.type || '',
            })
        }
    }, [isOpen, initialData])

    useEffect(() => {
        const fetchFaculties = async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/faculty/get?parmanent=true`,
                )
                if (Array.isArray(response.data.data)) {
                    setFacultyList(response.data.data)
                } else {
                    console.error('Unexpected response format:', response.data)
                }
            } catch (error) {
                console.error('Error fetching faculties:', error)
            }
        }

        fetchFaculties()
    }, [])

    const handleFacultyChange = (selectedOptions) => {
        const selectedFaculties = selectedOptions.map((option) => option.value)
        setFormData((prev) => ({ ...prev, faculties: selectedFaculties }))
    }

    const handleChange = (e) => {
        const { id, value } = e.target
        setFormData((prev) => ({ ...prev, [id]: value }))
    }

    const handleCategoryChange = (option) => {
        setFormData((prev) => ({ ...prev, category: option.value }))
    }

    const handleTypeChange = (option) => {
        setFormData((prev) => ({ ...prev, type: option.value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit(formData, initialData.id)
        onClose()
    }


    const types = [
        { value: 'conference', label: 'Conference' },
        { value: 'workshop', label: 'Workshop' },
        { value: 'STC', label: 'STC' },
        { value: 'E-STC', label: 'E-STC' },
        { value: 'GIAN', label: 'GIAN' },
    ];
    const categories = [
        { value: 'organized', label: 'Organized' },
        { value: 'attended', label: 'Attended' },
        
        
    ];
    const facultyOptions = facultyList.map((faculty) => ({
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
                        {initialData.id ? 'Update Event' : 'Add New Event'}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className='grid grid-cols-1 gap-4'>
                            <InputField
                                label='Event Title'
                                id='title'
                                value={formData.title}
                                onChange={handleChange}
                            />
                            <div className='flex flex-col my-2'>
                                <label className='text-lg mb-1'>
                                    2. Faculty Members:
                                </label>
                                <Select
                                    isMulti
                                    value={facultyOptions.filter((option) =>
                                        formData.faculties.includes(option.value),
                                    )}
                                    options={facultyOptions}
                                    onChange={handleFacultyChange}
                                    className='basic-multi-select'
                                    classNamePrefix='select'
                                />
                            </div>
                           <InputField
                                label='Position 1 '
                                id='Convenor'
                                value={formData.Convenor}
                                onChange={handleChange}
                            />
                            <InputField
                                label='Position 2'
                                id='Coordinator'
                                value={formData.Coordinator}
                                onChange={handleChange}
                            />
                            <InputField
                                label='Academic Session'
                                id='academicSession'
                                value={formData.academicSession}
                                onChange={handleChange}
                            />
                            <InputField
                                type='date'
                                label='Start date'
                                id='startDate'
                                value={formData.startDate}
                                onChange={(e) => {
                                    const date = new Date(e.target.value);
                                    setFormData((prev) => ({ ...prev, startDate: date}));
                                }}
                            />
                           <InputField
                                type='date'
                                label='End date'
                                id='endDate'
                                value={formData.endDate}
                                onChange={(e) => {
                                    const date = new Date(e.target.value);
                                    setFormData((prev) => ({ ...prev, endDate: date}));
                                }}
                            />
                            <InputField
                                label='Sponsoring Agency'
                                id='sponsoringAgency'
                                value={formData.sponsoringAgency}
                                onChange={handleChange}
                            />
                            <InputField
                                label='Venue'
                                id='venue'
                                value={formData.venue}
                                onChange={handleChange}
                            />
                            <div className='flex flex-col my-2'>
                                <label className='text-lg mb-1'>
                                    Category:
                                </label>
                                <Select
                                    value={categories.find(
                                        (option) =>
                                            option.value === formData.category,
                                    )}
                                    options={categories}
                                    onChange={handleCategoryChange}
                                    className='basic-single'
                                    classNamePrefix='select'
                                />
                            </div>
                            <div className='flex flex-col my-2'>
                                <label className='text-lg mb-1'>Type:</label>
                                <Select
                                    value={types.find(
                                        (option) =>
                                            option.value === formData.type,
                                    )}
                                    options={types}
                                    onChange={handleTypeChange}
                                    className='basic-single'
                                    classNamePrefix='select'
                                />
                            </div>
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

export default EventUpdateModal
