//@ts-nocheck
import React, { useState, useEffect } from 'react'
import { Dialog, DialogOverlay, DialogContent } from '@reach/dialog'
import '@reach/dialog/styles.css'
import { Button } from '@/components/ui/button'
import Select from 'react-select'
import axios from 'axios'
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
    // options = months
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
        ) : type === 'month' ? (
            <DatePicker
                minDate={minDate}
                selected={value}
                onChange={(date) => onChange({ target: { id, value: date } })}
                showMonthYearPicker

                dateFormat='MMM'
                disabled={disabled}
                placeholderText='Select Month'


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
                className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
        )}
    </div>
)

const years = [
    { value: "", label: "Select Academic Session" },
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
];

const PatentUpdateModal = ({ isOpen, onClose, onSubmit, initialData = {} }) => {
    const [formData, setFormData] = useState({
        title: '',
        status: '',
        year: null,
        place: '',
        referenceId: '',
        authorName: '',
        faculties: [],
        month: null,
    })
    const [facultyList, setFacultyList] = useState([])

    useEffect(() => {
        if (isOpen) {
            // Pre-fill form with initial data if modal is open
            setFormData({
                title: initialData.title || '',
                status: initialData.status || '',
                academicSession: initialData.academicSession || '',
                year: initialData.year ||'',
                place: initialData.place || '',
                referenceId: initialData.referenceNo || "",
                authorName: initialData.authorName || '',
                filledDate: initialData.filledDate || '',
                grantedDate: initialData.grantedDate||'',
                month: initialData.month || '',
                faculties: initialData.faculties
                    ? initialData.faculties.map((faculty) => faculty.id)
                    : [],
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

    const handleChange = (e) => {
        const { id, value } = e.target
        setFormData((prev) => ({ ...prev, [id]: value }))
    }

    const handleFacultyChange = (selectedOptions) => {
        const selectedFaculties = selectedOptions.map((option) => option.value)
        setFormData((prev) => ({ ...prev, faculties: selectedFaculties }))
    }

    const handleStatusChange = (option) => {
        setFormData((prev) => ({ ...prev, status: option.value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const updatedFormData = {
            ...formData,
        }
        onSubmit(updatedFormData, initialData.id)
        onClose()
    }

    const facultyOptions = facultyList.map((faculty) => ({
        value: faculty.id,
        label: faculty.name,
    }))

    const statusOptions = [
        { value: 'Published', label: 'Published' },
        { value: 'Granted', label: 'Granted' },
    ]

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
                        {initialData.id ? 'Update Patent' : 'Add New Patent'}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className='grid grid-cols-1 gap-4'>
                            <InputField
                                label='1. Patent Title'
                                id='title'
                                value={formData.title}
                                onChange={handleChange}
                            />
                            <div className='flex flex-col my-2'>
                                <label className='text-lg mb-1'>
                                    2.  Associated Faculty:
                                </label>
                                <Select
                                    isMulti
                                    value={facultyOptions.filter((option) =>
                                        formData.faculties.includes(
                                            option.value,
                                        ),
                                    )}
                                    options={facultyOptions}
                                    onChange={handleFacultyChange}
                                    className='basic-multi-select'
                                    classNamePrefix='select'
                                />
                            </div>
                            <div className='flex flex-col my-2'>
                                <label className='text-lg mb-1'>
                                    3. Status:
                                </label>
                                <Select
                                    value={statusOptions.find(
                                        (option) =>
                                            option.value === formData.status,
                                    )}
                                    options={statusOptions}
                                    onChange={handleStatusChange}
                                    className='basic-single'
                                    classNamePrefix='select'
                                />
                            </div>
                            <InputField
                                label='4. Aplication No.'
                                id='referenceId'
                                value={formData.referenceId}
                                onChange={handleChange}
                            />
                            <InputField
                                label='5 Awarding agency'
                                id='place'
                                value={formData.place}
                                onChange={handleChange}
                            />
                            <InputField
                                type='date'
                                label='6. Filed date'
                                id='filedDate'
                                value={formData.filledDate}
                                onChange={(e) => {
                                    const date = new Date(e.target.value);
                                    setFormData((prev) => ({
                                        ...prev,
                                        filledDate: date,
                                        year: date.getFullYear(),
                                        month: date.toLocaleString('default', {
                                            month: 'short',
                                        }),
                                    }));
                                }}
                                required
                            />
                            <InputField
                                type='date'
                                label='7. Granted date'
                                id='grantedDate'
                                value={formData.grantedDate}
                                onChange={(e) => {
                                    const date = new Date(e.target.value);
                                    setFormData((prev) => ({
                                        ...prev,
                                        grantedDate: date,
                                    }));

                                }
                                }
                                minDate={formData.filedDate}
                            />
                            <InputField
                                type='select'
                                options={years}
                                label='8. Academic session'
                                id='academicSession'
                                value={formData.academicSession}
                                onChange={handleChange}
                                required
                            />
                            <InputField
                                label='9. Inventor'
                                id='authorName'
                                value={formData.authorName}
                                onChange={handleChange}
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

export default PatentUpdateModal
