"use client";
import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { deleteAllergy } from "../actions/userAction";

export default function AllergyTable({ allergies, refreshUser }) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            const res = await deleteAllergy(id);
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
                        <tr className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
                            <th className="py-3 px-4 text-center font-semibold">#</th>
                            <th className="py-3 px-4 text-center font-semibold">Allergy</th>
                            <th className="py-3 px-4 text-center font-semibold">Reaction</th>
                            <th className="py-3 px-4 text-center font-semibold">Type</th>
                            <th className="py-3 px-4 text-center font-semibold">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {allergies.map((item, index) => (
                            <tr
                                key={index}
                                className="border-b last:border-none hover:bg-teal-50/40 transition-all duration-300"
                            >
                                <td className="py-3 px-4 text-center text-gray-700 font-medium">
                                    {index + 1}
                                </td>

                                <td className="py-3 px-4 text-center capitalize text-gray-700">
                                    {item.name}
                                </td>

                                <td className="py-3 px-4 text-center text-gray-600">
                                    {item.reaction}
                                </td>

                                <td className="py-3 px-4 text-center text-gray-700">
                                    <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm">
                                        {item.type}
                                    </span>
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
                {allergies.map((item, index) => (
                    <div
                        key={index}
                        className="bg-white bg-opacity-80 backdrop-blur-xl p-5 rounded-xl border border-gray-200 shadow-lg"
                    >
                        <div className="flex justify-between mb-2 text-gray-600 text-sm">
                            <span className="font-semibold">Allergy #{index + 1}</span>
                            <span className="text-teal-600 font-medium">{item.type}</span>
                        </div>

                        <div className="space-y-2">
                            <p className="text-gray-900 text-base">
                                <span className="font-semibold text-gray-700">Name: </span>
                                {item.name}
                            </p>

                            <p className="text-gray-900 text-base">
                                <span className="font-semibold text-gray-700">Reaction: </span>
                                {item.reaction}
                            </p>
                        </div>

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
