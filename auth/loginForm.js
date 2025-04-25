export const loginForm = () => {
    const container = document.createElement('div');
    container.innerHTML = /*html*/`
    <div class="login-container">
        <form class="login-card" id="login-form">
            <h1>Login</h1>
            <input type="text" id="username" placeholder="username or email" required/>
            <input type="password" id="password" placeholder="password" required/>
            <span class="error" id="login-error"></span>
            <button id="login-button" class="btn">Login <i class="fa-solid fa-right-to-bracket"></i></button>
        </form>
    </div>`

    document.body.appendChild(container);

}
