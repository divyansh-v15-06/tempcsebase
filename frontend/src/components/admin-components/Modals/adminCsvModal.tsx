//@ts-nocheck
import React, { useState } from 'react'
import { Dialog, DialogOverlay, DialogContent } from '@reach/dialog'
import Papa from 'papaparse'
import '@reach/dialog/styles.css'
import Select from 'react-select'

const CSVUploadModal = ({ isOpen, onClose, onSubmit }) => {
    const [file, setFile] = useState(null)
    const [previewData, setPreviewData] = useState([])
    const [type, setType] = useState('') // Simplified type state

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        setFile(selectedFile)

        Papa.parse(selectedFile, {
            header: true,
            complete: (result) => {
                // @ts-ignore
                setPreviewData(result.data)
            },
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (file) {
            onSubmit({ file, type }) // Pass both file and type to onSubmit
        }
    }

    return (
        <Dialog isOpen={isOpen} onDismiss={onClose}>
            <DialogOverlay className='z-[1000]'>
                <DialogContent
                    aria-labelledby='csv-dialog-title'
                    className='bg-white p-6 rounded-lg shadow-lg max-w-2xl'
                >
                    <h2 id='csv-dialog-title' className='text-2xl mb-4'>
                        Upload CSV File
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className='flex items-center my-2'>
                            <input
                                type='file'
                                accept='.csv'
                                onChange={handleFileChange}
                                className='border rounded px-2 py-1 flex-1'
                                required
                            />
                        </div>
                        {previewData.length > 0 && (
                            <div className='mt-6 overflow-x-auto max-h-80'>
                                <h3 className='text-xl mb-2'>CSV Preview</h3>
                                <div className='overflow-y-auto max-h-60'>
                                    <table className='min-w-full bg-white border'>
                                        <thead>
                                            <tr>
                                                {Object.keys(
                                                    previewData[0],
                                                ).map((header, index) => (
                                                    <th
                                                        key={index}
                                                        className='py-2 px-4 border-b'
                                                    >
                                                        {header}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {previewData.map(
                                                (row, rowIndex) => (
                                                    <tr key={rowIndex}>
                                                        {Object.values(row).map(
                                                            (
                                                                value,
                                                                colIndex,
                                                            ) => (
                                                                <td
                                                                    key={
                                                                        colIndex
                                                                    }
                                                                    className='py-2 px-4 border-b'
                                                                >
                                                                    {/* @ts-ignore */}
                                                                    {value}
                                                                </td>
                                                            ),
                                                        )}
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        <div className='mt-4'>
                            <button
                                type='submit'
                                className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
                            >
                                Submit
                            </button>
                            <button
                                type='button'
                                onClick={onClose}
                                className='ml-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </DialogOverlay>
        </Dialog>
    )
}

export default CSVUploadModal
