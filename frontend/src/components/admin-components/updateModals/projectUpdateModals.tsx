//@ts-nocheck

import React, { useState, useEffect } from 'react'
import { Dialog, DialogOverlay, DialogContent } from '@reach/dialog'
import '@reach/dialog/styles.css'
import { Button } from '@/components/ui/button'
import Select from 'react-select'
import axios from 'axios'
import DatePicker from 'react-datepicker'

const InputField = ({ label, id, value, onChange, type, minDate }) => (
    <div className='flex flex-col my-2'>
        <label htmlFor={id} className='text-lg mb-1'>
            {label}:
        </label>
        {type === "text" ? (
            <input
                type={type}
                id={id}
                className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                value={value}
                onChange={onChange}
            />
        ) 
        :
            type === 'number' ? (
                <input
                    type="number"
                    id={id}
                    className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    value={value}
                    onChange={onChange}
                    inputMode="numeric"
                    pattern="[0-9]*"

                />
            ): type === 'year' ? (
            <DatePicker
                // minDate={minDate}
                selected={value as Date}
                onChange={(date: Date) =>
                    onChange({ target: { id, value: date } })
                }
                showYearPicker
                dateFormat='yyyy'
                placeholderText='yyyy'
                className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
        ) : ""}

    </div>
)

const ProjectUpdateModal = ({
    isOpen,
    onClose,
    onSubmit,
    initialData = {},
}) => {
    const [formData, setFormData] = useState({
        title: '',
        status: '',
        referenceNo: '',
        fundingAgency: [],
        fundingAmount: '',
        duration: '',
        year: '',
        month: '',
        principalInvestigator: '',
        coprincipalInvestigator: '',
        authorName: '',
        yeartemp: '',
        associatedFaculty: '',
    })
    const [facultyList, setFacultyList] = useState([])
    const [agency, setAgency] = useState([])

    useEffect(() => {
        if (isOpen && initialData) {
            console.log("initial data is already there", initialData)
            setFormData({
                title: initialData.title || '',
                status: initialData.status || '',
                referenceNo: initialData.referenceNo || '',
                fundingAgency: initialData.fundingAgency || '',
                fundingAmount: initialData.fundingAmount || '',
                duration: initialData.duration || '',
                year: initialData.year || '',
                month: initialData.month || '',
                principalInvestigator: initialData.principalInvestigator || '',
                coprincipalInvestigator:
                    initialData.coprincipalInvestigator || '',
                yeartemp: initialData.year || '',
                associatedFaculty: initialData.faculties.map((faculty) => faculty.uniqueFacultyId).join(','),

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

    const handleAuthorChange = (selectedOptions) => {
        const selectedAuthors = selectedOptions.map((option) => option.value)
        const associatedFacultyString = selectedAuthors.join(',')
        setFormData((prev) => ({
            ...prev,
            associatedFaculty: associatedFacultyString,
        }))
    }

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
        // if (id === 'fundingAmount' && /\D/.test(value)) return;
        setFormData((prev) => ({ ...prev, [id]: value }))
        console.log(formData);
    }

    const handleStatusChange = (option) => {
        setFormData((prev) => ({ ...prev, status: option.value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log('Form data shown is:', formData)
        /*{

  "title": "Information Security Education and Awareness (ISEA) Phase – II",
  "status": "Completed",
  "referenceNo": "NIT/HMR/R&C/ISEA/PROJECT/357-360",
  "fundingAgency": "Ministry of Electronics & Information Technology (MeitY)",
  "fundingAmount": "36.5 Lacs",
  "duration": "7 Years",
  "year": "2015",
  "month": "12/31/2021",
  "academicSession": "",
  "authorName":"CS01",
  "principalInvestigator": "Dr. TP Sharma",
  "coprincipalInvestigator": "Dr. Naveen Chauhan"
} I WANT MY PAYLOAD LIKE THIS */
        const updatedFormData = {
            ...formData,
        }
        console.log("updatedFormData: ", updatedFormData.associatedFaculty);
        onSubmit(updatedFormData, initialData.id)
        onClose();
    }

    const facultyOptions = facultyList.map((faculty) => ({
        value: faculty.uniqueFacultyId,
        label: faculty.name,
    }))

    const statusOptions = [
        { value: 'Ongoing', label: 'Ongoing' },
        { value: 'Completed', label: 'Completed' },
    ]

    const monthOptions = [
        { value: 'January', label: 'January' },
        { value: 'February', label: 'February' },
        { value: 'March', label: 'March' },
        { value: 'April', label: 'April' },
        { value: 'May', label: 'May' },
        { value: 'June', label: 'June' },
        { value: 'July', label: 'July' },
        { value: 'August', label: 'August' },
        { value: 'September', label: 'September' },
        { value: 'October', label: 'October' },
        { value: 'November', label: 'November' },
        { value: 'December', label: 'December' },
    ]
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

    // const handleAuthorChange = (selectedOptions) => {
    //     const selectedAuthors = selectedOptions.map((option) => option.value)
    //     const associatedFacultyString = selectedAuthors.join(',')
    //     setFormData((prev) => ({
    //         ...prev,
    //         associatedFaculty: associatedFacultyString,
    //     }))
    // }

    return (
        <Dialog isOpen={isOpen} onDismiss={onClose}>
            <DialogOverlay className='z-[1000]'>
                <DialogContent
                    aria-labelledby='dialog-title'
                    className='bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl relative'
                >
                    <button
                        onClick={onClose}
                        className='absolute top-4 right-4 text-xl text-gray-600 hover:text-gray-800'
                        aria-label='Close'
                    >
                        &times;
                    </button>
                    <h2 id='dialog-title' className='text-2xl mb-4'>
                        {initialData.id ? 'Update Project' : 'Add New Project'}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className='grid grid-cols-1 gap-4'>
                            <InputField
                                type="text"
                                label='Project Title'
                                id='title'
                                value={formData.title}
                                onChange={handleChange}
                            />
                            <div className='flex flex-col my-2'>
                                <label className='text-lg mb-1'>
                                    Associated Faculty:
                                </label>

                                <Select
                                    isMulti
                                    options={facultyOptions}
                                    onChange={handleAuthorChange}
                                    value={formData.associatedFaculty
                                        ?.split(',')
                                        .map((facultyId) => {
                                            const faculty = facultyList.find(
                                                (obj) =>
                                                    obj.uniqueFacultyId ===
                                                    facultyId,
                                            )
                                            return faculty
                                                ? {
                                                    value: faculty.uniqueFacultyId,
                                                    label: faculty.name,
                                                }
                                                : null
                                        })
                                        .filter(Boolean)}
                                    className='basic-multi-select'
                                    classNamePrefix='select'
                                />
                            </div>
                            <div className='flex flex-col my-2'>
                                <label className='text-lg mb-1'>Status:</label>
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
                                <InputField
                                    type="text"
                                    label='Reference Number'
                                    id='referenceNo'
                                    value={formData.referenceNo}
                                    onChange={handleChange}
                                />
                                <div className='flex flex-col my-2'>
                                    <label className='text-lg mb-1'>Funding Agency:</label>
                                    <Select
                                        value={agency.map((agency) => ({
                                            value: agency,
                                            label: agency,
                                        })).find(
                                            (option) => option.value === formData.fundingAgency,
                                        )}
                                        options={agency.map((agency) => ({
                                            value: agency,
                                            label: agency,
                                        }))}
                                        onChange={(option) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                fundingAgency: option.value,
                                            }))
                                        }
                                        className='basic-single'
                                        classNamePrefix='select'
                                    />
                                </div>
                                <InputField
                                    type="number"
                                    label='Funding Amount'
                                    id='fundingAmount'
                                    value={formData.fundingAmount}
                                    onChange={handleChange}
                                    required={true}
                                />
                                {/* <InputField
                                type="month"
                                label='Duration (in months)'
                                id='duration'
                                value={formData.duration}
                                onChange={handleChange}
                            /> */}
                                <InputField

                                    type="year"
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
                                    required
                                />
                                <div className='flex flex-col my-2'>
                                    <label className='text-lg mb-1'>Month:</label>
                                    <Select
                                        value={monthOptions.find(
                                            (option) =>
                                                option.value === formData.month,
                                        )}
                                        options={monthOptions}
                                        onChange={(option) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                month: option.value,
                                            }))
                                        }
                                        className='basic-single'
                                        classNamePrefix='select'
                                    />
                                </div>
                                <InputField
                                    type="text"
                                    label='Principal Investigator'
                                    id='principalInvestigator'
                                    value={formData.principalInvestigator}
                                    onChange={handleChange}
                                />
                                <InputField
                                    type="text"
                                    label='Co-Principal Investigator'
                                    id='coprincipalInvestigator'
                                    value={formData.coprincipalInvestigator}
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
                        </div>
                    </form>
                </DialogContent>
            </DialogOverlay>
        </Dialog>
    )
}

export default ProjectUpdateModal
