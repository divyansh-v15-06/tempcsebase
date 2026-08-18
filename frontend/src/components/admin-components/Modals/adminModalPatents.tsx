//@ts-nocheck
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Dialog, DialogOverlay, DialogContent } from '@reach/dialog'
import '@reach/dialog/styles.css'
import Select from 'react-select'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { fork } from 'child_process'

// const months=[
//     {value:"01",label:"January"},
//     {value:"02",label:"February"},
//     {value:"03",label:"March"},
//     {value:"04",label:"April"},
//     {value:"05",label:"May"},
//     {value:"06",label:"June"},
//     {value:"07",label:"July"},
//     {value:"08",label:"August"},
//     {value:"09",label:"September"},
//     {value:"10",label:"October"},
//     {value:"11",label:"November"},
//     {value:"12",label:"December"}
// ]

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
];


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
                required={required}
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
                required={required}
                className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
        ) : type === 'month' ? (
            <DatePicker
                minDate={minDate}
                required={required}
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
                required={required}
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
const AdminModalPatents = ({
    isOpen,
    onClose,
    onSubmit,
    addonFaculty = '',
    existingData = {},
}) => {
    const [formData, setFormData] = useState({
        title: existingData.title || '',
        status: existingData.status || '',
        year: existingData.year || '',
        month: existingData.month || '',
        place: existingData.place || '',
        facultyNames: existingData.facultyNames || '',
        filledDate: existingData.filledDate || '',
        grantedDate: existingData.grantedDate || '',
        academicSession: existingData.academicSession || '',
        referenceNo: existingData.referenceNo || '',
        authorName: existingData.authorName || '',
    })

    const [faculties, setFaculties] = useState([])

    useEffect(() => {
        const fetchFaculties = async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/faculty/get?parmanent=true`,
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
        const associatedFacultyString = selectedAuthors.join(', ')
        setFormData((prev) => ({
            ...prev,
            facultyNames: associatedFacultyString,
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        const requiredFields = [
            'title',
            'status',
            'place',
            'filledDate',
            'academicSession',
            'referenceNo',
        ]

        const hasEmptyRequiredFields = requiredFields.some(
            (field) => !formData[field],
        )

        if (hasEmptyRequiredFields) {
            alert('Please fill in all required fields.')
            return
        }

        const updatedFormData = {
            ...formData,
            facultyNames: formData.facultyNames
                ? `${formData.facultyNames}, ${sessionStorage.getItem('userId').trim()}`
                : sessionStorage.getItem('userId'),
        }

        onSubmit(updatedFormData)
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
                        Add New Patents
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className='grid grid-cols-1 gap-4'>
                            <InputField
                                label='Patent Title'
                                id='title'
                                value={formData.title}
                                onChange={handleChange}
                                required={true}
                            />
                            <div className='flex flex-col my-2'>
                                <label className='text-lg mb-1'>Status:</label>
                                <Select
                                    onChange={(option) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            status: option.value,
                                        }))
                                    }
                                    options={[
                                        {
                                            value: 'Published',
                                            label: 'Published',
                                        },
                                        { value: 'Granted', label: 'Granted' },
                                    ]}
                                    className='basic-single'
                                    classNamePrefix='select'
                                    required={true}
                                />
                            </div>


                            {/* <InputField
                                type='select'
                                options={year}
                                label='Year of filing patent'
                                id='year'
                                value={formData.year}
                                onChange={handleChange}
                                required
                            /> */}
                            {/* <InputField
                                type='select'
                                options={months}
                                label='Month of filing patent'
                                id='month'
                                value={formData.month}
                                onChange={handleChange}
                                required
                            /> */}
                            {/* <InputField
                                type="month"
                                label="Select Month"
                                id="month"
                                value={formData.month}
                                onChange={handleChange}
                                required
                                options={months}
                            /> */}
                            

                            <InputField
                                label='Awarding agency'
                                id='place'
                                value={formData.place}
                                onChange={handleChange}

                                required={true}
                            />
                            <InputField
                                type='date'
                                label='Filed date'
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
                                required={true}
                            />
                            {formData.status==='Granted'&&<InputField
                                type='date'
                                required={true}
                                label='Granted date'
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
                            />}
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
                                label='Application No'
                                id='referenceNo'
                                value={formData.referenceNo}
                                onChange={handleChange}
                                required={true}
                            />
                            <InputField
                                label='Inventor'
                                id='authorName'
                                value={formData.authorName}
                                onChange={handleChange}
                                required={true}
                            />

                            <div className='flex flex-col my-2'>
                                <label className='text-lg mb-1'>
                                    Associated Faculty:
                                </label>
                                <Select
                                    isMulti
                                    options={facultyOptions}
                                    onChange={handleAuthorChange}
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

export default AdminModalPatents
