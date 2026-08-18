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
    minDate,
    disabled,
    required,
}) => (
    <div className="flex flex-col my-2">
        <label htmlFor={id} className="text-lg mb-1">
            {label}:
        </label>
        {type === 'date' ? (
            <DatePicker
                minDate={minDate}

                selected={value ? new Date(value) : null}
                onChange={(date) =>
                    onChange({ target: { id, value: date } })
                }
                disabled={disabled}
                required={required}
                placeholderText="dd/mm/yyyy"
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        ) : type === 'year' ? (
                    <DatePicker
                         minDate={minDate}
                         required={required}
                        selected={value as Date}
                        onChange={(date: Date | null) => onChange({ target: { id, value: date } })}
                        showYearPicker
                        dateFormat="yyyy"
                        disabled={disabled}
                        placeholderText="yyyy"
                        className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                ) :
        (
            <input
                type={type}
                id={id}
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={value}
                onChange={onChange}
                disabled={disabled}
                required={required}
            />
        )}
    </div>
);

const SelectField = ({ label, value, onChange, id, options,required }) => (
    <div className="flex flex-col my-2">
        <label htmlFor={id} className="text-lg mb-1">
            {label}:
        </label>
        <Select
            options={options}
            required={required}
            value={options.find(option => option.value === value)}
            onChange={(selectedOption) => onChange({ target: { id, value: selectedOption.value } })}
            className="basic-select"
            classNamePrefix="select"
        />
    </div>
);

const AdminModalResearchSupervision = ({
    isOpen,
    onClose,
    onSubmit,
    addonFaculty = '',
}) => {
    const [formData, setFormData] = useState({
        program: '',
        scholarName: '',
        rollNo: '',
        researchTopic: '',
        status: '',
        year: '',
        academicSession: '',
        coSupervisior: '',
        associatedFaculty: '',
        yeartemp : '',
    })
    // const [faculties, setFaculties] = useState([])
    const [faculties, setFaculties] = useState<Faculty[]>([])

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

    // const handleSelectChange = (selectedOption, { name }) => {
    //     setFormData((prev) => ({ ...prev, [name]: selectedOption.value }))
    // }
    const handleSelectChange = (selectedOption, actionMeta) => {
        const { name } = actionMeta
        if (selectedOption) {
            setFormData((prev) => ({ ...prev, [name]: selectedOption.value }))
        }
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
        const date =new Date(formData.year);
        const updatedFormData = {
            ...formData,
            year:date.getFullYear(),
            associatedFaculty: formData.associatedFaculty
                ? `${formData.associatedFaculty}, ${sessionStorage.getItem('userId')}`.trim() // Append addonFaculty
                : sessionStorage.getItem('userId'), // If no existing faculty, just set addonFaculty
        }
        console.log(updatedFormData);
        
        onSubmit(updatedFormData)
        onClose()
        setFormData({
            program: '',
            scholarName: '',
            rollNo: '',
            researchTopic: '',
            status: '',
            year: '',
            academicSession: '',
            coSupervisior: '',
            associatedFaculty: '',
            yeartemp : '',
        })
    
    }

    const facultyOptions = faculties.map((faculty) => ({
        value: faculty.uniqueFacultyId,
        label: faculty.name,
    }))

    const programOptions = [
        { value: '1', label: 'M.Tech' },
        { value: '2', label: 'Ph.D' },
    ]

    const statusOptions = [
        { value: 'Ongoing', label: 'Ongoing' },
        { value: 'Completed', label: 'Completed' },
    ]
    
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

    return (
        // @ts-ignore
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
                Add New Research Supervision
            </h2>
            <form onSubmit={handleSubmit}>
                <div className='grid grid-cols-1 gap-4'>
                    <div className='flex flex-col my-2'>
                        <label className='text-lg mb-1'>Program:</label>
                        <Select
                            options={programOptions}
                            onChange={handleSelectChange}
                            name='program'
                            className='basic-select'
                            classNamePrefix='select'
                            required={true}
                        />
                    </div>
                    <InputField
                        label='Scholar Name'
                        id='scholarName'
                        required={true}
                        value={formData.scholarName}
                        onChange={handleChange}
                        minDate={null}
                        disabled={false}                  />
                    <InputField
                        label='Roll No'
                        id='rollNo'
                        value={formData.rollNo}
                        required={true}
                        onChange={handleChange} minDate={undefined} disabled={undefined}                    />
                    <InputField
                        label='Research Topic'
                        id='researchTopic'
                        value={formData.researchTopic}
                        onChange={handleChange} minDate={undefined} disabled={undefined} required={true}                    />
                    <div className='flex flex-col my-2'>
                
            
               <InputField
                               
                            type="year"
                            label="Select Year"
                            id="year"
                            value={formData.year}
                            onChange={handleChange}
                            required={true} minDate={undefined} disabled={undefined}                            />
                 
                 <SelectField
                                label='Academic session'
                                id='academicSession'
                                value={formData.academicSession}
                                onChange={handleChange}
                                options={years}
                                required={true}
                            />
                 <SelectField
                                label='Status'
                                id='status'
                                value={formData.status}
                                onChange={handleChange}
                                options={statusOptions}
                                required={true}
                            />
                    <InputField
                            label='Co Supervisors'
                            id='coSupervisior'
                            value={formData.coSupervisior}
                            onChange={handleChange} minDate={undefined} disabled={undefined} required={undefined}                    />
                    <div className='flex flex-col my-2'>
                        <label className='text-lg mb-1'>
                            Associated Faculties:
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

export default AdminModalResearchSupervision