

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token')
    if (token) {
        fetchHomeData()
    } else {
        handleLogin()
    }
})