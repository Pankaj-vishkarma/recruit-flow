const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
    throw new Error("API URL missing. Check NEXT_PUBLIC_API_URL");
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
            next: { revalidate: 0 },

            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                ...(options.headers || {}),
                ...(token ? { Authorization: `Bearer ${token}` } : {})
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
                success: false,
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

            return {
                success: false,
                message: errorMessage
            };
        }


        const data = await res.json().catch(() => ({}));

        return {
            success: true,
            data,
            ...data
        };

    } catch (error) {

        console.error("API ERROR:", {
            endpoint,
            message: error.message
        });

        clearTimeout(timeout);


        /* ---------------------- */
        /* Retry Logic */
        /* ---------------------- */

        if (retry > 0 && error.name !== "AbortError") {

            console.log("Retrying API request...");

            await new Promise(res => setTimeout(res, 4000));

            return apiRequest(endpoint, options, retry - 1);

        }


        if (error.name === "AbortError") {

            return {
                success: false,
                message: "Server is waking up, please try again..."
            };

        }

        return {
            success: false,
            message: error.message || "Network error"
        };
    }
}


/* -------------------------------- */
/* CHAT API */
/* -------------------------------- */

export async function sendMessage(message, candidateName = "candidate") {

    if (!message) {
        return { success: false, message: "Message cannot be empty" };
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
        return { success: false, message: "Slot is required" };
    }

    return apiRequest("/schedule", {
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

    return apiRequest(`/candidate/all?page=${page}&limit=${limit}`);
}


/* -------------------------------- */
/* UPDATE CANDIDATE STATUS */
/* -------------------------------- */

export async function updateCandidateStatus(id, status) {

    if (!id || !status) {
        return { success: false, message: "ID and status required" };
    }

    return apiRequest(`/candidate/status/${id}`, {
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
        return { success: false, message: "Candidate id required" };
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
        return { success: false, message: "Google token required" };
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

    if (!res || res.success === false) {
        return { data: null };
    }

    return res;
};