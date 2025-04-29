import { PROJECT_COMPLETION_QUERY } from "../query/graphql.js";
import { Toast } from "../utils/toast.js";
import { fetchdata } from "./fetchData.js";
export async function createProjectCompletionChart() {
    const container = document.querySelector(".project-chart");
    const token = localStorage.getItem("token");
    const margin = { top: 20, right: 30, bottom: 90, left: 60 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    let tooltip;

    try {
        let rawData = await fetchdata(PROJECT_COMPLETION_QUERY, {}, token);
        // console.log("Project data:", rawData);
        rawData = rawData.data.progress;

        if (!rawData || rawData.length === 0) {
            container.innerHTML = '<p class="no-data-message">No project data available</p>';
            return;
        }

        const data = processData(rawData);  // Process and filter data
        const { svg, g } = createSVG(container, width, height, margin);
        const { xScale, yScale, xStep } = createScales(data, width, height);

        drawAxes(g, xScale, yScale, height, width, xStep, data);
        drawBars(g, data, xScale, yScale, height, xStep);  // Pass the filtered data to drawBars
        setupTooltip(container);

    } catch (error) {
        console.error('Error loading project chart:', error);
        Toast("Error fetching project completion data");
        container.innerHTML = '<p class="error-message">Error loading project data</p>';
    }

    function processData(data) {
        return data
            .map(item => ({
                name: item.object.name,
                type: item.object.type,
                grade: item.grade || 0,
                date: new Date(item.updatedAt).toLocaleDateString(),
                timestamp: new Date(item.updatedAt)
            }))
            .filter(item => item.grade >= 1)  // Filter successful projects only
            .sort((a, b) => b.timestamp - a.timestamp)  // Sort by latest first
            .slice(0, 5);  // Select the last 5 projects
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

        return { svg, g };
    }

    function createScales(data, width, height) {
        const xStep = width / data.length;
        const xScale = name => data.findIndex(d => d.name === name) * xStep;

        const maxGrade = 1.2;
        const yScale = grade => height - (grade / maxGrade) * height;

        return { xScale, yScale, xStep };
    }

    function drawAxes(g, xScale, yScale, height, width, xStep, data) {
        // Y axis ticks
        const yTicks = 6;
        for (let i = 0; i <= yTicks; i++) {
            const grade = (1.2 / yTicks) * i;
            const y = yScale(grade);

            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", 0);
            line.setAttribute("x2", width);
            line.setAttribute("y1", y);
            line.setAttribute("y2", y);
            line.setAttribute("stroke", "#374151");
            line.setAttribute("stroke-dasharray", "2,2");
            g.appendChild(line);

            const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
            label.setAttribute("x", -10);
            label.setAttribute("y", y + 4);
            label.setAttribute("text-anchor", "end");
            label.setAttribute("fill", "#9CA3AF");
            label.textContent = grade.toFixed(1);
            g.appendChild(label);
        }

        // X axis labels
        data.forEach((d, i) => {
            const x = xScale(d.name) + xStep / 2;
            const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
            label.setAttribute("x", x);
            label.setAttribute("y", height + 20);
            label.setAttribute("text-anchor", "middle");
            label.setAttribute("fill", "#9CA3AF");
            label.setAttribute("transform", `rotate(-45 ${x},${height + 20})`);
            label.textContent = d.name;
            g.appendChild(label);
        });
    }

    function drawBars(g, data, xScale, yScale, height, xStep) {
        data.forEach(d => {
            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("class", "bar");
            rect.setAttribute("x", xScale(d.name));
            rect.setAttribute("width", xStep);
            rect.setAttribute("y", yScale(d.grade));
            rect.setAttribute("height", height - yScale(d.grade));
            rect.setAttribute("fill", getBarColor(d.grade));
            rect.setAttribute("rx", 3);
            rect.setAttribute("data-name", d.name);
            rect.setAttribute("data-grade", d.grade);
            rect.setAttribute("data-date", d.date);

            rect.addEventListener("mouseover", showTooltip);
            rect.addEventListener("mouseout", hideTooltip);

            g.appendChild(rect);
        });

        // Pass/Fail threshold line
        const thresholdLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        thresholdLine.setAttribute("x1", 0);
        thresholdLine.setAttribute("x2", width);
        thresholdLine.setAttribute("y1", yScale(1));
        thresholdLine.setAttribute("y2", yScale(1));
        thresholdLine.setAttribute("stroke", "#FBBF24");
        thresholdLine.setAttribute("stroke-width", 1);
        thresholdLine.setAttribute("stroke-dasharray", "4,4");
        g.appendChild(thresholdLine);

        // Pass/Fail label
        const thresholdLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
        thresholdLabel.setAttribute("x", width - 5);
        thresholdLabel.setAttribute("y", yScale(1) - 5);
        thresholdLabel.setAttribute("text-anchor", "end");
        thresholdLabel.setAttribute("fill", "#FBBF24");
        thresholdLabel.textContent = "Pass Threshold";
        g.appendChild(thresholdLabel);
    }

    function getBarColor(grade) {
        if (grade >= 1.1) return "#8B5CF6"; // Purple for outstanding
        if (grade >= 1) return "#4ADE80";   // Green for pass
        return "#EF4444";                   // Red for fail
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
        const name = bar.getAttribute("data-name");
        const grade = bar.getAttribute("data-grade");
        const date = bar.getAttribute("data-date");
        const status = grade >= 1 ? "Passed" : "Failed";
        const statusColor = grade >= 1 ? "#4ADE80" : "#EF4444";

        tooltip.innerHTML = `
            <div>Project: ${name}</div>
            <div>Grade: ${grade}</div>
            <div>Status: <span style="color:${statusColor}">${status}</span></div>
            <div>Completed: ${date}</div>
        `;
        tooltip.style.display = "block";

        const rect = container.getBoundingClientRect();
        const barRect = bar.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        let left = barRect.left - rect.left + (barRect.width / 2) - (tooltipRect.width / 2);
        let top = barRect.top - rect.top - tooltipRect.height - 10;

        left = Math.max(0, Math.min(left, container.offsetWidth - tooltipRect.width));
        top = Math.max(10, top);

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    }

    function hideTooltip() {
        tooltip.style.display = "none";
    }
}
