import { XP_PROGRESS_QUERY } from "../query/graphql.js";
import { XpFormat } from "../utils/funcs.js";
import { Toast } from "../utils/toast.js";
import { fetchdata } from "./fetchData.js";

export async function XpChart() {
    const container = document.querySelector(".xp-chart");
    const token = localStorage.getItem("token");

    const margin = { top: 20, right: 40, bottom: 90, left: 80 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    let svg, g, data, cumulativeXP = 0, xScale, yScale, yMax, tooltip;

        try {
            const resp = await fetchdata(XP_PROGRESS_QUERY, {},token);
            let rawData = resp.data.transaction;
            if (!rawData || rawData.length === 0){
                container.textContent="no Data"
                return;
            } 
            createSVG();
            processData(rawData);
            createScales();
            drawAxes();
            drawLine();
            drawPoints();
            setupTooltip();
        } catch (error) {
            console.error('Error initializing chart:', error);
            Toast("error in xp chart")
            container.innerHTML = '<p class="error-message">Error loading chart data</p>';
        }
    

    function createSVG() {
        svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);
        svg.style.width = "100%";
        svg.style.height = "100%";

        g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("transform", `translate(${margin.left},${margin.top})`);

        svg.appendChild(g);
        container.appendChild(svg);
    }

    function processData(rawData) {
        cumulativeXP = 0;
        data = rawData.map(d => {
            cumulativeXP += d.amount;
            return {
                date: new Date(d.createdAt),
                amount: d.amount,
                projectName: d.object.name,
                cumulative: cumulativeXP,
            };
        });
    }

    function createScales() {
        const xMin = data[0].date;
        const xMax = data[data.length - 1].date;
        xScale = x => (x - xMin) / (xMax - xMin) * width;

        yMax = cumulativeXP;
        yScale = y => height - (y / yMax * height);
    }

    function drawAxes() {
        // X Axis
        const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "g");
        xAxis.setAttribute("class", "x-axis");
        xAxis.setAttribute("transform", `translate(0,${height})`);

        const xAxisLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        xAxisLine.setAttribute("x1", "0");
        xAxisLine.setAttribute("x2", width);
        xAxisLine.setAttribute("stroke", "#a90e07");
        xAxis.appendChild(xAxisLine);

        const numXTicks = 10;
        for (let i = 0; i <= numXTicks; i++) {
            const date = new Date(data[0].date.getTime() + (data[data.length - 1].date.getTime() - data[0].date.getTime()) * i / numXTicks);
            const x = xScale(date);

            const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
            tick.setAttribute("x1", x);
            tick.setAttribute("x2", x);
            tick.setAttribute("y1", 0);
            tick.setAttribute("y2", 6);
            tick.setAttribute("stroke", "#a90e07");
            xAxis.appendChild(tick);

            const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
            label.setAttribute("x", x);
            label.setAttribute("y", 25);
            label.setAttribute("fill", "#6b3e26");
            label.textContent = date.toLocaleDateString();
            label.setAttribute("text-anchor", "end");
            label.setAttribute("transform", `rotate(-45, ${x}, 25)`);
            xAxis.appendChild(label);
        }

        // Y Axis
        const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "g");
        yAxis.setAttribute("class", "y-axis");

        const yAxisLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        yAxisLine.setAttribute("y1", "0");
        yAxisLine.setAttribute("y2", height);
        yAxisLine.setAttribute("stroke", "#a90e07");
        yAxis.appendChild(yAxisLine);

        const numYTicks = 10;
        for (let i = 0; i <= numYTicks; i++) {
            const yValue = (yMax * i) / numYTicks;
            const y = yScale(yValue);

            const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
            tick.setAttribute("x1", -6);
            tick.setAttribute("x2", 0);
            tick.setAttribute("y1", y);
            tick.setAttribute("y2", y);
            tick.setAttribute("stroke", "#a90e07");
            yAxis.appendChild(tick);

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
            label.textContent = XpFormat(yValue);
            yAxis.appendChild(label);
        }

        g.appendChild(xAxis);
        g.appendChild(yAxis);
    }

    function drawLine() {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "path");

        const pathData = data.map((d, i) => {
            const x = xScale(d.date);
            const y = yScale(d.cumulative);
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ');

        line.setAttribute("d", pathData);
        line.setAttribute("fill", "none");
        line.setAttribute("stroke", "#a90e07");
        line.setAttribute("stroke-width", "2");

        g.appendChild(line);
    }

    function drawPoints() {
        const pointsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        pointsGroup.setAttribute("class", "points");

        data.forEach(d => {
            const point = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            point.setAttribute("cx", xScale(d.date));
            point.setAttribute("cy", yScale(d.cumulative));
            point.setAttribute("r", "4");
            point.setAttribute("fill", "#a90e07");
            point.setAttribute("data-project", d.projectName);
            point.setAttribute("data-xp", XpFormat(d.amount));
            point.setAttribute("data-date", d.date.toLocaleDateString());
            point.setAttribute("data-totalXP", XpFormat(d.cumulative));

            point.addEventListener("mouseover", showInfo);
            point.addEventListener("mouseout", hideInfo);

            pointsGroup.appendChild(point);
        });

        g.appendChild(pointsGroup);
    }

    function setupTooltip() {
        tooltip = document.createElement("div");
        tooltip.className = "chart-tooltip";
        tooltip.style.position = "absolute";
        tooltip.style.display = "none";
        tooltip.style.backgroundColor = "rgba(17, 24, 39, 0.9)";
        tooltip.style.padding = "8px 12px";
        tooltip.style.borderRadius = "6px";
        tooltip.style.color = "#F3F4F6";
        tooltip.style.fontSize = "14px";
        tooltip.style.pointerEvents = "none";
        tooltip.style.zIndex = "1000";
        tooltip.style.border = "1px solid #374151";

        container.style.position = "relative";
        container.appendChild(tooltip);
    }

    function showInfo(event) {
        const point = event.target;

        const projectName = point.getAttribute("data-project");
        const xp = point.getAttribute("data-xp");
        const date = point.getAttribute("data-date");
        const totalXP = point.getAttribute("data-totalXP");

        tooltip.innerHTML = `
            <div>${projectName}</div>
            <div>XP: ${xp}</div>
            <div>Date: ${date}</div>
            <div>Total XP: ${totalXP}</div>
        `;

        tooltip.style.display = "block";

        const rect = container.getBoundingClientRect();
        const pointRect = point.getBoundingClientRect();
        const infoRect = tooltip.getBoundingClientRect();

        let left = pointRect.left - rect.left - (infoRect.width / 2);
        let top = pointRect.top - rect.top - infoRect.height - 10;

        left = Math.max(0, Math.min(left, rect.width - infoRect.width));
        top = Math.max(0, top);

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    }

    function hideInfo() {
        tooltip.style.display = "none";
    }

    
}
