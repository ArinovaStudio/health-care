"use client";
import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { deleteChronic } from "../actions/userAction";

export default function ChronicTable({ chronic, refreshUser }) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            const res = await deleteChronic(id);
            if (res.success) {
                toast.success("Successfully Deleted");
                await refreshUser();
            }
        } catch (error) {
            console.log(error);
            toast.error("Unable to delete");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-6">
            {/* ---------------------- DESKTOP TABLE ----------------------- */}
            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-xl shadow-xl overflow-hidden bg-white">
                    <thead>
                        <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                            <th className="py-3 px-4 text-center font-semibold">Condition</th>
                            <th className="py-3 px-4 text-center font-semibold">Date</th>
                            <th className="py-3 px-4 text-center font-semibold">Notes</th>
                            <th className="py-3 px-4 text-center font-semibold">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {chronic.map((item, index) => (
                            <tr
                                key={index}
                                className="border-b last:border-none hover:bg-blue-50/40 transition-all duration-300 text-center"
                            >
                                <td className="py-3 px-4 capitalize text-gray-700 font-medium">
                                    {item.conditionName}
                                </td>

                                <td className="py-3 px-4 text-gray-600">
                                    {item.date}
                                </td>

                                <td className="py-3 px-4 text-gray-700">
                                    {item.notes || "—"}
                                </td>

                                <td className="py-3 px-4 flex justify-center">
                                    <button
                                        disabled={loading}
                                        onClick={() => handleDelete(item._id)}
                                        className={`p-2 rounded-full transition-all duration-200
                                            hover:bg-red-100 hover:text-red-600
                                            ${loading && "opacity-50 cursor-not-allowed"}`}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ---------------------- MOBILE CARDS ----------------------- */}
            <div className="md:hidden space-y-4 mt-4">
                {chronic.map((item, index) => (
                    <div
                        key={index}
                        className="bg-white bg-opacity-80 backdrop-blur-xl p-5 rounded-xl border border-gray-200 shadow-lg"
                    >
                        {/* Header Row */}
                        <div className="flex justify-between mb-2 text-gray-600 text-sm">
                            <span className="font-semibold">Chronic #{index + 1}</span>
                            <span className="text-blue-600 font-medium">{item.date}</span>
                        </div>

                        {/* Details */}
                        <div className="space-y-2">
                            <p className="text-gray-900 text-base">
                                <span className="font-semibold text-gray-700">Condition: </span>
                                {item.conditionName}
                            </p>

                            <p className="text-gray-900 text-base">
                                <span className="font-semibold text-gray-700">Notes: </span>
                                {item.notes || "No additional notes."}
                            </p>
                        </div>

                        {/* Delete Button */}
                        <div className="flex justify-end mt-4">
                            <button
                                disabled={loading}
                                onClick={() => handleDelete(item._id)}
                                className={`p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition ${
                                    loading && "opacity-50 cursor-not-allowed"
                                }`}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
