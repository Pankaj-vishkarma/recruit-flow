/* -------------------------------- */
/* Save JWT Token */
/* -------------------------------- */

export function saveToken(token) {

    if (typeof window === "undefined") return;

    localStorage.setItem("token", token);
}



/* -------------------------------- */
/* Get JWT Token */
/* -------------------------------- */

export function getToken() {

    if (typeof window === "undefined") return null;

    return localStorage.getItem("token");
}



/* -------------------------------- */
/* Remove Token (Logout) */
/* -------------------------------- */

export function logout() {

    if (typeof window === "undefined") return;

    localStorage.removeItem("token");

    window.location.href = "/login";
}



/* -------------------------------- */
/* Check Authentication */
/* -------------------------------- */

export function isAuthenticated() {

    if (typeof window === "undefined") return false;

    const token = localStorage.getItem("token");

    return !!token;
}