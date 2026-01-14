import { generateSchedule } from "./scheduler.js";
import { teachers, subjects, groups, days, hours } from "./data.js";

const generateBtn = document.getElementById("generateBtn");
const resetBtn = document.getElementById("resetBtn");
const subjectsContainer = document.getElementById("subjectsContainer");
const groupsContainer = document.getElementById("groupsContainer");
const statsContainer = document.getElementById("statsContainer");
const teachersContainer = document.getElementById("teachersContainer");
const summaryContainer = document.getElementById("summaryContainer");
const generalScheduleContainer = document.getElementById("generalScheduleContainer");
const groupSchedulesContainer = document.getElementById("groupSchedulesContainer");

/**
 * Muestra la información de los docentes en una tabla
 */
function displayTeachers() {
  const tbody = document.getElementById("teachersTableBody");
  tbody.innerHTML = "";

  teachers.forEach((teacher) => {
    const row = document.createElement("tr");

    // Construir disponibilidad
    let availabilityText = "";
    for (const [day, hoursArray] of Object.entries(teacher.availability)) {
      availabilityText += `<strong>${day}:</strong> ${hoursArray.join(", ")}<br>`;
    }

    // Construir materias
    const subjectsHTML = teacher.subjects
      .map((subject) => `<span class="subject-badge">${subject}</span>`)
      .join("");

    row.innerHTML = `
      <td>${teacher.id}</td>
      <td>${teacher.name}</td>
      <td><div class="subjects-badges">${subjectsHTML}</div></td>
      <td><div class="availability-text">${availabilityText}</div></td>
    `;
    tbody.appendChild(row);
  });
}

/**
 * Muestra la lista de materias disponibles
 */
function displaySubjects() {
  subjectsContainer.innerHTML = "";
  subjects.forEach((subject) => {
    const item = document.createElement("div");
    item.className = "item";
    item.innerHTML = `📖 ${subject.name}`;
    subjectsContainer.appendChild(item);
  });
}

/**
 * Muestra la lista de grupos
 */
function displayGroups() {
  groupsContainer.innerHTML = "";
  groups.forEach((group) => {
    const item = document.createElement("div");
    item.className = "item";
    const subjectsCount = group.subjects.length;
    item.innerHTML = `👥 <strong>${group.name}</strong> - ${subjectsCount} materias`;
    groupsContainer.appendChild(item);
  });
}

/**
 * Muestra estadísticas generales
 */
function displayStats() {
  statsContainer.innerHTML = "";
  const stats = [
    { label: "Total de Docentes", value: teachers.length },
    { label: "Total de Materias", value: subjects.length },
    { label: "Total de Grupos", value: groups.length },
    { label: "Horas por Día", value: hours.length },
    { label: "Días de Clase", value: days.length },
    { label: "Total de Slots", value: days.length * hours.length }
  ];

  stats.forEach((stat) => {
    const item = document.createElement("div");
    item.className = "item";
    item.innerHTML = `<strong>${stat.label}:</strong> ${stat.value}`;
    statsContainer.appendChild(item);
  });
}

/**
 * Crea un horario general consolidado de todos los docentes
 */
function displayGeneralTeacherSchedule(schedule) {
  generalScheduleContainer.innerHTML = "";

  // Mapeo de colores para materias
  const subjectColors = {
    "Matemáticas": "matematicas",
    "Física": "fisica",
    "Química": "quimica",
    "Biología": "biologia",
    "Historia": "historia",
    "Geografía": "geografia"
  };

  // Crear matriz de horarios (días x horas) para docentes
  const scheduleMatrix = {};
  days.forEach((day) => {
    scheduleMatrix[day] = {};
    hours.forEach((hour) => {
      scheduleMatrix[day][hour] = [];
    });
  });

  // Llenar la matriz con todas las clases
  schedule.forEach((item) => {
    if (!item.error && scheduleMatrix[item.day]) {
      scheduleMatrix[item.day][item.hour].push({
        subject: item.subject,
        teacher: item.teacher,
        group: item.group
      });
    }
  });

  // Construir tabla general
  let tableHTML = `<h3>📅 Horario Consolidado de Docentes</h3><table><thead><tr><th>Hora</th>`;
  days.forEach((day) => {
    tableHTML += `<th>${day}</th>`;
  });
  tableHTML += `</tr></thead><tbody>`;

  hours.forEach((hour) => {
    tableHTML += `<tr><td><strong>${hour}</strong></td>`;
    days.forEach((day) => {
      const classes = scheduleMatrix[day][hour];
      if (classes.length > 0) {
        const classContent = classes
          .map((c) => {
            const colorClass = subjectColors[c.subject] || "default";
            return `<div class="class-cell class-${colorClass}"><strong>${c.subject}</strong><br><small>${c.teacher}</small><br><small style="opacity: 0.8;">${c.group}</small></div>`;
          })
          .join("");
        tableHTML += `<td>${classContent}</td>`;
      } else {
        tableHTML += `<td style="background: #f9f9f9; color: #ccc;">-</td>`;
      }
    });
    tableHTML += `</tr>`;
  });

  tableHTML += `</tbody></table>`;
  generalScheduleContainer.innerHTML = tableHTML;
}

/**
 * Crea tablas de horarios para cada grupo
 */
function displayGroupSchedules(schedule) {
  groupSchedulesContainer.innerHTML = "";

  // Mapeo de colores para materias
  const subjectColors = {
    "Matemáticas": "matematicas",
    "Física": "fisica",
    "Química": "quimica",
    "Biología": "biologia",
    "Historia": "historia",
    "Geografía": "geografia"
  };

  // Agrupar por grupo
  const scheduleByGroup = {};
  schedule.forEach((item) => {
    if (!scheduleByGroup[item.group]) {
      scheduleByGroup[item.group] = [];
    }
    scheduleByGroup[item.group].push(item);
  });

  // Crear tabla para cada grupo
  const groupOrder = ["Grupo A", "Grupo B", "Grupo C"];
  
  groupOrder.forEach((groupName) => {
    const groupSchedules = scheduleByGroup[groupName] || [];
    const card = document.createElement("div");
    card.className = "group-schedule-card";

    // Crear matriz de horarios (días x horas)
    const scheduleMatrix = {};
    days.forEach((day) => {
      scheduleMatrix[day] = {};
      hours.forEach((hour) => {
        scheduleMatrix[day][hour] = null;
      });
    });

    // Llenar la matriz
    groupSchedules.forEach((item) => {
      if (!item.error && scheduleMatrix[item.day]) {
        scheduleMatrix[item.day][item.hour] = {
          subject: item.subject,
          teacher: item.teacher
        };
      }
    });

    // Construir tabla
    let tableHTML = `<h3>${groupName}</h3><table><thead><tr><th>Hora</th>`;
    days.forEach((day) => {
      tableHTML += `<th>${day}</th>`;
    });
    tableHTML += `</tr></thead><tbody>`;

    hours.forEach((hour) => {
      tableHTML += `<tr><td><strong>${hour}</strong></td>`;
      days.forEach((day) => {
        const cell = scheduleMatrix[day][hour];
        if (cell) {
          const colorClass = subjectColors[cell.subject] || "default";
          tableHTML += `<td class="group-class-cell group-class-${colorClass}">
            <strong>${cell.subject}</strong><br>
            <small>${cell.teacher}</small>
          </td>`;
        } else {
          tableHTML += `<td style="background: #f9f9f9; color: #ccc;">-</td>`;
        }
      });
      tableHTML += `</tr>`;
    });

    tableHTML += `</tbody></table>`;
    card.innerHTML = tableHTML;
    groupSchedulesContainer.appendChild(card);
  });
}

/**
 * Crea tablas de horarios para cada docente
 */
function displayTeacherSchedules(schedule) {
  teacherSchedulesContainer.innerHTML = "";

  // Agrupar por docente
  const scheduleByTeacher = {};
  schedule.forEach((item) => {
    if (!item.error && item.teacher !== "N/A") {
      if (!scheduleByTeacher[item.teacher]) {
        scheduleByTeacher[item.teacher] = [];
      }
      scheduleByTeacher[item.teacher].push(item);
    }
  });

  // Crear tabla para cada docente
  teachers.forEach((teacher) => {
    const teacherSchedules = scheduleByTeacher[teacher.name] || [];
    const card = document.createElement("div");
    card.className = "teacher-schedule-card";

    // Crear matriz de horarios (días x horas)
    const scheduleMatrix = {};
    days.forEach((day) => {
      scheduleMatrix[day] = {};
      hours.forEach((hour) => {
        scheduleMatrix[day][hour] = null;
      });
    });

    // Llenar la matriz
    teacherSchedules.forEach((item) => {
      if (scheduleMatrix[item.day]) {
        scheduleMatrix[item.day][item.hour] = {
          subject: item.subject,
          group: item.group
        };
      }
    });

    // Construir tabla
    let tableHTML = `<h3>${teacher.name}</h3><table><thead><tr><th>Hora</th>`;
    days.forEach((day) => {
      tableHTML += `<th>${day}</th>`;
    });
    tableHTML += `</tr></thead><tbody>`;

    hours.forEach((hour) => {
      tableHTML += `<tr><td><strong>${hour}</strong></td>`;
      days.forEach((day) => {
        const cell = scheduleMatrix[day][hour];
        if (cell) {
          tableHTML += `<td style="background: #f8e8f4; font-weight: 600; color: #764ba2;">
            <strong>${cell.subject}</strong><br>
            <small>${cell.group}</small>
          </td>`;
        } else {
          tableHTML += `<td style="background: #f9f9f9; color: #ccc;">-</td>`;
        }
      });
      tableHTML += `</tr>`;
    });

    tableHTML += `</tbody></table>`;
    card.innerHTML = tableHTML;
    teacherSchedulesContainer.appendChild(card);
  });
}

function resetApplication() {
  summaryContainer.innerHTML = "";
  generalScheduleContainer.innerHTML = "";
  groupSchedulesContainer.innerHTML = "";
  displayTeachers();
  displaySubjects();
  displayGroups();
  displayStats();
}

/**
 * Muestra una alerta de éxito
 */
function showSuccessAlert() {
  // Crear alerta
  const alert = document.createElement("div");
  alert.className = "success-alert";
  alert.innerHTML = `
    <span>Horarios generados correctamente</span>
    <button class="alert-close" onclick="this.parentElement.remove()">&times;</button>
  `;

  // Insertar al principio del contenedor principal
  const mainContainer = document.querySelector("main");
  if (mainContainer) {
    mainContainer.insertBefore(alert, mainContainer.firstChild);
  }

  // Auto-cerrar después de 5 segundos
  setTimeout(() => {
    if (alert.parentElement) {
      alert.remove();
    }
  }, 5000);
}

/**
 * Genera y muestra el horario
 */
generateBtn.addEventListener("click", () => {
  // Limpiar contenedores
  summaryContainer.innerHTML = "";
  generalScheduleContainer.innerHTML = "";
  groupSchedulesContainer.innerHTML = "";

  // Mostrar alerta de éxito
  showSuccessAlert();

  // Generar nuevo horario
  const schedule = generateSchedule();
  const summary = window.scheduleSummary;

  // Crear resumen
  const summaryHTML = `
    <h3>📋 Resumen de Asignación</h3>
    <div class="summary-stats">
      <div class="stat-item">
        <div class="stat-value">${summary.assigned}</div>
        <div class="stat-label">Materias Asignadas</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${summary.total}</div>
        <div class="stat-label">Materias Totales</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${summary.conflicts}</div>
        <div class="stat-label">Errores Detectados</div>
      </div>
      <div class="stat-item">
        <div class="stat-value" style="color: ${summary.conflicts > 0 ? '#e74c3c' : '#27ae60'}">
          ${summary.conflicts > 0 ? '⚠ Incompleto' : '✓ Válido'}
        </div>
        <div class="stat-label">Estado General</div>
      </div>
    </div>
  `;

  summaryContainer.innerHTML = summaryHTML;

  // Mostrar horario general de docentes
  displayGeneralTeacherSchedule(schedule);

  // Mostrar horarios por grupo
  displayGroupSchedules(schedule);
});

// Event listener para reiniciar
resetBtn.addEventListener("click", () => {
  if (
    confirm(
      "¿Estás seguro de que deseas reiniciar? Se borrarán todos los horarios generados."
    )
  ) {
    resetApplication();
  }
});

// Mostrar información inicial
window.addEventListener("load", () => {
  displayTeachers();
  displaySubjects();
  displayGroups();
  displayStats();
});