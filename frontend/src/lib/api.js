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

async function apiRequest(endpoint, options = {}, retry = 1) {

    const controller = new AbortController();

    // Increase timeout for Render cold start
    const timeout = setTimeout(() => {
        controller.abort();
    }, 60000);

    try {

        const token = getToken();

        const res = await fetch(`${API_URL}${endpoint}`, {

            ...options,

            cache: "no-store",

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


        /* ---------------------- */
        /* API Error Handling */
        /* ---------------------- */

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

        clearTimeout(timeout);


        /* ---------------------- */
        /* Retry Logic */
        /* ---------------------- */

        if (retry > 0 && error.name !== "AbortError") {

            console.log("Retrying API request...");

            await new Promise(res => setTimeout(res, 2000));

            return apiRequest(endpoint, options, retry - 1);

        }


        if (error.name === "AbortError") {

            return {
                status: "error",
                message: "Server taking too long to respond"
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

    return apiRequest(`/dashboard/candidates?page=${page}&limit=${limit}`);
}


/* -------------------------------- */
/* UPDATE CANDIDATE STATUS */
/* -------------------------------- */

export async function updateCandidateStatus(id, status) {

    if (!id || !status) {
        return { status: "error", message: "ID and status required" };
    }

    return apiRequest(`/dashboard/candidate/${id}`, {
        method: "PUT",
        body: JSON.stringify({
            status
        })
    });
}


/* -------------------------------- */
/* DELETE CANDIDATE */
/* -------------------------------- */

export async function deleteCandidate(id) {

    if (!id) {
        return { status: "error", message: "Candidate id required" };
    }

    return apiRequest(`/dashboard/candidate/${id}`, {
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


/* -------------------------------- */
/* GOOGLE LOGIN */
/* -------------------------------- */

export async function googleLogin(token) {

    if (!token) {
        return { status: "error", message: "Google token required" };
    }

    return apiRequest("/auth/google", {
        method: "POST",
        body: JSON.stringify({
            token
        })
    });

}


/* -------------------------------- */
/* Candidate Profile APIs */
/* -------------------------------- */

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


/* -------------------------------- */
/* Candidate Dashboard API */
/* -------------------------------- */

export const getCandidateDashboard = async () => {

    const res = await apiRequest("/candidate/dashboard", {
        method: "GET"
    });

    if (!res || res.status === "error") {
        return { data: null };
    }

    return res;
};