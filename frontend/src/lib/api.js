const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
    console.error("NEXT_PUBLIC_API_URL is not defined in environment variables");
}


/* -------------------------------- */
/* Reusable API request helper */
/* -------------------------------- */

async function apiRequest(endpoint, options = {}) {

    try {

        const controller = new AbortController();

        const timeout = setTimeout(() => {
            controller.abort();
        }, 10000);

        // --------------------------------
        // STEP 1 AUTH SUPPORT
        // --------------------------------
        const token =
            typeof window !== "undefined"
                ? localStorage.getItem("token")
                : null;

        const res = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",

                // JWT header if available
                ...(token ? { Authorization: `Bearer ${token}` } : {}),

                ...(options.headers || {})
            },
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!res.ok) {

            const text = await res.text();

            throw new Error(`API ${res.status}: ${text}`);
        }

        const data = await res.json();

        return data;

    } catch (error) {

        console.error("API error:", error);

        return {
            status: "error",
            message: error.message || "Network error"
        };
    }
}



/* -------------------------------- */
/* Chat API */
/* -------------------------------- */

export async function sendMessage(message, candidateName = "candidate") {

    if (!message) {
        return { status: "error", message: "Message cannot be empty" };
    }

    return apiRequest("/chat/", {
        method: "POST",
        body: JSON.stringify({
            message,
            candidate_name: candidateName
        })
    });
}



/* -------------------------------- */
/* Schedule Interview API */
/* -------------------------------- */

export async function scheduleInterview(slot, candidateName = "candidate") {

    if (!slot) {
        return { status: "error", message: "Slot is required" };
    }

    return apiRequest("/schedule/", {
        method: "POST",
        body: JSON.stringify({
            slot,
            candidate_name: candidateName
        })
    });
}



/* -------------------------------- */
/* Single Candidate Data */
/* -------------------------------- */

export async function getCandidateData(candidateName = "candidate") {

    return apiRequest(`/candidate/${candidateName}`);
}



/* -------------------------------- */
/* Candidate List (Pagination Added) */
/* -------------------------------- */

export async function getCandidates(page = 1, limit = 10) {

    return apiRequest(`/candidates?page=${page}&limit=${limit}`);
}



/* -------------------------------- */
/* NEW: Update Candidate Status */
/* -------------------------------- */

export async function updateCandidateStatus(name, status) {

    if (!name || !status) {
        return { status: "error", message: "Name and status required" };
    }

    return apiRequest(`/candidate/${name}/status`, {
        method: "PATCH",
        body: JSON.stringify({
            status
        })
    });

}



/* -------------------------------- */
/* NEW: Delete Candidate */
/* -------------------------------- */

export async function deleteCandidate(name) {

    if (!name) {
        return { status: "error", message: "Candidate name required" };
    }

    return apiRequest(`/candidate/${name}`, {
        method: "DELETE"
    });

}



/* -------------------------------- */
/* Authentication APIs */
/* -------------------------------- */

export async function loginUser(email, password) {

    return apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
            email,
            password
        })
    });

}

export async function registerUser(name, email, password) {

    return apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
            name,
            email,
            password
        })
    });

}