import { generateSchedule } from "./scheduler.js";

const btn = document.getElementById("generateBtn");
const tbody = document.querySelector("#scheduleTable tbody");

btn.addEventListener("click", () => {
  tbody.innerHTML = "";
  const schedule = generateSchedule();

  schedule.forEach(item => {
    const tr = document.createElement("tr");

    if (item.error) {
      tr.innerHTML = `
        <td colspan="5" style="color:red;">
          ${item.subject} - ${item.error}
        </td>
      `;
    } else {
      tr.innerHTML = `
        <td>${item.day}</td>
        <td>${item.hour}</td>
        <td>${item.group}</td>
        <td>${item.subject}</td>
        <td>${item.teacher}</td>
      `;
    }

    tbody.appendChild(tr);
  });
});