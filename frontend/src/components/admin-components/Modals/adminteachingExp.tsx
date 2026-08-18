// @ts-nocheck
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Dialog, DialogOverlay, DialogContent } from '@reach/dialog'
import '@reach/dialog/styles.css'
import Select from 'react-select'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { set } from 'react-datepicker/dist/date_utils'

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
                className='basic-single'
                required={required}
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
                required={required}
                className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
        ) : type === 'month' ? (
            <DatePicker
                minDate={minDate}
                selected={value}
                onChange={(date) => onChange({ target: { id, value: date } })}
                showMonthYearPicker
                dateFormat='MMM'
                required={required}
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
                required={required}
                disabled={disabled}
                placeholderText='dd/mm/yyyy'
                className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
        )}
    </div>
)

function AdminTeachingExpModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
}) {
    const [userid, setUserId] = useState('')
    const [formData, setFormData] = useState({
            position:"",
            department:"",
            from:"",
            to:"",
            facultyId:""
        })
        useEffect(() => {
            setUserId(sessionStorage.getItem('userId'))
            if (initialData) {
                setFormData((prev) => ({
                    ...prev,
                    position: initialData.position||'',
                    department: initialData.department||'',
                    from: initialData.from||'',
                    to: initialData.to||'',
                    facultyId: userid,
                }))
                
            }
            else {
                setFormData((prev) => ({
                    ...prev,
                    position: '',
                    department: '',
                    from: '',
                    to: '',
                    facultyId: userid,
                }))
            }
    
        }, [initialData,isOpen])

    const handleSubmit = (e) => {
        e.preventDefault()
        const requiredFields = [
            { field: 'position', name: 'Position' },
            { field: 'department', name: 'Department' },
            { field: 'from', name: 'Start Date' },
            { field: 'to', name: 'End Date' },

        ]

        for (let { field, name } of requiredFields) {
            if (!formData[field]) {
                alert(`Please fill in the required field: ${name}`)
                return
            }
        }
        console.log(formData);



        onSubmit(formData)
        onClose()
        setFormData({
            position: "",
            department: "",
            from: "",
            to: "",
            facultyId: userid,
        })
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
                            {initialData
                                ? 'Update Teaching Experience'
                                : 'Add New Teaching Experience'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className='grid grid-cols-1 gap-4'>
                                <InputField
                                    label='Position'
                                    id='position'
                                    value={formData.position || ''}
                                    onChange={handleChange}
                                    required=   {true}
                                />
                                <InputField
                                    label='Department'
                                    id='department'
                                    value={formData.department || ''}
                                    onChange={handleChange}
                                    required=   {true}
                                />
                                <InputField
                                    type='date'
                                    label='Start date'
                                    id='from'
                                    required=   {true}
                                    value={formData.from}
                                    onChange={(e) => {
                                        const date = new Date(e.target.value);
                                        setFormData((prev) => ({
                                            ...prev,
                                            from: date.toISOString().split('T')[0],
                                        }));
                                    }}
                                    
                                />
                               
                                    <div className='flex items-center'>
                                        {formData.to === 'Present' ? (
                                            <InputField
                                                id='to'
                                                required=   {true}
                                                type='text'
                                                label={'End date'}
                                                readOnly
                                                className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow'
                                                value='Present'
                                            />
                                        ) : (
                                            <InputField
                                                id='to'
                                                required=   {true}
                                                type='date'
                                                label={'End date'}
                                                className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow'
                                                value={formData.to}
                                                onChange={(e) => {
                                                    const date = new Date(e.target.value);
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        to: date.toISOString().split('T')[0],
                                                    }));
                                                }}
                                            />
                                        )}
                                        <label className='ml-2 flex items-center'>
                                            <input
                                                type='checkbox'
                                                id='present'
                                                className='mr-2'
                                                checked={
                                                    formData.to === 'Present'
                                                }
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        to: e.target.checked
                                                            ? 'Present'
                                                            : '',
                                                    }))
                                                }
                                            />
                                            Present
                                        </label>
                                    </div>
                                </div>
                            <div className='mt-4 flex justify-end'>
                                <Button
                                    type='submit'
                                    className='bg-blue-500 text-white mr-2'
                                >
                                    {initialData ? 'Update' : 'Submit'}
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

export default AdminTeachingExpModal
