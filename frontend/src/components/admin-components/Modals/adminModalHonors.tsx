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

function AdminModalHonors({ isOpen, onClose, onSubmit,userid }) {
    
    const [formData, setFormData] = useState({})

    const handleSubmit = (e) => {
        e.preventDefault()
        const requiredFields = [
            { field: 'title', name: 'Title' },
            { field: 'givenBy', name: 'Given By' },
            { field: 'year', name: 'Year' },
        ]

        for (let { field, name } of requiredFields) {
            if (!formData[field]) {
                alert(`Please fill in the required field: ${name}`)
                return
            }
        }
        const UpdatedFormdata={
            ...formData,
            facultyId:userid,
            year:formData.year.getFullYear()
        }
        onSubmit(UpdatedFormdata)
        onClose()
        setFormData({})
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
        })
    }

    return (
        <div>
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
                            { 'Add New Honors'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className='grid grid-cols-1 gap-4'>
                                <InputField
                                    label={'Title'}
                                    value={formData.title}
                                    onChange={handleChange}
                                    id='title'
                                    type='text'
                                />
                                <InputField
                                    label={'Given By'}
                                    value={formData.givenBy}
                                    onChange={handleChange}
                                    id='givenBy'
                                    type='text'
                                />
                                <InputField
                                    label={'Year'}
                                    value={formData.year}
                                    onChange={handleChange}
                                    id='year'
                                    type='year'
                                />
                            </div>
                            <div className='mt-4 flex justify-end'>
                                <Button
                                    type='submit'
                                    className='bg-blue-500 text-white mr-2'
                                >
                                    { 'Submit'}
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
        </div>
    )
}

export default AdminModalHonors
