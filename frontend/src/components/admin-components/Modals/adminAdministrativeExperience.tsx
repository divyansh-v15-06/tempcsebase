import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Dialog, DialogOverlay, DialogContent } from '@reach/dialog'
import '@reach/dialog/styles.css'
import Select from 'react-select'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const InputField = ({
    label,
    value,
    onChange,
    id,
    type = 'text',
    disabled = false,
    minDate,
    required,
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
        ) : (
            <DatePicker
                selected={value as Date}
                onChange={(date: Date | null) =>
                    onChange({ target: { id, value: date || new Date() } })
                }
                dateFormat='dd/MM/yyyy'
                disabled={disabled}
                placeholderText='dd/mm/yyyy'
                className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                minDate={minDate || Date.now()}
                showYearDropdown
                required={required}
                scrollableYearDropdown
            />
        )}
    </div>
)

const AdminModal = ({ isOpen, onClose, onSubmit, addonFaculty = '' }) => {
    const [formData, setFormData] = useState({
        position: '',
        organisation: '',
        startDate: '',
        endDate: '',
        facultyId: addonFaculty,
        associatedFaculty: '',
    })
    const [faculties, setFaculties] = useState([])

    useEffect(() => {
        const fetchFaculties = async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/faculty/get?parmanent=true`,
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

    const handleChange = (e) => {
        const { id, value } = e.target
        setFormData((prev) => ({ ...prev, [id]: value }))
    }

    const handleAuthorChange = (selectedOptions) => {
        const selectedAuthors = selectedOptions.map((option) => option.value)
        // Join selected authors into a comma-separated string
        const associatedFacultyString = selectedAuthors.join(', ')
        setFormData((prev) => ({
            ...prev,
            associatedFaculty: associatedFacultyString,
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        // Include addonFaculty in the associatedFaculty string if it is provided
        const updatedFormData = {
            ...formData,
            associatedFaculty: formData.associatedFaculty
                ? `${formData.associatedFaculty}, ${addonFaculty}`.trim() // Append addonFaculty
                : addonFaculty, // If no existing faculty, just set addonFaculty
        }
        //clear the form data
        setFormData({
            position: '',
            startDate: '',
            endDate: '',
            organisation: '',
            facultyId: '',
            associatedFaculty: '',
        })

        console.log('formData', updatedFormData)
        onSubmit(updatedFormData)
    }
    console.log('faculties', faculties)

    const facultyOptions = faculties.map((faculty) => ({
        // @ts-ignore
        value: faculty.uniqueFacultyId,
        // @ts-ignore
        label: faculty.name,
    }))
    console.log('facultyOptions', facultyOptions)

    return (
        // @ts-ignore
        <Dialog isOpen={isOpen} onDismiss={onClose}>
            {/* @ts-ignore */}
            <DialogOverlay className='z-[1000]'>
                {/* @ts-ignore */}
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
                        Add New Administartive Experience
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className='grid grid-cols-1 gap-4'>
                            <InputField
                                label='Position Held'
                                id='position'
                                value={formData.position}
                                onChange={handleChange}
                                minDate={null}
                                required={true}
                            />
                            <InputField
                                label='Department/Organization'
                                id='organisation'
                                value={formData.organisation}
                                onChange={handleChange}
                                minDate={null}
                                required={true}
                            />
                            <div className='flex flex-col my-2'>
                                <label
                                    htmlFor='startDate'
                                    className='text-lg mb-1'
                                >
                                    Start Date:
                                </label>
                                <input
                                    type='date'
                                    id='startDate'
                                    className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    required={true}
                                />
                            </div>
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
                                            required={true}
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
                                            required={true}
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

export default AdminModal
