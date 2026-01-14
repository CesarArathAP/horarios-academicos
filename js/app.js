import { generateSchedule } from "./scheduler.js";

const btn = document.getElementById("generateBtn");
const tbody = document.querySelector("#scheduleTable tbody");

btn.addEventListener("click", () => {
  // Limpiar tabla
  tbody.innerHTML = "";

  // Generar nuevo horario
  const schedule = generateSchedule();
  const summary = window.scheduleSummary;

  // Agregar fila de resumen
  const summaryRow = document.createElement("tr");
  summaryRow.className = "summary-row";
  summaryRow.innerHTML = `
    <td colspan="5">
      <strong>Resumen:</strong> ${summary.assigned} asignadas de ${summary.total} | 
      <span style="color: ${summary.conflicts > 0 ? '#e74c3c' : '#27ae60'}">
        ${summary.conflicts > 0 ? '⚠ ' + summary.conflicts + ' conflictos' : '✓ Sin conflictos'}
      </span>
    </td>
  `;
  tbody.appendChild(summaryRow);

  // Agregar filas del horario
  schedule.forEach((item, index) => {
    const tr = document.createElement("tr");
    
    if (item.error) {
      tr.classList.add("error-row");
      tr.innerHTML = `
        <td>-</td>
        <td>-</td>
        <td>${item.group}</td>
        <td>${item.subject}</td>
        <td style="color: #e74c3c; font-weight: 600;">
          ⚠ ${item.error}
        </td>
      `;
    } else {
      tr.classList.add("success-row");
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