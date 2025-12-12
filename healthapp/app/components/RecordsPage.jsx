'use client';
import React, { useEffect, useState } from 'react';
import { DownloadIcon, UploadIcon, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { downloadMedicalReports, getMedicalRecordsAction, uploadMedicalAction } from '../actions/recordsAction';
import MedicalRecordsTable from '../components/MedicalReportsTable';

function RecordsPage() {
    const [isDocumentOpen, setIsDocumentOpen] = useState(false);
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [formData, setFormData] = useState({
        recordType: 'lab_report',
        date: '',
        title: '',
        description: ''
    });

    const [medicalRecords, setMedicalRecords] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const uploadedFile = e.target.files[0];
        handleFileUpload(uploadedFile);
    };

    const handleFileUpload = (uploadedFile) => {
        if (!uploadedFile) return;

        // Size check (e.g., max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (uploadedFile.size > maxSize) {
            toast.error('File size must be under 10MB.');
            setFile(null);
            setPreviewUrl(null);
            return;
        }

        setFile(uploadedFile);
        if (uploadedFile.type.startsWith('image/') || uploadedFile.type === 'application/pdf') {
            const url = URL.createObjectURL(uploadedFile);
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        handleFileUpload(droppedFile);
    };

    const removeFile = () => {
        setFile(null);
        setPreviewUrl(null);
    };

    const getMedicalRecords = async () => {
        try {
            setLoading(true);
            const res = await getMedicalRecordsAction();
            if (res.success) {
                setMedicalRecords(res.data);
            }
        } catch (error) {
            toast.error('Unable to get the Medical Records');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadToBackend = async () => {
        if (!file) {
            toast.error('Please select a file first');
            return;
        }
        if (!formData.date || !formData.title) {
            toast.error('Please fill in the Date and Title fields');
            return;
        }

        const data = new FormData();
        data.append('file', file);
        data.append('recordType', formData.recordType);
        data.append('date', formData.date);
        data.append('title', formData.title);
        data.append('description', formData.description);

        try {
            setUploading(true);
            const res = await uploadMedicalAction(data);
            if (res.success) {
                await getMedicalRecords();
                toast.success('File uploaded successfully!');
            } else {
                toast.error(res.message || 'File upload failed!');
            }
        } catch (error) {
            console.error('Upload Error:', error);
            toast.error('File upload failed due to a server error!');
        } finally {
            // Reset form state
            setFile(null);
            setPreviewUrl(null);
            setFormData({
                recordType: 'lab_report',
                date: '',
                title: '',
                description: ''
            });
            setUploading(false);
            setIsDocumentOpen(false);
        }
    };

    const downloadRecords = async () => {
        try {
            setDownloading(true);
            const res = await downloadMedicalReports();
            if (res.success) {
                // Assuming downloadMedicalReports handles the actual file download in the browser
                toast.success('Download initiated');
            } else {
                 toast.error(res.message || 'Unable to download records');
            }
        } catch (error) {
            toast.error('An error occurred during download');
            console.error(error);
        } finally {
            setDownloading(false);
        }
    };

    useEffect(() => {
        getMedicalRecords();
    }, []);

    return (
        <div className="p-4 sm:p-6 md:p-8 bg-white rounded-2xl shadow-xl min-h-screen">
            <header className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4'>
                <h1 className="text-3xl font-extrabold text-gray-800 mb-3 sm:mb-0">
                    Medical Records 🏥
                </h1>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button
                        onClick={downloadRecords}
                        disabled={downloading}
                        className="bg-gray-100 text-gray-700 w-full sm:w-auto cursor-pointer px-4 flex items-center justify-center gap-2 py-2 rounded-xl border border-gray-200 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                        {downloading ? `Downloading...` : (
                            <>
                                <DownloadIcon size={20} />
                                <span>Download All</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => setIsDocumentOpen(!isDocumentOpen)}
                        className="bg-teal-500 text-white w-full sm:w-auto cursor-pointer px-4 flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-teal-600 transition-colors shadow-md text-sm font-medium"
                    >
                        <UploadIcon size={20} />
                        {isDocumentOpen ? 'Close Upload' : 'Upload Records'}
                    </button>
                </div>
            </header>

            {/* Upload form section */}
            {isDocumentOpen && (
                <section className="mt-6 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-4 sm:p-6 mb-8 border-2 border-teal-300 shadow-inner">
                    <h3 className="text-xl font-bold text-gray-900 mb-5 border-b pb-2">
                        Upload New Record
                    </h3>

                    <div className="space-y-6">
                        {/* Record Type and Date */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Record Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.recordType}
                                    onChange={(e) => setFormData({ ...formData, recordType: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none bg-white transition-shadow shadow-sm">
                                    <option value="lab_report">Lab Report</option>
                                    <option value="prescription">Prescription</option>
                                    <option value="discharge_summary">Discharge Summary</option>
                                    <option value="xray">X-Ray</option>
                                    <option value="scan">Scan</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Date of Record <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
                                    required
                                />
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., Annual Wellness Exam Bloodwork"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Description (Optional)
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Additional details or context about this medical record"
                                rows="3"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
                            ></textarea>
                        </div>

                        {/* File Preview or Upload */}
                        <div className='pt-4'>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Document File <span className="text-red-500">*</span>
                            </label>
                            {file ? (
                                <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-md relative">
                                    <button
                                        onClick={removeFile}
                                        className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-lg text-gray-400 hover:text-red-500 transition-colors"
                                        aria-label="Remove file"
                                    >
                                        <X size={16} />
                                    </button>
                                    <p className="text-sm font-medium text-gray-800 mb-3 truncate pr-8">
                                        Selected File: **{file.name}**
                                    </p>

                                    {/* Responsive Preview Area */}
                                    <div className='w-full border-t pt-3'>
                                        {previewUrl && (file?.type?.startsWith('image/') || file?.type === 'application/pdf') ? (
                                            <div className="flex justify-center max-h-96 overflow-hidden">
                                                {file?.type?.startsWith('image/') ? (
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
                                                    📄 File Type: {file.type || 'Unknown'} (Preview not available)
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                                        dragOver ? 'border-teal-500 bg-teal-50 shadow-inner' : 'border-gray-300 hover:border-teal-500 hover:bg-gray-50'
                                    }`}
                                >
                                    <input
                                        type="file"
                                        id="file-upload"
                                        className="hidden"
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                        onChange={handleFileChange}
                                    />
                                    <label htmlFor="file-upload" className="cursor-pointer block">
                                        <UploadIcon className="h-10 w-10 text-teal-400 mx-auto mb-3" />
                                        <p className="text-base font-medium text-gray-700">
                                            **Click to browse** or **drag and drop** your file
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Supported formats: PDF, JPG, PNG, DOC/DOCX (Max 10MB)
                                        </p>
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="flex space-x-3 pt-2">
                            <button
                                onClick={handleUploadToBackend}
                                disabled={uploading || !file || !formData.date || !formData.title}
                                className={`w-full sm:w-auto px-6 py-2 rounded-lg transition-colors font-semibold shadow-md ${
                                    uploading || !file || !formData.date || !formData.title
                                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                        : 'bg-teal-600 text-white hover:bg-teal-700'
                                }`}
                            >
                                {uploading ? `Uploading...` : 'Save Record'}
                            </button>
                            <button
                                onClick={() => {
                                    setIsDocumentOpen(false);
                                    removeFile(); // Clear file selection on cancel
                                }}
                                className="w-full sm:w-auto px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* Medical Records Table */}
            {!loading && medicalRecords.length > 0 && (
                <section className="mt-8 overflow-x-auto">
                    <h2 className='text-2xl font-bold mb-4 text-gray-800'>Record History</h2>
                    {/* Add a wrapper for horizontal scrolling on small screens */}
                    <div className="min-w-full inline-block">
                        <MedicalRecordsTable data={medicalRecords} refreshRecords={getMedicalRecords} />
                    </div>
                </section>
            )}

            {/* Loading State */}
            {loading && (
                <div className="text-center py-12 mt-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="animate-spin inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full mb-3"></div>
                    <p className="text-gray-600 font-medium">Loading medical records...</p>
                </div>
            )}

            {/* Empty state */}
            {!loading && medicalRecords.length === 0 && !isDocumentOpen && (
                <div className="text-center py-12 mt-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <UploadIcon className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-700 font-medium mb-2">No medical records yet</p>
                    <p className="text-sm text-gray-500">
                        Click **Upload Records** to add your first document and get started.
                    </p>
                </div>
            )}
        </div>
    );
}

export default RecordsPage;