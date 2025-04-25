import { fetchHomeData } from "../home/fetchData.js"
import { AUTH } from "../utils/config.js"
import { loginForm } from "./loginForm.js"


export const handleLogin = () => {
    loginForm()
    const form = document.getElementById("login-form")
    form.addEventListener('submit', async (e) => {
        e.preventDefault()
        const credentials = {
            username: form?.username.value,
            password: form?.password.value,
        }
        try {
            const response = await HandelSubmitLogin(credentials)
            if (response.error) {
                throw response.error
            }
            localStorage.setItem('token', response)
            fetchHomeData()
        } catch (error) {
           console.log(error);
           
        }
    })
}

export const handleLogout = () => {
    localStorage.removeItem('token')
    document.body.innerHTML = ``
    handleLogin()
}

export const HandelSubmitLogin = async (credentials) => {
    const response = await fetch(AUTH, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${btoa(credentials.username + ":" + credentials.password)}`
        }
    });
    return response.json();
}
