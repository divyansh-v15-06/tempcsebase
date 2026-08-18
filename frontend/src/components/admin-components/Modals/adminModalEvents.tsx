//@ts-nocheck
import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Dialog, DialogOverlay, DialogContent } from '@reach/dialog'
import '@reach/dialog/styles.css'
import Select from 'react-select'
import { uploadToCloudinary } from '@/lib/utils'
import favicon from '../../../app/favicon.ico'

import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { position } from 'html2canvas/dist/types/css/property-descriptors/position'

const InputField = ({
    label,
    value,
    onChange,
    id,
    type = "text",
    disabled = false,
    minDate,
    options
    ,required = false
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
                value={options.find(option => option.value === value)} // Ensure the selected option is passed correctly
                onChange={(selectedOption) => onChange({ target: { id, value: selectedOption.value } })}
                options={options}
                className="basic-single"
                classNamePrefix="select"
                required={required}
            />
        ) : type === 'year' ? (
            <DatePicker
                minDate={minDate}
                selected={value as Date}
                onChange={(date: Date) => onChange({ target: { id, value: date } })}
                showYearPicker
                dateFormat="yyyy"
                disabled={disabled}
                required={required}
                placeholderText="yyyy"
                className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
        ) : (
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
);


const AdminModalEvents = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        title: '',
        type: '',
        category: '',
        venue: '',
        sponsoringAgency: '',
        startDate: '',
        academicSession: '',
        endDate: '',
        associatedFaculty: '',
        Convenor: '',
        Coordinator: '',
        Link: '',
        authorName: '__',
        position1: '',
        position2: '',
        positionother1: '',
        positionother2: '',
    })
    const [faculties, setFaculties] = useState([])
    const imageRef = useRef<HTMLInputElement>()
    const [image, setImage] = useState()
    const [addonFaculty, setAddonFaculty] = useState('')

    useEffect(() => {
        setAddonFaculty(sessionStorage.getItem('userId') || '')
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
        const { id, value, files } = e.target
        setFormData((prev) => ({ ...prev, [id]: value }))
        if (files && files.length > 0) {
            setImage(files[0]) // Update the image state with the first file
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const addonFaculty = sessionStorage.getItem('userId') || ''
      
        // Format Convenor
        const convenorFormatted = formData.Convenor
          .split(',')
          .map((val) =>
            val.trim() + ` (${formData.position1 === "Other" ? formData.positionother1 : formData.position1})`
          )
          .join(', ');
      
        // Format Coordinator
        const coordinatorFormatted = formData.Coordinator
          .split(',')
          .map((val) =>
            val.trim() + ` (${formData.position2 === "Other" ? formData.positionother2 : formData.position2})`
          )
          .join(', ');
      
        // Combine associated faculty and addonFaculty
        const updatedFormData = {
          ...formData,
          Convenor: convenorFormatted,
          Coordinator: coordinatorFormatted,
          associatedFaculty: formData.associatedFaculty
            ? `${formData.associatedFaculty}, ${addonFaculty}`.trim()
            : addonFaculty,
        };
      
        onSubmit(updatedFormData);
      };
      

    const facultyOptions = faculties.map((faculty) => ({
        // @ts-ignore
        value: faculty.uniqueFacultyId,
        // @ts-ignore
        label: faculty.name,
    }))

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
    const posts = [
        { value: "Chairman", label: "Chairman" },
        { value: "Convenor", label: "Convenor" },
        { value: "Coordinator", label: "Coordinator" },
        { value: "Organizing Secretary", label: "Organizing Secretary" },
        { value: "Other", label: "Other" },
    ]
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
                        Add New Event
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className='grid grid-cols-1 gap-4'>
                            <InputField
                                label='Title'
                                id='title'
                                value={formData.title}
                                onChange={handleChange}
                                required={true}
                            />
                            <InputField
                                type='select'
                                label='Type'
                                id='type'
                                options={types}
                                value={types.find(option => option.value === formData.type)}
                                onChange={handleChange}
                                required={true}
                            />
                            <InputField
                                label='Category'
                                id='category'
                                type='select'
                                options={categories}
                                value={categories.find(option => option.value === formData.category)}
                                onChange={handleChange}
                                required={true}
                            />
                            <InputField
                                label='Venue'
                                id='venue'
                                value={formData.venue}
                                onChange={handleChange}
                                required={true}
                            />
                            <InputField
                                label='Sponsoring agency'
                                id='sponsoringAgency'
                                value={formData.sponsoringAgency}
                                onChange={handleChange}

                                required={true}
                            />
                            <InputField
                                type='date'
                                label='Start date'
                                id='startDate'
                                required={true}
                                value={formData.startDate}
                                onChange={(e) => {
                                    const date = new Date(e.target.value);
                                    setFormData((prev) => ({ ...prev, startDate: date}));
                                }}
                            />
                            <div className='flex items-end space-x-2'>
                                <InputField
                                    type='date'
                                    label='End Date'
                                    id='endDate'
                                    required={formData.isOngoing ? false : true}
                                    value={
                                        formData.isOngoing
                                            ? null
                                            : formData.endDate
                                    }
                                    onChange={(e) => {
                                        const date = new Date(e.target.value);
                                        setFormData((prev) => ({ ...prev, endDate: date}));
                                    }}
                                    // disabled={formData.isOngoing}
                                    minDate={formData.startDate}
                                />
                            </div>
                            <InputField
                                type='select'
                                options={years}
                                label='Academic session'
                                id='academicSession'

                                value={formData.academicSession}
                                onChange={handleChange}
                                required={true}
                            />
                            <div className='flex flex-col my-2'>
                                <label className='text-lg mb-1'>
                                    Position 1:
                                </label>
                                <Select
                                    options={posts}

                                    onChange={(selectedOption) => {
                                        const { value } = selectedOption
                                        setFormData((prev) => ({ ...prev, position1: value }))
                                    }}
                                    value={posts.find(option => option.value === formData.position1)}
                                    className='basic-multi-select'
                                    required={true}
                                    classNamePrefix='select'
                                />
                            </div>
                            {formData.position1==="Other"&&<InputField
                                label='Other Position 1'
                                id='positionother1'
                                value={formData.positionother1}
                                required={true} 
                                onChange={handleChange}
                            />}

                            {((formData.position1&&formData.position1!=="Other")||(formData.position1==="Other"&&formData.positionother1))&&<InputField
                               label={formData.position1 === "Other" ? formData.positionother1 : formData.position1}
                                id='Convenor'
                                placeholder='faculty 1 , faculty 2'
                                value={formData.Convenor}
                                required={true}
                                onChange={handleChange}
                            />}

                            <div className='flex flex-col my-2'>
                                <label className='text-lg mb-1'>
                                    Position 2:
                                </label>
                                <Select
                                    options={posts}
                                    onChange={(selectedOption) => {
                                        const { value } = selectedOption
                                        setFormData((prev) => ({ ...prev, position2: value }))
                                    }}
                                    value={posts.find(option => option.value === formData.position2)}
                                    className='basic-multi-select'
                                    classNamePrefix='select'
                                    required={true}
                                />
                            </div>
                            {formData.position2==="Other"&&<InputField
                                label='Other Position 2'
                                id='positionother2'
                                value={formData.positionother2}
                                onChange={handleChange}
                                required={true}
                            />}
                            {((formData.position2&&formData.position2!=="Other")||(formData.position2==="Other"&&formData.positionother2))&&<InputField
                               label={formData.position2 === "Other" ? formData.positionother2 : formData.position2}
                                id='Coordinator'
                                placeholder='faculty 1 , faculty 2'
                                value={formData.Coordinator}
                                required={true}
                                onChange={handleChange}
                            />}

                            {/* <input type='file'/> */}

                            <InputField
                                label='Link'
                                id='Link'
                                value={formData.Link}
                                onChange={handleChange}
                            />

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

export default AdminModalEvents
