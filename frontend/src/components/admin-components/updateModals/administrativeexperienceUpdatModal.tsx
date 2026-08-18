// @ts-nocheck
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
                value={options.find((option) => option.value === value)}
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
                selected={value}
                onChange={(date) => onChange({ target: { id, value: date } })}
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
                selected={value}
                onChange={(date) => onChange({ target: { id, value: date } })}
                dateFormat='dd/MM/yyyy'
                disabled={disabled}
                placeholderText='dd/mm/yyyy'
                className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
        )}
    </div>
)

function AdministrativeUpdateModal({
    isOpen,
    onClose,
    onSubmit,
    addonFaculty = '',
    initialData = null,
}) {
    const [formData, setFormData] = useState({
        organisation: '',
        position: '',
        startDate: '',
        endDate: '',
    })

    useEffect(() => {
        console.log('initialData', initialData)
        if (initialData) {
            setFormData({
                organisation: initialData.organisation,
                position: initialData.position,
                startDate: initialData.startDate,
                endDate: initialData.endDate,
            })
        }
    }, [initialData])
    console.log('formdata', formData)

    const handleChange = (e) => {
        const { id, value } = e.target
        setFormData((prev) => ({ ...prev, [id]: value }))
    }
    const formatDate = (date) => {
        if (!date || date === 'Present') return date; // Keep 'Present' as is
        return new Date(date).toISOString().split('T')[0]; // Extract YYYY-MM-DD
    };
    const handleSubmit = (e) => {
        e.preventDefault()
        const requiredFields = [
            { field: 'organisation', name: 'Organization' },//Department/
            { field: 'position', name: 'Position' },
            { field: 'startDate', name: 'Start Date' },
            { field: 'endDate', name: 'End Date' },
        ]

        for (let { field, name } of requiredFields) {
            if (!formData[field]) {
                alert(`Please fill in the required field: ${name}`)
                return
            }
        }

        const updatedFormData = {
            id: initialData?.id,
            organisation: formData.organisation,
            startDate: formatDate(formData.startDate),
            endDate: formatDate(formData.endDate),
            position: formData.position,
        }
        onSubmit(updatedFormData, initialData?.id)
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
                        {initialData ? 'Update Administrative Experience' : 'Add New Administrative Experience'}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className='grid grid-cols-1 gap-4'>
                            <InputField
                                label='Position Held'
                                id='position'
                                value={formData.position}
                                onChange={handleChange}
                            />
                            <InputField
                                label='Department/Organization'
                                id='organisation'
                                value={formData.organisation}
                                onChange={handleChange}
                            />
                            <InputField
                                label='Start Date'
                                id='startDate'
                                type='date'
                                value={formData.startDate}
                                onChange={handleChange}
                            />
                            <InputField
                                label='End Date'
                                id='endDate'
                                type='date'
                                value={formData.endDate === 'Present' ? '' : formData.endDate}
                                onChange={handleChange}
                                disabled={formData.endDate === 'Present'}
                            />
                            <label className='ml-2 flex items-center'>
                                <input
                                    type='checkbox'
                                    id='present'
                                    className='mr-2'
                                    checked={formData.endDate === 'Present'}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            endDate: e.target.checked ? 'Present' : '',
                                        }))
                                    }
                                />
                                Present
                            </label>
                        </div>
                        <div className='mt-4 flex justify-end'>
                            <Button type='submit' className='bg-blue-500 text-white mr-2'>
                                {initialData ? 'Update' : 'Submit'}
                            </Button>
                            <Button onClick={onClose} className='bg-gray-500 text-white'>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </DialogOverlay>
        </Dialog>
    )
}

export default AdministrativeUpdateModal