'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Loader2, X, FileText } from 'lucide-react'; 
import { addPrescribedMedicationAction } from '../actions/recordsAction';
import PrescribedRecordsTable from '../components/PrescribedRecordsTable';
import toast from 'react-hot-toast';
import axios from 'axios';

function MedicationPage() {

    const [isPrescribedOpen, setIsPrescribedOpen] = useState(false);
    const [prescribedFile, setPrescribedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null); // Added state for file preview
    const [medList, setMedList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    // Utility to remove the selected file and preview URL
    const removeFile = () => {
        setPrescribedFile(null);
        setPreviewUrl(null);
    };

    // Utility to handle file change, validation, and setting the preview URL
    const handleFileChange = (uploadedFile) => {
        if (!uploadedFile) {
            removeFile();
            return;
        }

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (uploadedFile.size > maxSize) {
            toast.error('File size must be under 10MB.');
            removeFile();
            return;
        }

        setPrescribedFile(uploadedFile);
        
        // Create an object URL for preview if it's an image or PDF
        if (uploadedFile.type.startsWith('image/') || uploadedFile.type === 'application/pdf') {
            const url = URL.createObjectURL(uploadedFile);
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null);
        }
    };

    // Function to fetch medication records (kept the original logic)
    const getMed = useCallback(async () => {
        setIsFetching(true);
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/records/prescribed-record/all`, { withCredentials: true });
            if (res.data.success) {
                setMedList(res.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching medication records:', error);
            toast.error('Unable to fetch medication records.');
            setMedList([]);
        } finally {
            setIsFetching(false);
        }
    }, []);

    useEffect(() => {
        getMed();
    }, [getMed]);

    const handleAdd = async () => {
        try {
            if (!prescribedFile) {
                toast.error('Please choose a file to upload');
                return;
            }

            // Client-side size check (already in handleFileChange, but kept for redundancy)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (prescribedFile.size > maxSize) {
                toast.error('File size must be under 10MB.');
                return;
            }

            setLoading(true);
            const formData = new FormData();
            formData.append('file', prescribedFile);

            const res = await addPrescribedMedicationAction(formData);
            if (res.success) {
                toast.success('Prescription uploaded successfully!');
                setMedList(prev => [...prev, res.data]);
                setIsPrescribedOpen(false);
                removeFile(); // Clear file after successful upload
            } else {
                toast.error(res.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Unable to save the data');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        // Optimistic UI update for delete
        setMedList(prev => prev.filter(r => r._id !== id));
        toast.success('Record deleted (requires a delete action)'); 
    }

    return (
        <div className="w-full lg:w-3/4 xl:w-4/5 p-4 sm:p-6 md:p-8 bg-white rounded-2xl shadow-xl">

            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-3 sm:mb-0">
                    Prescribed Medications 💊
                </h1>

                <button
                    onClick={() => {
                        setIsPrescribedOpen(!isPrescribedOpen);
                        if (isPrescribedOpen) removeFile(); // Clear file when closing the form
                    }}
                    className="bg-teal-600 text-white w-full sm:w-auto cursor-pointer px-4 flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-teal-700 transition-colors shadow-md font-medium text-sm"
                >
                    <Plus size={20} /> {isPrescribedOpen ? 'Close Form' : 'Add Medication'}
                </button>
            </div>

            {/* Upload Section (Responsive Form) */}
            {isPrescribedOpen && (
                <div className="mt-6 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-4 sm:p-6 mb-8 border-2 border-teal-300 shadow-inner">
                    <h3 className="text-xl font-bold text-gray-900 mb-5 border-b pb-2">
                        Upload New Prescription
                    </h3>

                    <div className='space-y-4'>
                        {/* CONDITIONAL FILE RENDER START: The key change for responsiveness */}
                        {!prescribedFile ? (
                            // 1. File Input Area (No file selected)
                            <div>
                                <label htmlFor="prescriptionFile" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Upload Prescription File (PDF, JPG, PNG)
                                </label>
                                <input
                                    id="prescriptionFile"
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    onChange={(e) => handleFileChange(e.target.files[0] || null)}
                                    // Custom Tailwind styles for a more responsive file input appearance
                                    className="w-full file:mr-4 file:py-2 file:px-4
                                               file:rounded-full file:border-0
                                               file:text-sm file:font-semibold
                                               file:bg-teal-100 file:text-teal-700
                                               hover:file:bg-teal-200
                                               border border-gray-300 rounded-lg p-3 cursor-pointer
                                               text-gray-500"
                                />
                            </div>
                        ) : (
                            // 2. File Preview Area (File selected - much cleaner on mobile)
                            <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-md relative">
                                <button
                                    onClick={removeFile}
                                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-lg text-gray-400 hover:text-red-500 transition-colors z-10"
                                    aria-label="Remove file"
                                >
                                    <X size={16} />
                                </button>
                                
                                <div className='flex items-center gap-3 mb-3'>
                                    <FileText className='h-6 w-6 text-teal-600' />
                                    <p className="text-sm font-medium text-gray-800 truncate pr-8">
                                        Selected File: **{prescribedFile.name}**
                                    </p>
                                </div>

                                {/* Responsive Preview (Image or PDF) */}
                                <div className='w-full border-t pt-3'>
                                    {previewUrl && (prescribedFile.type.startsWith('image/') || prescribedFile.type === 'application/pdf') ? (
                                        <div className="flex justify-center max-h-96 overflow-hidden">
                                            {prescribedFile.type.startsWith('image/') ? (
                                                <img
                                                    src={previewUrl}
                                                    alt="File Preview"
                                                    className="max-w-full max-h-full object-contain rounded-lg border border-gray-100"
                                                />
                                            ) : (
                                                <iframe
                                                    src={previewUrl}
                                                    title="PDF Preview"
                                                    className="w-full h-80 sm:h-96 border-0 rounded-lg"
                                                ></iframe>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                            <p className="text-gray-600 text-sm">
                                                📄 File Type: {prescribedFile.type || 'Unknown'} (Preview not available)
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {/* CONDITIONAL FILE RENDER END */}

                        {/* Buttons (Made Full-Width on Mobile) */}
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
                            <button
                                onClick={handleAdd}
                                disabled={loading || !prescribedFile}
                                className={`w-full sm:w-auto px-6 py-2 rounded-lg transition-colors font-semibold shadow-md ${loading || !prescribedFile
                                        ? 'bg-teal-300 cursor-not-allowed text-white'
                                        : 'bg-teal-600 hover:bg-teal-700 text-white'
                                    }`}
                            >
                                {loading ? (
                                    <span className='flex items-center justify-center'><Loader2 className="animate-spin mr-2 h-4 w-4" /> Uploading...</span>
                                ) : 'Upload Prescription'}
                            </button>

                            <button
                                onClick={() => { setIsPrescribedOpen(false); removeFile(); }}
                                disabled={loading}
                                className={`w-full sm:w-auto px-6 py-2 rounded-lg transition-colors font-semibold shadow-sm ${loading
                                        ? 'bg-gray-200 cursor-not-allowed text-gray-400'
                                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                    }`}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {isFetching && (
                <div className="text-center py-12 mt-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <Loader2 className="animate-spin inline-block w-8 h-8 text-teal-500 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">Fetching prescribed medications...</p>
                </div>
            )}

            {/* Table or Empty State */}
            {!isFetching && medList.length > 0 && (
                <main className="p-0 sm:p-6 bg-white min-h-screen mt-4 rounded-xl">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 sm:hidden">Record History</h2>
                    {/* Added overflow-x-auto for table responsiveness */}
                    <div className="overflow-x-auto">
                        <PrescribedRecordsTable records={medList} onDelete={handleDelete} />
                    </div>
                </main>
            )}

            {/* Empty state (only show when no records and form is closed) */}
            {!isFetching && medList.length === 0 && !isPrescribedOpen && (
                <div className="text-center py-12 mt-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-pills h-12 w-12 text-gray-400 mx-auto mb-3">
                        <path d="M11 20a7 7 0 0 1-7-7c0-4.4 3.6-8 8-8s8 3.6 8 8c0 1.9-.7 3.7-2 5l-.5-.5a5 5 0 0 0-7.5-6.5l-2.5 2.5a3.5 3.5 0 1 0 4.95 4.95l2.5-2.5c2.1-2.1 2.3-5.2.7-7.5l-.5-.5z" />
                    </svg>

                    <p className="text-gray-700 font-medium mb-2">No medications added yet</p>
                    <p className="text-sm text-gray-500">
                        Click **Add Medication** to upload your prescriptions.
                    </p>
                </div>
            )}
        </div>
    )
}

export default MedicationPage;