'use client';
import React, { useState, useEffect } from 'react';
import { X, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteMedicalRecords, fetchMedicalFile } from '../actions/recordsAction';

/**
 * Utility function to convert record type enum to display string
 * @param {string} type 
 * @returns {string}
 */
const formatRecordType = (type) => {
    return (type || '').replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export default function MedicalRecordsTable({ data, refreshRecords }) {

    const [selectedPreview, setSelectedPreview] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [thumbnails, setThumbnails] = useState({});
    const thumbnailUrlsToRevoke = React.useRef([]);

    const handleDelete = async (id) => {
        try {
            setDeleting(true);
            const res = await deleteMedicalRecords(id);
            if (res.success) {
                toast.success("Deleted Successfully");
                refreshRecords();
            } else {
                toast.error(res.message || "Unable to delete");
            }
        } catch (error) {
            toast.error("An unexpected error occurred during deletion");
            console.error(error);
        } finally {
            setDeleting(false);
        }
    }

    const handlePreview = async (record) => {
        try {
            setLoadingPreview(true);
            const res = await fetchMedicalFile(record._id);
            if (res.success) {
                const blob = res.data;
                const url = URL.createObjectURL(blob);
                // Prefer content-type from headers, fallback to stored fileType
                const contentType = res.headers?.['content-type'] || (record.fileType ? (record.fileType === 'pdf' ? 'application/pdf' : (record.fileType === 'png' ? 'image/png' : (record.fileType === 'jpg' || record.fileType === 'jpeg' ? 'image/jpeg' : 'application/octet-stream'))) : 'application/octet-stream');

                setSelectedPreview({ url, type: contentType, name: record.fileName || record.title || 'file' });
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

    // Revoke object URL when modal closes or component unmounts
    useEffect(() => {
        // Cleanup function for selectedPreview
        return () => {
            if (selectedPreview && selectedPreview.url) {
                URL.revokeObjectURL(selectedPreview.url);
            }
        };
    }, [selectedPreview]);

    // Preload thumbnails for image records
    useEffect(() => {
        let mounted = true;
        async function loadThumbnails() {
            // clear previous urls
            thumbnailUrlsToRevoke.current.forEach(u => URL.revokeObjectURL(u));
            thumbnailUrlsToRevoke.current = [];
            setThumbnails({});

            if (!data || !data.length) return;

            const imageRecords = data.filter(r => {
                const ft = (r.fileType || '').toLowerCase();
                return ['png', 'jpg', 'jpeg'].includes(ft);
            });

            await Promise.all(imageRecords.map(async (r) => {
                try {
                    const res = await fetchMedicalFile(r._id);
                    if (res.success) {
                        const blob = res.data;
                        const url = URL.createObjectURL(blob);
                        thumbnailUrlsToRevoke.current.push(url);
                        if (!mounted) return;
                        setThumbnails(prev => ({ ...prev, [r._id]: url }));
                    }
                } catch (err) {
                    // ignore thumbnail load errors
                    console.error('Thumbnail load failed for', r._id, err);
                }
            }));
        }

        loadThumbnails();
        return () => {
            mounted = false;
            // Cleanup function for thumbnails
            thumbnailUrlsToRevoke.current.forEach(u => URL.revokeObjectURL(u));
            thumbnailUrlsToRevoke.current = [];
        };
    }, [data]);

    return (
        <div className="p-4 sm:p-6">
            {/* Table View (for screens >= sm) */}
            <div className="hidden sm:block overflow-x-auto rounded-lg shadow">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead className="bg-teal-600 text-white">
                        <tr>
                            <th className="py-3 px-4 text-left">Title</th>
                            <th className="py-3 px-4 text-left">Type</th>
                            <th className="py-3 px-4 text-left">Date</th>
                            <th className="py-3 px-4 text-left w-1/3">Description</th>
                            <th className="py-3 px-4 text-center">Image</th>
                            <th className="py-3 px-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((record, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4 font-medium text-gray-900">{record.title}</td>
                                <td className="py-3 px-4 text-sm text-gray-600">{formatRecordType(record.recordType)}</td>
                                <td className="py-3 px-4 text-sm text-gray-600">{record.date}</td>
                                <td className="py-3 px-4 text-sm text-gray-600 truncate max-w-xs">{record.description}</td>
                                <td className="py-3 px-4 text-center">
                                    <div className="w-24 h-16 inline-flex overflow-hidden rounded-lg border border-gray-200 items-center justify-center bg-gray-50 mx-auto">
                                        {thumbnails[record._id] ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={thumbnails[record._id]} alt={record.title} className="object-cover w-full h-full" />
                                        ) : (
                                            <div className="text-xs text-gray-400 px-2 text-center">No preview</div>
                                        )}
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <div className='flex justify-center gap-2'>
                                        <button
                                            onClick={() => handlePreview(record)}
                                            className="p-2 text-teal-600 hover:text-teal-800 transition duration-150 rounded-full"
                                            title="View Record"
                                        >
                                            <Eye size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(record._id)}
                                            className="p-2 text-red-600 hover:text-red-800 transition duration-150 rounded-full disabled:opacity-50"
                                            disabled={deleting}
                                            title="Delete Record"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!data || data.length === 0 && (
                    <div className="text-center py-8 text-gray-500">No medical records found.</div>
                )}
            </div>

            {/* Card View (for screens < sm) */}
            <div className="sm:hidden space-y-4">
                {data.map((record, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold text-teal-700">{record.title}</h3>
                            <div className='flex gap-2'>
                                <button
                                    onClick={() => handlePreview(record)}
                                    className="p-1 text-teal-600 hover:text-teal-800 transition duration-150 rounded-full"
                                    title="View Record"
                                >
                                    <Eye size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(record._id)}
                                    className="p-1 text-red-600 hover:text-red-800 transition duration-150 rounded-full disabled:opacity-50"
                                    disabled={deleting}
                                    title="Delete Record"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="text-sm text-gray-600 space-y-1">
                            <p>
                                <strong className="font-semibold text-gray-700">Type:</strong> {formatRecordType(record.recordType)}
                            </p>
                            <p>
                                <strong className="font-semibold text-gray-700">Date:</strong> {record.date}
                            </p>
                            <p>
                                <strong className="font-semibold text-gray-700">Description:</strong> {record.description || 'N/A'}
                            </p>
                            <div className="pt-2">
                                <strong className="font-semibold text-gray-700 block mb-1">Image:</strong>
                                <div className="w-24 h-16 overflow-hidden rounded-lg border border-gray-300 flex items-center justify-center bg-gray-50">
                                    {thumbnails[record._id] ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={thumbnails[record._id]} alt={record.title} className="object-cover w-full h-full" />
                                    ) : (
                                        <div className="text-xs text-gray-400 px-1 text-center">No preview</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {!data || data.length === 0 && (
                    <div className="text-center py-8 text-gray-500">No medical records found.</div>
                )}
            </div>


            {/* Modal - Kept the same as it was already fixed/centered */}
            {selectedPreview && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"> {/* Added p-4 for padding on small screens */}
                    <div className="bg-white p-4 rounded-lg shadow-lg relative max-w-4xl w-full mx-auto max-h-[90vh] overflow-auto">
                        <button
                            onClick={() => setSelectedPreview(null)}
                            className="absolute top-2 right-2 p-1 text-gray-700 hover:text-black bg-white rounded-full shadow-md z-10"
                            title="Close Preview"
                        >
                            <X size={20} />
                        </button>

                        <div className="pt-6">
                            <h4 className='text-lg font-semibold text-gray-800 mb-2'>Preview:</h4>
                            {loadingPreview ? (
                                <p className="text-center py-8 text-gray-500">Loading preview...</p>
                            ) : selectedPreview.type?.startsWith('image/') ? (
                                // Image preview
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={selectedPreview.url} alt={selectedPreview.name} className="mx-auto rounded-lg max-h-[70vh] w-auto h-auto object-contain border border-gray-200" />
                            ) : selectedPreview.type === 'application/pdf' ? (
                                <iframe src={selectedPreview.url} title={selectedPreview.name} className="w-full h-[75vh] border rounded" />
                            ) : (
                                <div className="text-center py-8">
                                    <p className="mb-4 text-gray-700">Preview not available for this file type: **{selectedPreview.type}**.</p>
                                    <a href={selectedPreview.url} download={selectedPreview.name} className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition">Download {selectedPreview.name}</a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}