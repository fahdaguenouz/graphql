import { handleLogout } from "../auth/LoginHandler.js";
import { AuditHandler } from "./audit.js";
import { levelHandler } from "./level.js";
import { SkillChart } from "./skills-chart.js";
import { XpChart } from "./xpchart.js";



export const HomeHandler = (user) => {
    document.body.innerHTML = ``;
    const container = document.createElement('div');
    container.className = "main-container";
    container.innerHTML = /*html*/ `
    <div class="profile">
        <div class="profile-header">
            <div class="user-greeting">
                <h1>Welcome, <span class="user-name">${user.firstName} ${user.lastName}</span>!</h1>
            </div>
            <button id="logout-button" class="btn logout-btn">
                <i class="fa-solid fa-right-from-bracket"></i> Logout
            </button>
        </div>
</div>
<div class="level-xp-section">
    <div class="current-level">
        <h2>Level</h2>
        <span id="level-value"></span>
    </div>
    <div class="total-xp">
        <h2>Total XP</h2>
        <span id="xp-value"></span>
    </div>
</div>

    
    <div id="audits-info" class="audits-section">
          
    </div>
    <div class="project-chart">

    </div>
    <div class="charts-container">
                <div class="chart-card">
                <div class="chart-header">
                        <h2>Skills </h2>
                    </div>
                    <div class="skill-chart"></div>
                </div>
                <div class="chart-card">
                    <div class="chart-header">
                        <h2>XP Over Time </h2>
                    </div>
                    <div class="xp-chart"></div>
                </div>
            </div>

    `;

    document.body.appendChild(container);
    document.getElementById('logout-button')?.addEventListener('click', handleLogout);
    levelHandler()
    AuditHandler()
    SkillChart();
    XpChart()

  
};
