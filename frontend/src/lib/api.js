const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
    console.error("NEXT_PUBLIC_API_URL is not defined in environment variables");
}


/* -------------------------------- */
/* TOKEN HELPER */
/* -------------------------------- */

function getToken() {

    if (typeof window === "undefined") return null;

    return localStorage.getItem("token");
}



/* -------------------------------- */
/* CORE API REQUEST */
/* -------------------------------- */

async function apiRequest(endpoint, options = {}) {

    const controller = new AbortController();

    const timeout = setTimeout(() => {
        controller.abort();
    }, 10000);

    try {

        const token = getToken();

        const res = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",

                ...(token ? { Authorization: `Bearer ${token}` } : {}),

                ...(options.headers || {})
            },
            signal: controller.signal
        });

        clearTimeout(timeout);


        /* ---------------------- */
        /* Unauthorized Handling */
        /* ---------------------- */

        if (res.status === 401) {

            if (typeof window !== "undefined") {
                localStorage.removeItem("token");
                window.location.href = "/login";
            }

            return {
                status: "error",
                message: "Session expired"
            };
        }


        if (!res.ok) {

            let errorMessage = "API request failed";

            try {
                const errorData = await res.json();
                errorMessage = errorData.detail || JSON.stringify(errorData);
            } catch {
                errorMessage = await res.text();
            }

            throw new Error(`API ${res.status}: ${errorMessage}`);
        }

        const data = await res.json();

        return data;

    } catch (error) {

        console.error("API error:", error);

        if (error.name === "AbortError") {
            return {
                status: "error",
                message: "Request timeout"
            };
        }

        return {
            status: "error",
            message: error.message || "Network error"
        };
    }
}



/* -------------------------------- */
/* CHAT API */
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
/* SCHEDULE INTERVIEW */
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
/* SINGLE CANDIDATE DATA */
/* -------------------------------- */

export async function getCandidateData(candidateName = "candidate") {

    return apiRequest(`/candidate/${candidateName}`);
}



/* -------------------------------- */
/* CANDIDATE LIST */
/* -------------------------------- */

export async function getCandidates(page = 1, limit = 10) {

    return apiRequest(`/candidates?page=${page}&limit=${limit}`);
}



/* -------------------------------- */
/* UPDATE CANDIDATE STATUS */
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
/* DELETE CANDIDATE */
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
/* AUTHENTICATION */
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



// --------------------------------------------------
// Candidate Profile APIs
// --------------------------------------------------

export const getCandidateProfile = async () => {

    return apiRequest("/candidate/profile", {
        method: "GET"
    });

};


export const updateCandidateProfile = async (data) => {

    return apiRequest("/candidate/profile", {
        method: "PUT",
        body: JSON.stringify(data)
    });

};


// --------------------------------------------------
// Candidate Dashboard API
// --------------------------------------------------

export const getCandidateDashboard = async () => {

    const res = await apiRequest("/candidate/dashboard", {
        method: "GET"
    });

    if (!res || res.status === "error") {
        return { data: null };
    }

    return res;
};