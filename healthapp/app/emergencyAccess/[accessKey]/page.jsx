"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { FileText, Calendar, User, Eye, X, Hash, Tag ,StickyNote } from "lucide-react";
import Image from "next/image";
import {
  addPrescribedMedicationDoctorAction,
  fetchMedicalFile,
  fetchPrescribedFile,
} from "@/app/actions/recordsAction";
import toast from "react-hot-toast";
import { backendUrl } from "@/app/actions/auth";

export default function EmergencyAccessPage() {
  const { accessKey } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [isPrescribedOpen, setIsPrescribedOpen] = useState(false);
  const [prescribedFile, setPrescribedFile] = useState(null);
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchEmergencyData = async () => {
      try {
        const res = await axios.get(
          `${backendUrl}/api/profile/emergency-access/${accessKey}`
        );
        if (res.data.success) {
          setData(res.data.data);
          console.log("Emergency Data:", res.data.data);
        } else {
          throw new Error(res.data.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (accessKey) fetchEmergencyData();
  }, [accessKey]);

  const handleAdd = async () => {
    try {
      if (!prescribedFile) {
        console.log("NO FILE");
        toast.error("Please choose a file to upload");
        return;
      }

      setLoading(true);

      const formData = new FormData();
      formData.append("file", prescribedFile);
      formData.append("accessKey", accessKey);
      formData.append("description", description);

      const res = await addPrescribedMedicationDoctorAction(formData);
      const newDoc = res.data;
      // console.log("API RESPONSE = ", res);

      if (res.success) {
        toast.success("Prescription uploaded");

        // console.log("DATA BEFORE SET: ", res.data);

        setData((prev) => ({
          ...prev,
          currentMedications: [...prev.currentMedications, newDoc],
        }));

        setIsPrescribedOpen(false);
        setPrescribedFile(null);
      } else {
        toast.error(res.message || "Upload failed");
      }
    } catch (err) {
      // console.log("CATCH ERROR = ", err);
      toast.error("Unable to save the data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatRecordType = (type) => {
    if (!type) return "Other";
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // ✅ Fetch file from backend and show preview
  const openPreview = async (recordId, fileType, fileName, recordType = "prescribed") => {
    try {
      setLoadingPreview(true);
      let res;
      if (recordType === "prescribed"){
        res = await fetchPrescribedFile(recordId);
      }
      else if (recordType === "medical"){
        res = await fetchMedicalFile(recordId);
      }
      else{
        throw new Error("Invalid record type for preview");
      }
      
      if (res.success) {
        const blob = res.data;
        const url = URL.createObjectURL(blob);
        const contentType =
          res.headers["content-type"] ||
          (fileType === "pdf"
            ? "application/pdf"
            : ["png", "jpg", "jpeg"].includes(fileType)
            ? `image/${fileType}`
            : "application/octet-stream");
        setPreviewFile({ url, type: contentType, name: fileName });
      } else {
        alert(res.message || "Failed to fetch file");
      }
    } catch (err) {
      console.error("Preview failed:", err);
      alert("Unable to preview this file");
    } finally {
      setLoadingPreview(false);
    }
  };

  const closePreview = () => {
    if (previewFile?.url) URL.revokeObjectURL(previewFile.url);
    setPreviewFile(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="w-12 h-12 border-4 border-t-4 border-t-teal-500 border-gray-200 rounded-full animate-spin"></div>
        <p className="mt-4 text-xl font-semibold text-teal-600">
          Loading critical medical data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-100 p-4">
        <div className="p-8 bg-white rounded-xl shadow-lg border-l-4 border-red-600">
          <p className="text-2xl font-bold text-red-700 mb-2">
            🚨 Access Error
          </p>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <p className="text-xl text-gray-600">
          No emergency data found for this key.
        </p>
      </div>
    );
  }

  const {
    personalInfo,
    allergies,
    chronicConditions,
    emergencyContact,
    currentMedications,
    medicalRecords,
  } = data;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 font-inter">
      {/* ✅ Preview Modal */}
      {previewFile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm p-4"
          onClick={closePreview}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closePreview}
              className="absolute top-4 right-4 z-10 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="p-2 overflow-y-auto max-h-[80vh]">
              {loadingPreview ? (
                <p className="text-center py-8">Loading preview...</p>
              ) : previewFile.type.startsWith("image/") ? (
                <div className="relative w-full flex justify-center p-4">
                  <Image
                    src={previewFile.url}
                    alt={previewFile.name}
                    width={800}
                    height={800}
                    className="max-w-full h-auto object-contain rounded-lg shadow-lg"
                    style={{ maxHeight: "75vh" }}
                  />
                </div>
              ) : previewFile.type === "application/pdf" ? (
                <iframe
                  src={previewFile.url}
                  title={previewFile.name}
                  className="w-full h-[75vh] border-0"
                />
              ) : (
                <div className="text-center py-8">
                  <p className="mb-4">
                    Preview not available for this file type.
                  </p>
                  <a
                    href={previewFile.url}
                    download={previewFile.name}
                    className="px-4 py-2 bg-teal-600 text-white rounded"
                  >
                    Download {previewFile.name}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Rest of the Page --- */}
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl p-6 sm:p-10 space-y-8 border-t-8 border-teal-500">
        <h1 className="text-4xl font-extrabold text-teal-700 text-center tracking-tight">
          🏥 Emergency Medical Information
        </h1>
        <p className="text-center text-gray-500 text-sm">
          This information is provided for emergency responders. Please use with
          caution.
        </p>

        {/* Personal Info & Core Data (Kept the same) */}
        <section className="space-y-4 p-5 bg-teal-50 rounded-xl shadow-inner border border-teal-200">
          <h2 className="text-2xl font-bold text-teal-700 border-b pb-2 mb-2 border-teal-300">
            👤 Personal Profile
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p className="text-gray-700 p-2 bg-white rounded-lg shadow-sm">
              <span className="font-semibold text-gray-900 block text-sm">
                Name:
              </span>
              <span className="font-extrabold text-lg">
                {personalInfo.fullName}
              </span>
            </p>
            <p className="text-gray-700 p-2 bg-white rounded-lg shadow-sm">
              <span className="font-semibold text-gray-900 block text-sm">
                Gender:
              </span>
              <span className="font-medium">{personalInfo.gender}</span>
            </p>
            <p className="text-gray-700 p-2 bg-white rounded-lg shadow-sm">
              <span className="font-semibold text-gray-900 block text-sm">
                Mobile:
              </span>
              <span className="font-medium">{personalInfo.phone}</span>
            </p>
            <p className="text-gray-700 p-2 bg-red-100 rounded-lg shadow-md border border-red-300">
              <span className="font-bold text-red-800 block text-sm">
                🩸 Blood Group:
              </span>
              <span className="font-extrabold text-2xl text-red-700">
                {personalInfo.bloodGroup || "N/A"}
              </span>
            </p>
          </div>
        </section>

        {/* Medical Alerts (Allergies and Conditions) (Kept the same) */}
        <section className="space-y-4 p-5 bg-red-50 rounded-xl shadow-md border-l-4 border-red-500">
          <h2 className="text-2xl font-bold text-red-700 border-b pb-2 mb-2 border-red-300">
            ⚠️ Critical Alerts
          </h2>
          <div className="space-y-3">
            {/* Allergies */}
            <div>
              <span className="font-bold text-gray-900 block mb-1">
                Allergies:
              </span>
              <p className="text-gray-800 bg-white p-3 rounded-lg shadow-sm border border-red-200">
                {allergies?.length ? (
                  allergies.map((a) => (
                    <span
                      key={a.name}
                      className="inline-block bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full mr-2 mb-1"
                    >{`${a.name} (${a.reaction})`}</span>
                  ))
                ) : (
                  <span className="text-green-600 font-semibold">
                    None reported.
                  </span>
                )}
              </p>
            </div>
            {/* Chronic Conditions */}
            <div>
              <span className="font-bold text-gray-900 block mb-1">
                Chronic Conditions:
              </span>
              <p className="text-gray-800 bg-white p-3 rounded-lg shadow-sm border border-teal-200">
                {chronicConditions?.length ? (
                  chronicConditions.map((a) => (
                    <span
                      key={a.conditionName}
                      className="inline-block bg-teal-500 text-white text-xs font-semibold px-2 py-1 rounded-full mr-2 mb-1"
                    >
                      {a.conditionName}
                    </span>
                  ))
                ) : (
                  <span className="text-green-600 font-semibold">
                    None reported.
                  </span>
                )}
              </p>
            </div>
          </div>
        </section>

        {/* Emergency Contact (Kept the same) */}
        <section className="space-y-4 p-5 bg-blue-50 rounded-xl shadow-md border-l-4 border-blue-500">
          <h2 className="text-2xl font-bold text-blue-700 border-b pb-2 mb-2 border-blue-300">
            📞 Emergency Contact
          </h2>
          {emergencyContact ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <p className="text-gray-700 p-2 bg-white rounded-lg shadow-sm">
                <span className="font-semibold text-gray-900 block text-sm">
                  Contact Name:
                </span>
                <span className="font-medium">
                  {emergencyContact.contactName || "N/A"}
                </span>
              </p>
              <p className="text-gray-700 p-2 bg-white rounded-lg shadow-sm">
                <span className="font-semibold text-gray-900 block text-sm">
                  Contact Phone:
                </span>
                <a
                  href={`tel:${emergencyContact.phone}`}
                  className="text-blue-600 font-bold hover:underline transition-colors duration-200"
                >
                  {emergencyContact.contactNumber ||
                    emergencyContact.phone ||
                    "N/A"}
                </a>
              </p>
            </div>
          ) : (
            <p className="text-gray-500 italic p-3">
              No emergency contact information available.
            </p>
          )}
        </section>
        {/* 💊 Medication Records */}
        <section className="space-y-4 p-5 bg-green-50 rounded-xl shadow-md border-l-4 border-green-500">
          <h2 className="text-2xl font-bold text-green-700 border-b pb-2 mb-2 border-green-300 flex items-center gap-2">
            <FileText size={28} className="text-green-600" /> Medication Records
          </h2>
          {currentMedications?.length > 0 ? (
            <div className="space-y-3">
              {currentMedications.map((record, index) => (
                <div
                  key={record._id || index}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white rounded-lg shadow-md border border-green-100 hover:border-green-300 transition-all duration-200"
                >
                  <div className="flex-grow space-y-1 mb-2 sm:mb-0">
                    <p className="font-bold text-gray-900 flex items-center gap-2">
                      <FileText size={18} className="text-gray-500" />
                      Prescription Record #{index + 1}
                    </p>
                    <p className="font-semibold text-gray-900 flex items-center gap-2">
                      <StickyNote  size={18} className="text-gray-500" />
                      Description : {record.description || "null"}
                    </p>
                    <div className="flex flex-wrap gap-x-4 text-sm text-gray-700">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} className="text-green-500" />
                        <span className="font-semibold">Date:</span>{" "}
                        {formatDate(record.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <User size={14} className="text-green-500" />
                        <span className="font-semibold">Uploaded By:</span>{" "}
                        {record.uploadedBy || "None"}
                      </span>
                    </div>
                  </div>

                  {/* ✅ Preview Button */}
                  <button
                    onClick={() =>
                      openPreview(record._id, record.fileType, record.fileName, "prescribed")
                    }
                    className="flex items-center gap-2 bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition-colors"
                  >
                    <Eye size={16} /> View Preview
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500 italic">
                No prescribed medication records available.
              </p>
            </div>
          )}
        </section>

        {/* 📄 General Medical Records (NEW SECTION) */}
        <section className="space-y-4 p-5 bg-indigo-50 rounded-xl shadow-md border-l-4 border-indigo-500">
          <h2 className="text-2xl font-bold text-indigo-700 border-b pb-2 mb-2 border-indigo-300 flex items-center gap-2">
            <FileText size={28} className="text-indigo-600" /> General Medical
            Records
          </h2>
          {medicalRecords?.length > 0 ? (
            <div className="space-y-4">
              {medicalRecords.map((record, index) => (
                <div
                  key={record._id || index}
                  className="flex flex-col md:flex-row justify-between items-start p-4 bg-white rounded-lg shadow-md border border-indigo-100 hover:border-indigo-300 transition-all duration-200"
                >
                  <div className="flex-grow space-y-2 mb-3 md:mb-0 md:pr-4">
                    {/* Title */}
                    <p className="font-extrabold text-lg text-gray-900 flex items-center gap-2">
                      <Hash size={20} className="text-indigo-500" />
                      {record.title || `Record #${index + 1}`}
                    </p>

                    {/* Type and Date */}
                    <div className="flex flex-wrap gap-x-6 text-sm text-gray-700">
                      <span className="flex items-center gap-1">
                        <Tag size={14} className="text-indigo-500" />
                        <span className="font-semibold">Type:</span>{" "}
                        {formatRecordType(record.recordType)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} className="text-indigo-500" />
                        <span className="font-semibold">Date:</span>{" "}
                        {formatDate(record.date || record.createdAt)}
                      </span>
                    </div>

                    {/* Description */}
                    {record.description && (
                      <p className="text-sm text-gray-600 mt-1 italic border-l-2 pl-2 border-gray-200">
                        {record.description}
                      </p>
                    )}

                    {/* Uploaded By */}
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-2">
                      <User size={12} className="text-indigo-500" />
                      <span className="font-semibold">Uploaded By:</span>{" "}
                      {record.uploadedBy || "Patient"}
                    </p>
                  </div>

                  {/* Preview Button - Note: The 'false' parameter indicates it's NOT a medication file */}
                  <button
                    onClick={() =>
                      openPreview(
                        record._id,
                        record.fileType,
                        record.fileName,
                        "medical"
                      )
                    }
                    className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition-colors mt-2 md:mt-0"
                  >
                    <Eye size={16} /> View File
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500 italic">
                No general medical records available.
              </p>
            </div>
          )}
        </section>

        <button
          className="px-4 py-2 flex items-center gap-2 bg-teal-600 text-white font-medium rounded-lg shadow hover:bg-teal-700 transition"
          onClick={() => setIsPrescribedOpen(!isPrescribedOpen)}
        >
          <span className="text-lg font-bold">+</span>
          Add Medications
        </button>

        {isPrescribedOpen && (
          <div className="mt-6 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-6 mb-6 border-2 border-teal-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add new Medication
            </h3>

            <div className="space-y-5">
              {/* File Input */}
              <div>
                <label
                  htmlFor="prescriptionFile"
                  className="font-semibold text-gray-700"
                >
                  Upload File
                </label>
                <input
                  id="prescriptionFile"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => setPrescribedFile(e.target.files[0] || null)}
                  className="w-full mt-2 border-2 border-gray-500 rounded border-dashed p-4 cursor-pointer"
                />
                {prescribedFile && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: {prescribedFile.name}
                  </p>
                )}
              </div>

              {/* Description Input */}
              <div>
                <label
                  htmlFor="description"
                  className="font-semibold text-gray-700"
                >
                  Description
                </label>
                <input
                  id="description"
                  type="text"
                  placeholder="Enter description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full mt-2 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={handleAdd}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    loading
                      ? "bg-teal-300 cursor-not-allowed text-white"
                      : "bg-teal-600 hover:bg-teal-700 text-white"
                  }`}
                >
                  {loading ? "Uploading..." : "Upload Prescription"}
                </button>

                <button
                  onClick={() => {
                    setIsPrescribedOpen(false);
                    setPrescribedFile(null);
                    setDescription("");
                  }}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    loading
                      ? "bg-gray-200 cursor-not-allowed text-gray-400"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="text-center text-sm text-gray-400 pt-4 border-t border-gray-100">
          Last updated securely via{" "}
          <span className="font-semibold text-teal-500">MediLink</span> © 2025
        </div>
      </div>
    </div>
  );
}
