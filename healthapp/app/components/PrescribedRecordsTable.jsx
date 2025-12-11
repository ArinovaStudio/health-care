'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Trash2, Eye, X, FileText, Calendar } from 'lucide-react' // Added FileText, Calendar for card view
import { deletePrescribedMedicationAction, fetchPrescribedFile } from '../actions/recordsAction';
import toast from 'react-hot-toast';

const PrescribedRecordsTable = ({ records = [], onDelete }) => {

    const [selectedPreview, setSelectedPreview] = useState(null);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [thumbnails, setThumbnails] = useState({});
    const thumbnailUrlsToRevoke = useRef([]);

    // --- Cleanup Effects ---
    useEffect(() => {
        // cleanup on unmount
        return () => {
            thumbnailUrlsToRevoke.current.forEach(u => URL.revokeObjectURL(u));
            thumbnailUrlsToRevoke.current = [];
            if (selectedPreview && selectedPreview.url) {
                URL.revokeObjectURL(selectedPreview.url);
            }
        };
    }, [selectedPreview]);

    // --- Thumbnail Preload Effect (Unchanged) ---
    useEffect(() => {
        let mounted = true;
        async function loadThumbnails() {
            // clear previous urls
            thumbnailUrlsToRevoke.current.forEach(u => URL.revokeObjectURL(u));
            thumbnailUrlsToRevoke.current = [];
            setThumbnails({});

            if (!records || !records.length) return;

            const imageRecords = records.filter(r => {
                const ft = (r.fileType || '').toLowerCase();
                return ['png', 'jpg', 'jpeg'].includes(ft);
            });

            await Promise.all(imageRecords.map(async (r) => {
                try {
                    const res = await fetchPrescribedFile(r._id);
                    if (res.success) {
                        const blob = res.data;
                        const url = URL.createObjectURL(blob);
                        thumbnailUrlsToRevoke.current.push(url);
                        if (!mounted) return;
                        setThumbnails(prev => ({ ...prev, [r._id]: url }));
                    }
                } catch (err) {
                    console.error('Thumbnail load failed for', r._id, err);
                }
            }));
        }

        loadThumbnails();
        return () => {
            mounted = false;
            thumbnailUrlsToRevoke.current.forEach(u => URL.revokeObjectURL(u));
            thumbnailUrlsToRevoke.current = [];
        };
    }, [records]);

    // --- Action Handlers (Unchanged) ---
    const handleDelete = async (id) => {
        try {
            const res = await deletePrescribedMedicationAction(id);
            if (res.success) {
                toast.success('Prescription deleted');
                if (typeof onDelete === 'function') onDelete(id);
            } else {
                toast.error(res.message || 'Delete failed');
            }
        } catch (error) {
            console.error(error);
            toast.error('Delete failed');
        }
    }

    const handlePreview = async (record) => {
        try {
            setLoadingPreview(true);
            const res = await fetchPrescribedFile(record._id);
            if (res.success) {
                const blob = res.data;
                const url = URL.createObjectURL(blob);
                const contentType = res.headers?.['content-type'] || (record.fileType ? (record.fileType === 'pdf' ? 'application/pdf' : (record.fileType === 'png' ? 'image/png' : (record.fileType === 'jpg' || record.fileType === 'jpeg' ? 'image/jpeg' : 'application/octet-stream'))) : 'application/octet-stream');
                
                // Revoke old URL if one exists
                if (selectedPreview && selectedPreview.url) {
                     URL.revokeObjectURL(selectedPreview.url);
                }

                setSelectedPreview({ url, type: contentType, name: record.fileName });
            } else {
                toast.error(res.message || 'Unable to fetch file');
            }
        } catch (error) {
            console.error('Preview error:', error);
            toast.error('Failed to load preview');
        } finally {
            setLoadingPreview(false);
        }
    }
    
    // Helper for formatting date
    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return 'N/A';
        }
    }

    // --- Component Render ---
    return (
        <div className="w-full">
            {/* 1. Desktop Table View (visible on medium screens and up) */}
            <div className="hidden md:block overflow-x-auto shadow-xl rounded-lg">
                <table className="min-w-full border-collapse bg-white">
                    <thead className="bg-teal-600 text-white">
                        <tr>
                            <th className="py-3 px-4 text-left rounded-tl-lg">S.no</th>
                            <th className="py-3 px-4 text-left">Preview</th>
                            <th className="py-3 px-4 text-left">File name</th>
                            <th className="py-3 px-4 text-left">Uploaded</th>
                            <th className="py-3 px-4 text-center rounded-tr-lg">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records && records.length > 0 ? (
                            records.map((record, index) => (
                                <tr
                                    key={record._id}
                                    className="border-b hover:bg-gray-100 transition last:border-b-0"
                                >
                                    <td className="py-3 px-4 align-middle">{index + 1}</td>
                                    <td className="py-3 px-4">
                                        {thumbnails[record._id] ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={thumbnails[record._id]} alt={record.fileName} className="w-20 h-16 object-cover rounded shadow-sm" />
                                        ) : (
                                            <div className="w-20 h-16 flex items-center justify-center bg-gray-100 rounded text-sm text-gray-500 border border-dashed">{record.fileType || 'file'}</div>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 align-middle font-medium text-gray-800 break-words max-w-xs">{record.fileName}</td>
                                    <td className="py-3 px-4 align-middle text-sm text-gray-600">{formatDate(record.createdAt)}</td>
                                    <td className="py-3 px-4">
                                        <div className='flex justify-center gap-4'>
                                            <button onClick={() => handlePreview(record)} title="View" className="text-teal-600 hover:text-teal-800 transition">
                                                <Eye size={20} />
                                            </button>
                                            <button onClick={() => handleDelete(record._id)} title="Delete" className="text-red-500 hover:text-red-700 transition">
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center py-6 text-gray-500 italic">
                                    No prescribed records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* 2. Mobile Card View (hidden on medium screens and up) */}
            <div className="md:hidden space-y-4">
                {records && records.length > 0 ? (
                    records.map((record, index) => (
                        <div key={record._id} className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
                            <div className="flex justify-between items-start border-b pb-3 mb-3">
                                <div className="flex items-center space-x-3">
                                    <span className="text-lg font-bold text-teal-600 w-6 h-6 flex items-center justify-center rounded-full bg-teal-100">{index + 1}</span>
                                    <h3 className="text-base font-semibold text-gray-800 break-words pr-2">
                                        {record.fileName}
                                    </h3>
                                </div>
                                <div className='flex gap-3 text-gray-500'>
                                    <button onClick={() => handlePreview(record)} title="View" className="hover:text-teal-600">
                                        <Eye size={20} />
                                    </button>
                                    <button onClick={() => handleDelete(record._id)} title="Delete" className="hover:text-red-500">
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                            
                            <div className='flex items-center space-x-3 mt-3'>
                                {/* Thumbnail/Icon */}
                                <div className="flex-shrink-0">
                                    {thumbnails[record._id] ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={thumbnails[record._id]} alt={record.fileName} className="w-16 h-12 object-cover rounded shadow-sm" />
                                    ) : (
                                        <div className="w-16 h-12 flex items-center justify-center bg-gray-100 rounded text-gray-500 border border-dashed">
                                            <FileText size={20} />
                                        </div>
                                    )}
                                </div>
                                
                                {/* Details */}
                                <div className="flex-grow space-y-1 text-sm">
                                    <div className="flex items-center text-gray-600">
                                        <Calendar size={14} className="mr-2 text-teal-500" />
                                        <span>**Date:** {formatDate(record.createdAt)}</span>
                                    </div>
                                    <div className="text-gray-500">
                                        **Type:** {record.fileType?.toUpperCase() || 'Unknown'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-6 text-gray-500 italic bg-white p-6 rounded-lg shadow">
                        No prescribed records found.
                    </div>
                )}
            </div>


            {/* Preview modal (Unchanged) */}
            {selectedPreview && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded-lg shadow-2xl relative max-w-4xl w-full mx-4">
                        <button
                            onClick={() => { URL.revokeObjectURL(selectedPreview.url); setSelectedPreview(null); }}
                            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md text-gray-700 hover:text-black z-50 transition"
                        >
                            <X size={20} />
                        </button>

                        <div className="mt-6">
                            {loadingPreview ? (
                                <p className="text-center py-8">Loading preview...</p>
                            ) : selectedPreview.type?.startsWith('image/') ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={selectedPreview.url} alt={selectedPreview.name} className="mx-auto rounded-lg max-h-[70vh] object-contain w-full" />
                            ) : selectedPreview.type === 'application/pdf' ? (
                                <iframe src={selectedPreview.url} title={selectedPreview.name} className="w-full h-[75vh] border rounded" />
                            ) : (
                                <div className="text-center py-8">
                                    <p className="mb-4">Preview not available for this file type.</p>
                                    <a href={selectedPreview.url} download={selectedPreview.name} className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition">Download {selectedPreview.name}</a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default PrescribedRecordsTable;