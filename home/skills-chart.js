import { SKILL_QUERY } from "../query/graphql.js";
import { Toast } from "../utils/toast.js";
import { fetchdata } from "./fetchData.js";

export async function SkillChart() {
    const container = document.querySelector(".skill-chart");
    
    const token = localStorage.getItem("token");
    const margin = { top: 20, right: 0, bottom: 90, left: 45 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;
    const barPadding = 0.15;
    let tooltip;

    try {
        const resp = await fetchdata(SKILL_QUERY, {},token);

        let rawData = resp.data.transaction;
        if (!rawData || rawData.length === 0){
            container.textContent="no Data"
            
            return;
            
        } 

        const data = processData(rawData);


        
        const { xScale, yScale, yMax, barWidth } = createScales(data, width, height, barPadding);
        const { g } = createSVG(container, width, height, margin);

        drawAxes(g, data, width, height, yScale, yMax, barWidth, xScale);
        drawBars(g, data, xScale, yScale, height, barWidth);
        setupTooltip(container);
    } catch (error) {
        console.error('Error loading chart:', error);
        Toast("error in fetching skills chart")
        container.innerHTML = '<p class="error-message">Error loading chart data</p>';
    }


    function processData(data) {
        const skillsMap = new Map();
        data.forEach(item => {
            
            const skill = item.type.replace('skill_', '');
            const current = skillsMap.get(skill) || 0;
            skillsMap.set(skill, Math.max(current, item.amount));
        });
        return Array.from(skillsMap, ([name, amount]) => ({ name, amount }))
            .sort((a, b) => b.amount - a.amount);
    }

    function createScales(data, width, height, padding) {
        const barWidth = width / data.length;
        const xScale = i => i * barWidth + (barWidth * padding) / 2;
        const yMax = Math.max(...data.map(d => d.amount));
        const yScale = y => height - (y / yMax * height);
        return {
            xScale,
            yScale,
            yMax,
            barWidth: barWidth * (1 - padding),
        };
    }

    function createSVG(container, width, height, margin) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);
        svg.style.width = "100%";
        svg.style.height = "100%";

        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("transform", `translate(${margin.left},${margin.top})`);

        svg.appendChild(g);
        container.appendChild(svg);

        return { g };
    }

    function drawAxes(g, data, width, height, yScale, yMax, barWidth, xScale) {
        const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "g");
        xAxis.setAttribute("transform", `translate(0,${height})`);

        const xLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        xLine.setAttribute("x1", "0");
        xLine.setAttribute("x2", width);
        xLine.setAttribute("stroke", "#a90e07");
        xAxis.appendChild(xLine);

        data.forEach((d, i) => {
            const x = xScale(i) + barWidth / 2;
            const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
            label.setAttribute("x", x);
            label.setAttribute("y", 25);
            label.setAttribute("text-anchor", "end");
            label.setAttribute("transform", `rotate(-45, ${x}, 25)`);
            label.setAttribute("fill", "#6b3e26");
            label.textContent = d.name;
            xAxis.appendChild(label);
        });

        const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const yLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        yLine.setAttribute("y1", "0");
        yLine.setAttribute("y2", height);
        yLine.setAttribute("stroke", "#a90e07");
        yAxis.appendChild(yLine);

        for (let i = 0; i <= 10; i++) {
            const value = (yMax * i) / 10;
            const y = yScale(value);

            const gridLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
            gridLine.setAttribute("x1", "0");
            gridLine.setAttribute("x2", width);
            gridLine.setAttribute("y1", y);
            gridLine.setAttribute("y2", y);
            gridLine.setAttribute("stroke", "#a90e07");
            gridLine.setAttribute("stroke-dasharray", "2,2");
            g.appendChild(gridLine);

            const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
            label.setAttribute("x", -15);
            label.setAttribute("y", y);
            label.setAttribute("text-anchor", "end");
            label.setAttribute("dominant-baseline", "middle");
            label.setAttribute("fill", "#6b3e26");
            label.textContent = Math.round(value);
            yAxis.appendChild(label);
        }

        g.appendChild(xAxis);
        g.appendChild(yAxis);
    }

    function drawBars(g, data, xScale, yScale, height, barWidth) {
        const bars = document.createElementNS("http://www.w3.org/2000/svg", "g");

        data.forEach((d, i) => {
            const bar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            const x = xScale(i);
            const y = yScale(d.amount);
            const h = height - y;

            bar.setAttribute("x", x);
            bar.setAttribute("y", y);
            bar.setAttribute("width", barWidth);
            bar.setAttribute("height", h);
            bar.setAttribute("fill", "#a90e07");
            bar.setAttribute("rx", "3");
            bar.setAttribute("data-skill", d.name);
            bar.setAttribute("data-amount", d.amount);

            bar.addEventListener("mousemove", (e) => showTooltip(e));
            bar.addEventListener("mouseout", hideTooltip);

            bars.appendChild(bar);
        });

        g.appendChild(bars);
    }

    function setupTooltip(container) {
        tooltip = document.createElement("div");
        tooltip.className = "chart-tooltip";
        tooltip.style = `
            position: absolute;
            display: none;
            background-color: #111827;
            padding: 8px 12px;
            border-radius: 6px;
            color: #F3F4F6;
            font-size: 14px;
            pointer-events: none;
            z-index: 1000;
            border: 1px solid #374151;
        `;

        container.style.position = "relative";
        container.appendChild(tooltip);
    }

  function showTooltip(event) {
    const bar = event.target;
    const skill = bar.getAttribute("data-skill");
    const amount = bar.getAttribute("data-amount");

    tooltip.innerHTML = `<div>Skill: ${skill}</div><div>Amount: ${amount}</div>`;
    tooltip.style.display = "block";

    const rect = container.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    let left = event.clientX - rect.left + 10;
    let top = event.clientY - rect.top + 10;

    left = Math.min(left, rect.width - tooltipRect.width);
    top = Math.min(top, rect.height - tooltipRect.height);

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
}


    function hideTooltip() {
        tooltip.style.display = "none";
    }
}
