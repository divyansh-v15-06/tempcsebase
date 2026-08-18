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
    type ,
    disabled = false,
    minDate,
    options,
    min,
    max,
    step=1,
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
                :  (
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

const ProgramsUpdateModal = ({
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
                    tutorialHours: initialData.tutorialHours || '',
                    practicalHours: initialData.practicalHours || '',
                    academicYear: initialData.academicYear || '',
                    associatedFaculty: initialData.faculty_detail.map((faculty) =>faculty.uniqueFacultyId).join(',') || ''
                }
            )
        }
    }, [isOpen, initialData])

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
            academicYear: ''
        })
        onClose()
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
                        {'Update Progrmme'}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className='grid grid-cols-1 gap-4'>
                            <InputField
                                label='Course Code'
                                id='courseCode'
                                value={formData.courseCode}
                                onChange={handleChange}
                                required={true}
                                type='text'
                            />
                            <InputField
                                label='Course Name'
                                id='courseName'
                                value={formData.courseName}
                                onChange={handleChange}
                                required={true}
                                type='text'
                            />
                            
                            <InputField
                                label='Course Level'
                                id='courseLevel'
                                value={formData.courseLevel}
                                onChange={handleChange}
                                required={true}
                                options={[
                                    { value: 'UG', label: 'UnderGraduate' },
                                    { value: 'PG', label: 'PostGraduate' },]}
                            />
                            {formData.courseLevel&&<InputField
                                label='Semester'
                                id='semester'
                                value={formData.semester}
                                onChange={handleChange}
                                options={ formData.courseLevel==='PG'?[
                                    { value: 1, label: 'Semester 1' },
                                    { value: 2, label: 'Semester 2' },
                                    { value: 3, label: 'Semester 3' },
                                    { value: 4, label: 'Semester 4' }
                                ]:[
                                    { value: 1, label: 'Semester 1' },
                                    { value: 2, label: 'Semester 2' },
                                    { value: 3, label: 'Semester 3' },
                                    { value: 4, label: 'Semester 4' },
                                    { value: 5, label: 'Semester 5' },
                                    { value: 6, label: 'Semester 6' },
                                    { value: 7, label: 'Semester 7' },
                                    { value: 8, label: 'Semester 8' },
                                    { value: 9, label: 'Semester 9' },
                                    { value: 10, label: 'Semester 10' },
                                ]}
                            />}
                            <InputField
                                label='Lecture Hours'
                                id='lectureHours'
                                value={formData.lectureHours}
                                onChange={handleChange}
                                type='number'
                                min='1'
                                required={true}
                                max='4'
                            />
                            <InputField
                                label='Tutorial Hours'
                                id='tutorialHours'
                                value={formData.tutorialHours}
                                onChange={handleChange}
                                type='number'
                                min='0'
                                max={1}
                                required={true}
                            />
                            <InputField
                                label='Practical Hours'
                                id='practicalHours'
                                value={formData.practicalHours}
                                onChange={handleChange}
                                type='number'
                                min={0}
                                step={2}
                                max={4}
                                required={true}
                                
                            />
                            <InputField
                                label='Academic Year'
                                id='academicYear'
                                value={formData.academicYear}
                                onChange={handleChange}
                                options={[
                                    { value: '2018-2019', label: '2018-2019' },
                                    { value: '2019-2020', label: '2019-2020' },
                                    { value: '2020-2021', label: '2020-2021' },
                                    { value: '2021-2022', label: '2021-2022' },
                                    { value: '2022-2023', label: '2022-2023' },
                                    { value: '2023-2024', label: '2023-2024' },
                                    { value: '2024-2025', label: '2024-2025' },
                                    { value: '2025-2026', label: '2025-2026' },
                                    { value: '2026-2027', label: '2026-2027' },    
                                ]}
                                required={true}
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

export default ProgramsUpdateModal;
