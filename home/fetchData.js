import { USER_INFO } from "../query/graphql.js";
import { DATA_URL } from "../utils/urls.js";
import { HomeHandler } from "./homePage.js";

export const fetchHomeData = async () => {
    const token = localStorage.getItem('token');

    try {
        const response = await fetchdata(USER_INFO, {}, token);

        if (Array.isArray(response.errors)) {
            throw new Error(response.errors[0].message);
        }

        const user = response?.data.user;

        if (response && Array.isArray(user)) {
            HomeHandler(user[0]);
        } else {
            throw new Error("Invalid data");
        }

    } catch (err) {
        if (err.message.includes('JWTExpired')) {
            handleLogout();
        }
        console.error(err);
    }
}

export const fetchdata = async (query, variables=null, token) => {
    const response = await fetch(DATA_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            query: query,
            variables: variables,
        }),
    });

    return response.json();
};