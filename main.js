import { handleLogin } from "./auth/LoginHandler.js"
import { fetchHomeData } from "./home/fetchData.js"


document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token')
    if (token) {
        fetchHomeData()
    } else {
        handleLogin()
    }
})