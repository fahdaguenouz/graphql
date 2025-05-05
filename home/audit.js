import { AUDITS_INFO } from "../query/graphql.js";
import { Toast } from "../utils/toast.js";
import { fetchdata } from "./fetchData.js";

export const AuditHandler = async () => {
    const token = localStorage.getItem("token");
    let data

 try {
        const response = await fetchdata(AUDITS_INFO, {}, token);

        if (Array.isArray(response.errors)) {
            throw new Error(response.errors[0].message);
        }

        data = response?.data.user[0];

        if (!response && typeof data !== 'object') {
            throw new Error("Invalid data received!");
        }

    } catch (err) {
        if (err.message.includes('JWTExpired')) {
            handleLogout();
        }
        console.error(err);
        Toast(err)
    }

    const succeeded = data?.audits_aggregate?.aggregate?.count || 0;
    const failed = data?.failed_audits?.aggregate?.count || 0;
    const total = succeeded + failed;

    const succeededPercentage = total ? ((succeeded / total) * 100).toFixed(1) : "No Data";
    const failedPercentage = total ? ((failed / total) * 100).toFixed(1) : "No Data";
    const auditRatio = data?.auditRatio ? data.auditRatio.toFixed(1) : "No Data";


    const container = document.getElementById("audits-info");
    container.innerHTML = /*html*/ `
    <div class="chart-border"></div>
    <h2 class="audits-title">Your Audit Statistics</h2>
    <div class="audits-grid">
        <div class="audit-card">
            <span class="audit-number">${auditRatio}</span>
            <span class="audit-label">Audit Ratio</span>
        </div>
        <div class="audit-card">
            <span class="audit-number">${total || "No Data"}</span>
            <span class="audit-label">Total Audits</span>
        </div>
        <div class="audit-card">
            <span class="audit-number" style="color:green;">${succeededPercentage} %</span>
            <span class="audit-label">Success Rate</span>
        </div>
        <div class="audit-card">
            <span class="audit-number" style="color:red;">${failedPercentage} %</span>
            <span class="audit-label">Fail Rate</span>
        </div>
    </div>
`;
};