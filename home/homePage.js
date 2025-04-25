import { handleLogout } from "../auth/LoginHandler.js";
import { AuditHandler } from "./audit.js";

export const HomeHandler = (user) => {
    document.body.innerHTML = ``;
    const container = document.createElement('div');
    container.className = "main-container";
    container.innerHTML = /*html*/ `
    <div class="profile">
        <div class="profile-header">
            <div class="user-greeting">
                <h1>Welcome back, <span class="user-name">${user.firstName} ${user.lastName}</span>!</h1>
            </div>
            <button id="logout-button" class="btn logout-btn">
                <i class="fa-solid fa-right-from-bracket"></i> Logout
            </button>
        </div>
</div>
    
    <div id="audits-info" class="audits-section">
          
    </div>
    
    
    `;

    document.body.appendChild(container);
    document.getElementById('logout-button')?.addEventListener('click', handleLogout);

    AuditHandler()
};
