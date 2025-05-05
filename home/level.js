import { USER_LEVEL_XP } from "../query/graphql.js";
import { XpFormat } from "../utils/funcs.js";
import { Toast } from "../utils/toast.js";
import { fetchdata } from "./fetchData.js";

export const levelHandler = async () => {
    const token = localStorage.getItem("token");

    try {
        const res = await fetchdata(USER_LEVEL_XP, { arg: "%module/checkpoint%" }, token);

        if (Array.isArray(res.errors)) {
            throw res.errors[0].message;
        }

        const levelRaw = res.data.user?.[0]?.transactions?.[0]?.amount;
        const levelValue = levelRaw ? levelRaw : "No Data";

        const totalXP = res.data.transaction?.length
            ? res.data.transaction.reduce((sum, tx) => sum + (tx.amount || 0), 0)
            : 0;
        const totalXPFormatted = totalXP ? XpFormat(totalXP) : "No Data";
        document.getElementById('level-value').textContent = ` ${levelValue}`;
        document.getElementById('xp-value').textContent = ` ${totalXPFormatted}`;

    } catch (error) {
        if (typeof error === "string" && error.includes("JWTExpired")) {
            handleLogout();
        } else {
            console.error("Error fetching level and XP:", error);
            Toast(error)
        }
    }
};