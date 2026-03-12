"use client";

import { useEffect, useState } from "react";
import {
    getCandidateProfile,
    updateCandidateProfile,
} from "@/lib/api";

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

            await updateCandidateProfile(profile);

            alert("Profile updated successfully");

        } catch (err) {

            console.error(err);

            alert("Profile update failed");

        }
    };

    if (loading) {
        return <div>Loading profile...</div>;
    }

    return (
        <div style={{ padding: "40px" }}>

            <h2>Candidate Profile</h2>

            <div style={{ marginTop: "20px" }}>

                <label>Name</label>

                <input
                    name="name"
                    value={profile.name || ""}
                    onChange={handleChange}
                />

            </div>

            <div style={{ marginTop: "20px" }}>

                <label>Experience</label>

                <input
                    name="experience"
                    value={profile.experience || ""}
                    onChange={handleChange}
                />

            </div>

            <div style={{ marginTop: "20px" }}>

                <label>Skills (comma separated)</label>

                <input
                    name="skills"
                    value={profile.skills || ""}
                    onChange={handleChange}
                />

            </div>

            <div style={{ marginTop: "20px" }}>

                <button onClick={handleSave}>
                    Save Profile
                </button>

            </div>

        </div>
    );
}