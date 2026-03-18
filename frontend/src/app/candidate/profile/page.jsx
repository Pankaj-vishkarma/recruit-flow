"use client";

import { useEffect, useState } from "react";
import {
    getCandidateProfile,
    updateCandidateProfile,
} from "@/lib/api";
import { User, Save } from "lucide-react";

export default function CandidateProfilePage() {

    const [profile, setProfile] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {

        try {

            const res = await getCandidateProfile();
            setProfile(res.data);

        } catch (err) {

            console.error(err);
            alert("Failed to load profile");

        } finally {

            setLoading(false);

        }
    };

    const handleChange = (e) => {

        const { name, value } = e.target;

        setProfile({
            ...profile,
            [name]: value,
        });

    };

    const handleSave = async () => {

        try {

            const payload = {
                name: profile.name || "",
                experience: profile.experience || "",
                skills: Array.isArray(profile.skills)
                    ? profile.skills
                    : profile.skills
                        ?.split(",")
                        .map(s => s.trim())
                        .filter(Boolean)
            };

            console.log("🚀 SENDING PAYLOAD:", payload);

            const res = await updateCandidateProfile(payload);

            console.log("🔥 API RESPONSE:", res);

            if (!res || !res.success) {
                throw new Error(res?.message || "Update failed");
            }

            alert("Profile updated successfully");

        } catch (err) {

            console.error("❌ UPDATE ERROR:", err);
            alert(err.message || "Profile update failed");

        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh] text-gray-400">
                Loading profile...
            </div>
        );
    }

    return (

        <div className="max-w-3xl mx-auto px-4 py-6 lg:py-10">

            {/* Header */}

            <div className="mb-8">

                <div className="flex items-center gap-3 mb-2">

                    <div className="bg-indigo-600/20 text-indigo-400 p-2 rounded-lg">
                        <User size={20} />
                    </div>

                    <h1 className="text-2xl font-semibold text-white">
                        Candidate Profile
                    </h1>

                </div>

                <p className="text-sm text-gray-400">
                    Update your personal information, experience, and skills.
                </p>

            </div>


            {/* Profile Card */}

            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl hover:shadow-lg transition duration-200 p-6 space-y-6">


                {/* Name */}

                <div className="flex flex-col gap-2">

                    <label className="text-sm text-gray-400">
                        Name
                    </label>

                    <input
                        name="name"
                        value={profile.name || ""}
                        onChange={handleChange}
                        className="bg-black/40 border border-gray-700 text-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />

                </div>


                {/* Experience */}

                <div className="flex flex-col gap-2">

                    <label className="text-sm text-gray-400">
                        Experience
                    </label>

                    <input
                        name="experience"
                        value={profile.experience || ""}
                        onChange={handleChange}
                        className="bg-black/40 border border-gray-700 text-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />

                </div>


                {/* Skills */}

                <div className="flex flex-col gap-2">

                    <label className="text-sm text-gray-400">
                        Skills (comma separated)
                    </label>

                    <input
                        name="skills"
                        value={
                            Array.isArray(profile.skills)
                                ? profile.skills.join(", ")
                                : profile.skills || ""
                        }
                        onChange={handleChange}
                        className="bg-black/40 border border-gray-700 text-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />

                </div>


                {/* Save Button */}

                <div className="pt-2">

                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                    >

                        <Save size={16} />

                        Save Profile

                    </button>

                </div>

            </div>

        </div>

    );
}