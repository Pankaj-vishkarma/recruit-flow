/* -------------------------------- */
/* Get Token */
/* -------------------------------- */

export function getToken() {

    if (typeof window === "undefined") return null;

    return localStorage.getItem("token");
}



/* -------------------------------- */
/* Save JWT Token */
/* -------------------------------- */

export function saveToken(token) {

    if (typeof window === "undefined") return;

    localStorage.setItem("token", token);
}



/* -------------------------------- */
/* Remove Token */
/* -------------------------------- */

export function removeToken() {

    if (typeof window === "undefined") return;

    localStorage.removeItem("token");
}



/* -------------------------------- */
/* Logout */
/* -------------------------------- */

export function logout() {

    if (typeof window === "undefined") return;

    removeToken();

    window.location.href = "/login";
}



/* -------------------------------- */
/* Check Token Expiry */
/* -------------------------------- */

function isTokenExpired(token) {

    try {

        const payload = JSON.parse(atob(token.split(".")[1]));

        const exp = payload.exp * 1000;

        return Date.now() > exp;

    } catch (error) {

        return true;
    }
}



/* -------------------------------- */
/* Check Authentication */
/* -------------------------------- */

export function isAuthenticated() {

    const token = getToken();

    if (!token) return false;

    if (isTokenExpired(token)) {

        removeToken();

        return false;
    }

    return true;
}