//@ts-nocheck
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Dialog } from '@reach/dialog'
import '@reach/dialog/styles.css'
import Select from 'react-select'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

type Faculty = {
    uniqueFacultyId: string
    name: string
}

const InputField = ({
    label,
    value,
    onChange,
    id,
    type = 'text',
    disabled = false,
    minDate,
    options,
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
                value={options.find((option) => option.value === value)} // Ensure the selected option is passed correctly
                onChange={(selectedOption) =>
                    onChange({ target: { id, value: selectedOption.value } })
                }
                options={options}
                className='basic-single'
                classNamePrefix='select'
            />
        ) : type === 'year' ? (
            <DatePicker
                minDate={minDate}
                selected={value as Date}
                onChange={(date: Date) =>
                    onChange({ target: { id, value: date } })
                }
                showYearPicker
                dateFormat='yyyy'
                disabled={disabled}
                placeholderText='yyyy'
                className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
        ) : (
            <DatePicker
                selected={value as Date}
                onChange={(date: Date) =>
                    onChange({ target: { id, value: date } })
                }
                dateFormat='dd/MM/yyyy'
                disabled={disabled}
                placeholderText='dd/mm/yyyy'
                minDate={minDate || Date.now()}
                showYearDropdown
                scrollableYearDropdown
                className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
        )}
    </div>
)

const ExpertTalkUpdateModal = ({
    isOpen,
    onClose,
    onSubmit,
    addonFaculty = '',
    initialData = null, // New prop to provide initial values
}) => {
    const [formData, setFormData] = useState({
        title: '',
        venue: '',
        startDate: '',
        endDate: '',
        academicSession: '',
        facultyId: '',
        description: '',
    })

    const [faculties, setFaculties] = useState<Faculty[]>([])

    useEffect(() => {
        const fetchFaculties = async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/faculty/get?parmanent=true`,
                )
                console.log('value is', response.data.data)
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

    useEffect(() => {
        console.log('initialData', initialData)

        if (initialData) {
            setFormData({
                title: initialData.title || '',
                venue: initialData.venue || '',
                startDate: initialData.startDate || '',
                endDate: initialData.endDate || '',
                academicSession: initialData.academicSession || '',
                facultyId: initialData.facultyId || '',
                description: initialData.description || '',
            })
        }
    }, [initialData])

    const handleChange = (e) => {
        const { id, value } = e.target
        setFormData((prev) => ({ ...prev, [id]: value }))
    }

   
    const handleSubmit = (e) => {
        e.preventDefault()
        const updatedFormData = {
            ...formData,

        }
        
        
        onSubmit(updatedFormData, initialData.id)
        onClose()
    }


    const years = [
        { value: '', label: 'Select Academic Session' },
        { value: '2010-2011', label: '2010-2011' },
        { value: '2011-2012', label: '2011-2012' },
        { value: '2012-2013', label: '2012-2013' },
        { value: '2013-2014', label: '2013-2014' },
        { value: '2014-2015', label: '2014-2015' },
        { value: '2015-2016', label: '2015-2016' },
        { value: '2016-2017', label: '2016-2017' },
        { value: '2017-2018', label: '2017-2018' },
        { value: '2018-2019', label: '2018-2019' },
        { value: '2019-2020', label: '2019-2020' },
        { value: '2020-2021', label: '2020-2021' },
        { value: '2021-2022', label: '2021-2022' },
        { value: '2022-2023', label: '2022-2023' },
        { value: '2023-2024', label: '2023-2024' },
        { value: '2024-2025', label: '2024-2025' },
        { value: '2025-2026', label: '2025-2026' },
    ]

    return (
        <Dialog
            isOpen={isOpen}
            onDismiss={onClose}
            className='bg-white p-6 rounded-lg shadow-lg w-full max-w-md'
        >
            <button
                onClick={onClose}
                className='absolute top-4 right-4 text-xl text-gray-600 hover:text-gray-800'
                aria-label='Close'
            >
                &times;
            </button>
            <h2 id='dialog-title' className='text-2xl mb-4'>
                Update Expert Talk
            </h2>
            <form onSubmit={handleSubmit}>
                <div className='grid grid-cols-1 gap-4'>
                    <InputField
                        label='Title'
                        id='title'
                        value={formData.title}
                        onChange={handleChange}
                    />
                    <InputField
                        label='Venue'
                        id='venue'
                        value={formData.venue}
                        onChange={handleChange}
                    />
                    <div className='flex flex-col my-2'>
                        <label
                            htmlFor='startDate'
                            className='text-lg mb-1'
                        >
                            Start Date:
                        </label>
                        <input
                            id='startDate'
                            type='date'
                            className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow'
                            value={formData.startDate}
                            onChange={handleChange}
                        />
                    </div>
                    {/* <div className="flex items-end space-x-2">
                        <InputField
                            type="date"
                            label='End Date'
                            id='endDate'
                            value={formData.isOngoing ? null : formData.endDate}
                            onChange={handleChange}
                            minDate={formData.startDate}
                            disabled={formData.isOngoing}
                        />

                    </div> */}
                    <div className='flex flex-col my-2'>
                        <label
                            htmlFor='endDate'
                            className='text-lg mb-1'
                        >
                            End Date:
                        </label>
                        <div className='flex items-center'>
                            {formData.endDate === 'Present' ? (
                                <input
                                    id='endDate'
                                    type='text'
                                    readOnly
                                    className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow'
                                    value='Present'
                                />
                            ) : (
                                <input
                                    id='endDate'
                                    type='date'
                                    className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow'
                                    value={formData.endDate}
                                    onChange={handleChange}
                                />
                            )}
                            <label className='ml-2 flex items-center'>
                                <input
                                    type='checkbox'
                                    id='present'
                                    className='mr-2'
                                    checked={
                                        formData.endDate === 'Present'
                                    }
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            endDate: e.target.checked
                                                ? 'Present'
                                                : '',
                                        }))
                                    }
                                />
                                Present
                            </label>
                        </div>
                    </div>
                    {/* <div className="flex items-end space-x-2">
                        <InputField
                            type="date"
                            label='End Date'
                            id='endDate'
                            value={formData.isOngoing ? null : formData.endDate}
                            onChange={handleChange}
                            minDate={formData.startDate}
                            disabled={formData.isOngoing}
                        />

                    </div> */}
                    
                    {/* <InputField
                        label='Academic Session'
                        id='academicSession'
                        value={formData.academicSession}
                        onChange={handleChange}
                    /> */}
                    <InputField
                        type='select'
                        options={years}
                        label='Academic session'
                        id='academicSession'
                        value={formData.academicSession}
                        onChange={handleChange}
                        required
                    />
                    
                    <InputField
                        label='Description'
                        id='description'
                        value={formData.description}
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
            </form>
        </Dialog>
    )
}

export default ExpertTalkUpdateModal
