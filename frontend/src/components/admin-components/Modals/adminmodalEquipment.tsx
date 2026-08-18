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

const AdminModalEquipment = ({
    isOpen,
    onClose,
    onSubmit,
}) => {
    const [formData, setFormData] = useState({
        name: "",
        quantity: 0,
        date: "",
        stock: 0,
        invoice: "",
        indenter: "",
        vender: "",
        addressAndCon: "",
        amount: 0,
        academicSession: ""
    })
    const handleChange = (e) => {
        const { id, value } = e.target
        if (id === 'quantity' && /\D/.test(value)) return;
        if (id === 'stock' && /\D/.test(value)) return;
        // if (id === 'amount' && /\D/.test(value)) return;
        setFormData((prev) => ({ ...prev, [id]: value }))



    }
    const handleSubmit = (e) => {
        e.preventDefault()
        // Include addonFaculty in the authorName string if it is provided
        const requiredFields = [
            { field: 'academicSession', name: 'Academic Session' },
            { field: 'name', name: 'Name' },
            { field: 'quantity', name: 'Quantity' },
            { field: 'date', name: 'Date' },
            { field: 'stock', name: 'Stock' },
            { field: 'invoice', name: 'Invoice' },
            { field: 'indenter', name: 'Indenter' },
            { field: 'vender', name: 'Vender' },
            { field: 'addressAndCon', name: 'Address and Contact' },
            { field: 'amount', name: 'Amount' },
        ]

        // Check for empty required fields
        for (let { field, name } of requiredFields) {
            if (!formData[field]) {
                alert(`Please fill in the required field: ${name}`)
                return
            }
        }
        const updatedFormData = {
            ...formData
        }
        console.log(updatedFormData);

        onSubmit(updatedFormData)
        setFormData({
            name: "",
            quantity: 0,
            date: "",
            stock: 0,
            invoice: "",
            indenter: "",
            vender: "",
            addressAndCon: "",
            amount: 0,
            academicSession: ""
        })
    }

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
                        Add New Equipment Data
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className='grid grid-cols-1 gap-4'>
                            <InputField
                                label='Name'
                                id='name'
                                value={formData.name}
                                onChange={handleChange}
                                required={true}
                            />
                            <InputField
                                label='Quantity'
                                id='quantity'
                                type='number'
                                value={formData.quantity}
                                onChange={handleChange}
                                required={true}
                            />
                            <InputField
                                label='Date of Purchase'
                                id='date'
                                type='date'
                                value={formData.date}
                                onChange={(e) => {
                                    const formattedDate = new Date(e.target.value)
                                    setFormData((prev) => ({ ...prev, date: formattedDate }))
                                }}    
                                required={true}
                            />
                            <InputField
                                label='Stock'
                                id='stock'
                                type='number'
                                value={formData.stock}
                                onChange={handleChange}
                                required={true}
                            />
                            <InputField
                                label='Invoice No.'
                                id='invoice'
                                value={formData.invoice}
                                onChange={handleChange}
                                required={true}
                            />  
                            <InputField
                                label='Indenter'
                                id='indenter'
                                value={formData.indenter}
                                onChange={handleChange}
                                required={true}
                            />
                            <InputField
                                label='Vender'
                                id='vender'
                                value={formData.vender}
                                onChange={handleChange}
                                required={true}
                            />
                            <InputField
                                label='Address and Contact'
                                id='addressAndCon'
                                value={formData.addressAndCon}
                                onChange={handleChange}
                                required={true}
                            />
                            <InputField
                                label='Amount'
                                id='amount'
                                type='number'
                                value={formData.amount}
                                onChange={handleChange}
                                required={true}

                            />
                           <InputField
                                type='select'
                                options={years}
                                required={true}
                                label='Financial Year'
                                id='academicSession's
                                value={formData.academicSession}
                                onChange={handleChange}


                            />

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

export default AdminModalEquipment
