//@ts-nocheck
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Dialog, DialogOverlay, DialogContent } from '@reach/dialog'
import '@reach/dialog/styles.css'
import Select from 'react-select'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" }
]

const InputField = ({
    label,
    value,
    onChange,
    id,
    type = "text",
    disabled = false,
    minDate,
    options,
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
                required={required}
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
                required={required}
                className='basic-single'
                classNamePrefix='select'
            />
        ) :type==='number'?(
            <input
                type='number'
                id={id}
                className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                value={value}
                required={required}
                onChange={onChange}
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
                required={required} 
                disabled={disabled}
                placeholderText='yyyy'
                className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
        )
        // ) : type === 'month' ? (
        //     <Select
        //         id={id}
        //         value={options.find(option => option.value === value)}
        //         onChange={(selectedOption) => onChange({ target: { id, value: selectedOption.value } })}
        //         className="basic-single"
        //         options={options}
        //         classNamePrefix="select"
        //     />
        // ) :
        : type === 'month' ? (
                    <DatePicker
                        minDate={minDate}
                        selected={value}
                        onChange={(date) => onChange({ target: { id, value: date } })}
                        showMonthYearPicker
                        required={required}

                        dateFormat='MMM'
                        disabled={disabled}
                        placeholderText='Select Month'


                        className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                ) :
            (
                <DatePicker

                    selected={value as Date}
                    onChange={(date: Date) => onChange({ target: { id, value: date } })}
                    dateFormat="dd/MM/yyyy"
                    disabled={disabled}
                    required={required}
                    placeholderText="dd/mm/yyyy"
                    className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
            )}
    </div>
)

const AdminModalConsultancies = ({
    isOpen,
    onClose,
    onSubmit,
}) => {
    const [formData, setFormData] = useState({
        title: '',
        status: '',
        startYear: '',
        associatedFaculty: '',
        clientOrganisation: '',
        academicSession: '',
        referenceNo: '',
        authorName: '',
        referenceNo: '', 
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
            facultyNames: associatedFacultyString,
        }))
    }

    const handleStatusChange = (selectedOption) => {
        setFormData((prev) => ({
            ...prev,
            status: selectedOption.value,
        }))
    }

    const handleAssociatedFacultyChange = (selectedOptions) => {
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
        // Include addonFaculty in the facultyNames string if it is provided
        const updatedFormData = {
            ...formData,
            month: formData.month || null,
            associatedFaculty: formData.associatedFaculty
                ? `${formData.associatedFaculty}, ${sessionStorage.getItem('userId').trim()}` // Append addonFaculty
                : sessionStorage.getItem('userId'), // If no existing faculty, just set addonFaculty
        }
        onSubmit(updatedFormData)
    }

    console.log('faculties', faculties)

    const statusOptions = [
        { value: 'ongoing', label: 'Ongoing' },
        { value: 'completed', label: 'Completed' },
    ]

    const facultyOptions = faculties.map((faculty) => ({
        // @ts-ignore

        value: faculty.uniqueFacultyId,
        // @ts-ignore

        label: faculty.name,
    }))
    console.log('facultyOptions', facultyOptions)


    const years = [
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
                        Add New Consultancy
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className='grid grid-cols-1 gap-4'>
                            <div className='flex flex-col my-2'>
                                <Select
                                    options={statusOptions}
                                    onChange={handleStatusChange}
                                    className='basic-single-select'
                                    classNamePrefix='select'
                                    required={true}
                                />
                            </div>
                            <InputField
                                label='Title'
                                id='title'
                                value={formData.title}
                                required={true}
                                onChange={handleChange}
                            />
                            <InputField
                                label='Client Organization'
                                id='clientOrganisation'
                                value={formData.clientOrganisation}
                                onChange={handleChange}
                                required={true}
                            />
                            <InputField
                                label='Amount (INR)'
                                id='amount'
                                type='number'
                                required={true}
                                value={formData.amount}
                                onChange={handleChange}
                            />
                            <InputField
                                label='Reference No'
                                id='referenceNo'
                                required={true}
                                value={formData.referenceNo}
                                onChange={handleChange}
                            />

                            <InputField

                                type="year"
                                label="Start Year"
                                id="startYear"
                                required={true}
                                value={formData.startYear}
                                onChange={(e)=>{
                                    const date= new Date(e.target.value)
                                    setFormData((prev) => ({ ...prev, startYear: date.getFullYear().toString() }))
                                }}
                                
                            />
                            {/* <InputField
                                type = 'select'
                                label='Month'
                                id='month'
                                value={formData.month}
                                onChange={handleChange}
                                options={months}
                            /> */}

                            <InputField
                                type='select'
                                options={years}
                                label='Academic session'
                                id='academicSession'
                                value={formData.academicSession}
                                onChange={handleChange}
                                required={true}
                            />
                            <InputField
                                type='text'
                                label='Author Name'
                                id='authorName'
                                value={formData.authorName}
                                onChange={handleChange}
                            />
                            
                            <div className='flex flex-col my-2'>
                                <label className='text-lg mb-1'>
                                    Associated Faculty:
                                </label>
                                <Select
                                    isMulti
                                    options={facultyOptions}
                                    onChange={handleAssociatedFacultyChange}
                                    className='basic-multi-select'
                                    classNamePrefix='select'
                                />
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

export default AdminModalConsultancies
