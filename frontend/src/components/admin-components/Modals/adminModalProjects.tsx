//@ts-nocheck
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
                    pattern="[0-9]*"

                />
            )
                : type === 'select' ? (
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
                ) : type === 'year' ? (
                    <DatePicker
                        required={required}
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
                            required={required}
                            minDate={minDate}
                            selected={value}
                            onChange={(date) => onChange({ target: { id, value: date } })}
                            showMonthYearPicker

                            dateFormat='MMM'
                            disabled={disabled}
                            placeholderText='Select Month'

                            className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        />
                    ) :
                        (
                            <DatePicker
                                required={required}

                                selected={value as Date}
                                dateFormat='dd/MM/yyyy'
                                onChange={(date: Date) =>
                                    onChange({ target: { id, value: date } })
                                }
                                disabled={disabled}
                                placeholderText='dd/mm/yyyy'
                                className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                            />
                        )
        }
    </div>
)
// const InputField = ({
//     label,
//     value,
//     onChange,
//     id,
//     type = 'text',
//     disabled = false,
//     minDate,
//     options,
// }) => (
//     <div className='flex flex-col my-2'>
//         <label htmlFor={id} className='text-lg mb-1'>
//             {label}:
//         </label>
//         {type === 'text' ? (
//             <input
//                 type='text'
//                 id={id}
//                 className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
//                 value={value}
//                 onChange={onChange}
//             />
//         ) : type === 'select' ? (
//             <Select
//                 id={id}
//                 value={options.find((option) => option.value === value)} // Ensure the selected option is passed correctly
//                 onChange={(selectedOption) =>
//                     onChange({ target: { id, value: selectedOption.value } })
//                 }
//                 options={options}
//                 className='basic-single'
//                 classNamePrefix='select'
//             />
//         ) : (
//             <DatePicker

//                 selected={value as Date}
//                 onChange={(date: Date) =>
//                     onChange({ target: { id, value: date } })
//                 }
//                 dateFormat='dd/MM/yyyy'
//                 disabled={disabled}
//                 placeholderText='dd/mm/yyyy'
//                 className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
//             />
//         )}
//     </div>
// )

const AdminModalProjects = ({
    isOpen,
    onClose,
    onSubmit,
    addonFaculty = '',
}) => {
    const [formData, setFormData] = useState({
        title: '',
        status: '',
        referenceNo: '',
        fundingAgency: '',
        fundingAmount: '',
        duration: '',
        year: '',
        month: '',
        academicSession: '',
        principalInvestigator: '',
        coprincipalInvestigator: '',
        authorName: '',
        monthtemp: '',
        yeartemp: '',
        fundingother: false,
    })
    const [faculties, setFaculties] = useState([])
    const [agency, setAgency] = useState([])

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
    useEffect(() => {
        const fetchAgency = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/project/fundingAgency`)
                setAgency(response.data.data)

            } catch (error) {
                console.log("Error in fetching funding agency:", error)
            }
        }
        fetchAgency()
    }, [])

    const handleChange = (e) => {
        const { id, value } = e.target
        if (id === 'fundingAmount' && /\D/.test(value)) return; 
        setFormData((prev) => ({ ...prev, [id]: value }))



    }

    const handleAuthorChange = (selectedOptions) => {
        const selectedAuthors = selectedOptions.map((option) => option.value)
        // Join selected authors into a comma-separated string
        const associatedFacultyString = selectedAuthors.join(', ')
        setFormData((prev) => ({
            ...prev,
            authorName: associatedFacultyString,
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        // Include addonFaculty in the authorName string if it is provided
        const requiredFields = [
            { field: 'academicSession', name: 'Academic Session' },
        ]

        // Check for empty required fields
        for (let { field, name } of requiredFields) {
            if (!formData[field]) {
                alert(`Please fill in the required field: ${name}`)
                return
            }
        }
        const updatedFormData = {
            ...formData,

            authorName: formData.authorName
                ? `${formData.authorName}, ${sessionStorage.getItem('userId')}`.trim() // Append addonFaculty
                : sessionStorage.getItem('userId'), // If no existing faculty, just set addonFaculty
        }
        console.log(updatedFormData);

        onSubmit(updatedFormData)
    }


    const facultyOptions = faculties.map((faculty) => ({
        // @ts-ignore

        value: faculty.uniqueFacultyId,
        // @ts-ignore

        label: faculty.name,
    }))

    // const months = [
    //     { value: '', label: 'Select Month' },
    //     { value: 'January', label: 'January' },
    //     { value: 'February', label: 'February' },
    //     { value: 'March', label: 'March' },
    //     { value: 'April', label: 'April' },
    //     { value: 'May', label: 'May' },
    //     { value: 'June', label: 'June' },
    //     { value: 'July', label: 'July' },
    //     { value: 'August', label: 'August' },
    //     { value: 'September', label: 'September' },
    //     { value: 'October', label: 'October' },
    //     { value: 'November', label: 'November' },
    //     { value: 'December', label: 'December' },
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
    ]

    // const year = [
    //     { value: '', label: 'Year of Sanction' },
    //     { value: '2010', label: '2010' },
    //     { value: '2011', label: '2011' },
    //     { value: '2012', label: '2012' },
    //     { value: '2013', label: '2013' },
    //     { value: '2014', label: '2014' },
    //     { value: '2015', label: '2015' },
    //     { value: '2016', label: '2016' },
    //     { value: '2017', label: '2017' },
    //     { value: '2018', label: '2018' },
    //     { value: '2019', label: '2019' },
    //     { value: '2020', label: '2020' },
    //     { value: '2021', label: '2021' },
    //     { value: '2022', label: '2022' },
    //     { value: '2023', label: '2023' },
    //     { value: '2024', label: '2024' },
    // ]

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
                        Add New Project
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className='grid grid-cols-1 gap-4'>
                            <div className='flex flex-col my-2'>
                                <label className='text-lg mb-1'>Status:</label>
                                <Select
                                    onChange={(option) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            // @ts-ignore
                                            status: option.value,
                                        }))
                                    }}
                                    options={[
                                        {
                                            value: 'Ongoing',
                                            label: 'Ongoing',
                                        },
                                        {
                                            value: 'Completed',
                                            label: 'Completed',
                                        },
                                    ]}
                                    className='basic-single'
                                    classNamePrefix='select'
                                    required={true}
                                />
                            </div>
                            <InputField
                                label='Title'
                                id='title'
                                value={formData.title}
                                onChange={handleChange}
                                required={true}
                            />
                            <InputField
                                label='Reference No.'
                                id='referenceNo'
                                value={formData.referenceNo}
                                onChange={handleChange}
                                required={true}
                            />

                            <InputField
                                label='Duration (in Months)'
                                id='duration'
                                type='number'
                                required={true}
                                value={formData.duration}
                                onChange={handleChange}
                            />
                            <div className='flex flex-col my-2'>
                                <label className='text-lg mb-1'>Funding Agency:</label>
                                <Select
                                    required={true}
                                    value={agency.map((agency) => ({
                                        value: agency,
                                        label: agency,
                                    })).find(
                                        (option) => option.value === formData.fundingAgency,
                                    )}
                                    options={[...agency.map((agency) => ({
                                        value: agency,
                                        label: agency,
                                    })), {
                                        value: "Other",
                                        label: "Others",
                                    }]
                                    }

                                    onChange={(option) => {
                                        if (option.value === "Other") {
                                            setFormData((prev) => ({
                                                ...prev,
                                                fundingother: true,
                                                fundingAgency: ''
                                            }))
                                        } else {
                                            setFormData((prev) => ({
                                                ...prev,
                                                fundingAgency: option.value,
                                                fundingother: false,
                                            }))
                                        }
                                    }
                                    }
                                    className='basic-single'
                                    classNamePrefix='select'
                                />
                            </div>
                            {formData.fundingother && <InputField
                                label='Funding Agency'
                                id='fundingAgency'
                                placeholder="Other Funding Agency"
                                value={formData.fundingAgency}
                                onChange={handleChange}
                                required={true}
                            />}
                            <InputField
                                type='number'
                                label='fundingAmount'
                                id='fundingAmount'
                                value={formData.fundingAmount}
                                onChange={handleChange}
                                required={true}
                            />


                            {/* <InputField


                            <InputField
                                type='select'
                                options={year}
                                label='Year of sanction'
                                id='year'
                                value={formData.year}
                                onChange={handleChange}
                                required
                            /> */}


                            {/* <InputField
                            />
                            <InputField
                                type='select'
                                options={months}
                                label='Month of sanction'
                                id='month'
                                value={formData.month}
                                onChange={handleChange}
                                required
                            /> */}
                            {/* <InputField
                                type='month' // Use the month calendar
                                label='Select Month'
                                id='month'
                                value={formData.month}
                                onChange={handleChange}
                                required
                            /> */}
                            <InputField
                                type='month' // Use the month calendar
                                required={true}
                                label='Select Month'
                                id='month'
                                value={formData.monthtemp}
                                onChange={(e) => {
                                    const date = new Date(e.target.value);
                                    const months = [
                                        'January',
                                        'February',
                                        'March',
                                        'April',
                                        'May',
                                        'June',
                                        'July',
                                        'August',
                                        'September',
                                        'October',
                                        'November',
                                        'December',
                                    ];
                                    setFormData((prev) => ({
                                        ...prev,
                                        month: months[date.getMonth()],
                                        monthtemp: e.target.value,

                                    }));
                                }}

                            />
                            <InputField

                                type="year"
                                required={true}
                                label="Select Year"
                                id="year"
                                value={formData.yeartemp}
                                onChange={(e) => {
                                    const date = new Date(e.target.value);
                                    setFormData((prev) => ({
                                        ...prev,
                                        year: date.getFullYear(),
                                        yeartemp: e.target.value,
                                    }));
                                }}
                            />
                            <InputField
                                type='select'
                                options={years}
                                required={true}
                                label='Academic session'
                                id='academicSession'
                                value={formData.academicSession}
                                onChange={handleChange}


                            />
                            <InputField
                                label='Principal investigator (PI)'
                                id='principalInvestigator'
                                value={formData.principalInvestigator}
                                onChange={handleChange}
                                required={true}
                            />
                            <InputField
                                label='Co-principal investigator (Co-PI)'
                                id='coprincipalInvestigator'
                                value={formData.coprincipalInvestigator}
                                onChange={handleChange}
                                // required={true}
                            />
                            <div className='flex flex-col my-2'>
                                <label className='text-lg mb-1'>
                                    Associated COPI&apos;S:
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

export default AdminModalProjects
