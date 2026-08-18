//@ts-nocheck
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Dialog, DialogOverlay, DialogContent } from '@reach/dialog'
import '@reach/dialog/styles.css'
import Select from 'react-select'

const InputField = ({
    label,
    value,
    onChange,
    id,
    type,
    disabled = false,
    minDate,
    options,
    min,
    max,
    step = 1,
    required = false,
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
                required={required}

            />
        ) :
            type === 'number' ? (
                <input
                    type="number"
                    id={id}
                    className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    value={value}
                    onChange={onChange}
                    required={required}
                    inputMode="numeric"
                    min={min}
                    max={max}
                    pattern="[0-9]*"
                    step={step}


                />
            )
                : (
                    <Select
                        id={id}
                        required={required}
                        value={options.find((option) => option.value === value)} // Ensure the selected option is passed correctly
                        onChange={(selectedOption) =>
                            onChange({ target: { id, value: selectedOption.value } })
                        }
                        options={options}
                        className='basic-single'
                        classNamePrefix='select'
                    />
                )
        }
    </div>
)
import { components } from 'react-select'

const customStyles = {
    control: (base, state) => ({
        ...base,
        borderColor: state.isFocused ? '#2563eb' : '#d1d5db',
        boxShadow: state.isFocused ? '0 0 0 1px #2563eb' : 'none',
        padding: '1px',
        borderRadius: '2px',
        fontSize: '14px',
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
            ? '#eff6ff'
            : state.isFocused
                ? '#f1f5f9'
                : 'white',
        color: '#111827',
        padding: '8px 20px',
        cursor: 'pointer',
    }),
    multiValue: (base) => ({
        ...base,
        borderRadius: '15px',
        padding: '1px 2px',
    }),
}



const formatOptionLabel = (option, { context }) => {
    return (
        <div className="flex items-center gap-3 p-1">
            <img
                src={option.image || '/default-avatar.png'}
                alt={option.label}
                className="w-14 h-14 rounded-full object-cover border"
            />
            <div className="flex flex-col">
                <span className="text-sm font-medium">{option.label}</span>
                <span className="text-xs text-gray-500">ID: {option.value}</span>
            </div>
        </div>
    )
}


const ProgramsAssignModal = ({
    isOpen,
    onClose,
    onSubmit,
    initialData = {},
}) => {
    const [formData, setFormData] = useState({
        courseCode: '',
        courseName: '',
        semester: '',
        courseLevel: '',
        lectureHours: '',
        tutorialHours: '',
        practicalHours: '',
        academicYear: '',
        associatedFaculty: ''

    })
    const [faculties, setFaculties] = useState([])

    useEffect(() => {
        if (isOpen) {
            // Pre-fill form with initial data if modal is open
            setFormData(
                {
                    courseCode: initialData.courseCode || '',
                    courseName: initialData.courseName || '',
                    semester: initialData.semester || '',
                    courseLevel: initialData.courseLevel || '',
                    lectureHours: initialData.lectureHours || '',
                    tutorialHours: initialData.tutorialHours || 0,
                    practicalHours: initialData.practicalHours || 0,
                    academicYear: initialData.academicYear || '',
                    associatedFaculty: initialData.faculty_detail.map((faculty) => faculty.uniqueFacultyId).join(',') || ''
                }
            )
        }
    }, [isOpen, initialData])
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
    }, [])
    const facultyOptions = faculties.map((faculty) => ({
        value: faculty.uniqueFacultyId,
        label: faculty.name,
        image: faculty.photo || '/default-avatar.png' // fallback image
    }))


    const handleAuthorChange = (selectedOptions) => {
        const selectedAuthors = selectedOptions.map((option) => option.value).join(',')
        setFormData((prev) => ({ ...prev, associatedFaculty: selectedAuthors }))
    }

    const handleChange = (e) => {
        const { id, value } = e.target
        setFormData((prev) => ({ ...prev, [id]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit(formData, initialData.id)
        setFormData({
            courseCode: '',
            courseName: '',
            semester: '',
            courseLevel: '',
            lectureHours: '',
            tutorialHours: '',
            practicalHours: '',
            academicYear: '',
            associatedFaculty: ''
        })
        onClose()
    }
    return (
        <Dialog isOpen={isOpen} onDismiss={onClose}>
            <DialogOverlay className='z-[1000]'>
                <DialogContent
                    aria-labelledby='dialog-title'
                    className='bg-white p-6 rounded-lg shadow-lg w-full relative'
                >
                    <button
                        onClick={onClose}
                        className='absolute top-4 right-4 text-xl text-gray-600 hover:text-gray-800'
                        aria-label='Close'
                    >
                        &times;
                    </button>
                    <h2 id='dialog-title' className='text-2xl mb-4'>
                        {`Assign Faculty to Course ${formData.courseCode || ''}`}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className='grid grid-cols-1 gap-4'>
                            <Select
                                isMulti
                                options={facultyOptions}
                                onChange={handleAuthorChange}
                                value={facultyOptions.filter(option =>
                                    formData.associatedFaculty.split(',').includes(option.value)
                                )}
                                styles={customStyles}
                                formatOptionLabel={formatOptionLabel}
                                components={{
                                    DropdownIndicator: () => null,
                                    NoOptionsMessage: () => <div className="px-3 py-2 text-gray-500">No faculty found</div>,
                                }}

                            />



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

export default ProgramsAssignModal;
