import { generateSchedule } from "./scheduler.js";
import { teachers, subjects, groups, days, hours } from "./data.js";
import { initDragAndDrop, updateDraggableCells } from "./dragdrop.js";

const generateBtn = document.getElementById("generateBtn");
const generateVariableBtn = document.getElementById("generateVariableBtn");
const resetBtn = document.getElementById("resetBtn");
const subjectsContainer = document.getElementById("subjectsContainer");
const groupsContainer = document.getElementById("groupsContainer");
const statsContainer = document.getElementById("statsContainer");
const teachersContainer = document.getElementById("teachersContainer");
const summaryContainer = document.getElementById("summaryContainer");
const generalScheduleContainer = document.getElementById("generalScheduleContainer");
const groupSchedulesContainer = document.getElementById("groupSchedulesContainer");

/**
 * Formatea el rango horario de una clase
 */
function formatTimeRange(startHour, endHour, duration) {
  // Si no hay hora válida, retornar N/A
  if (startHour === "N/A" || !startHour) return "N/A";
  
  // Si es de 2 horas y tiene endHour válido
  if (duration === 2 && endHour && endHour !== "N/A") {
    return `${startHour} - ${endHour}`;
  }
  
  // Si es de 1 hora, solo mostrar la hora de inicio
  if (duration === 1 || !duration) {
    return startHour;
  }
  
  return startHour;
}

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
      const duration = item.duration || 1;
      const endHour = item.endHour || null;
      const timeRange = formatTimeRange(item.hour, endHour, duration);
      
      scheduleMatrix[item.day][item.hour].push({
        subject: item.subject,
        teacher: item.teacher,
        group: item.group,
        duration: duration,
        endHour: endHour,
        timeRange: timeRange
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
            return `<div class="class-cell class-${colorClass} draggable-class" 
              draggable="true" 
              data-subject="${c.subject}" 
              data-teacher="${c.teacher}" 
              data-group="${c.group}" 
              data-day="${day}" 
              data-hour="${hour}" 
              data-duration="${c.duration || 1}"
              data-type="general"
              title="Arrastra para mover">
              <strong>${c.subject}</strong><br>
              <small>${c.timeRange}</small><br>
              <small>${c.teacher}</small><br>
              <small style="opacity: 0.8;">${c.group}</small>
            </div>`;
          })
          .join("");
        tableHTML += `<td class="droppable-slot" data-day="${day}" data-hour="${hour}">${classContent}</td>`;
      } else {
        tableHTML += `<td class="droppable-slot" data-day="${day}" data-hour="${hour}" style="background: #f9f9f9; color: #ccc;">-</td>`;
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
          teacher: item.teacher,
          duration: item.duration || 1,
          endHour: item.endHour,
          timeRange: formatTimeRange(item.hour, item.endHour, item.duration || 1)
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
          tableHTML += `<td class="group-class-cell group-class-${colorClass} droppable-slot" 
            data-day="${day}" 
            data-hour="${hour}">
            <div class="draggable-class"
              draggable="true"
              data-subject="${cell.subject}"
              data-teacher="${cell.teacher}"
              data-group="${groupName}"
              data-day="${day}"
              data-hour="${hour}"
              data-duration="${cell.duration || 1}"
              data-type="group"
              title="Arrastra para mover">
              <strong>${cell.subject}</strong><br>
              <small>${cell.timeRange}</small><br>
              <small>${cell.teacher}</small>
            </div>
          </td>`;
        } else {
          tableHTML += `<td class="droppable-slot" data-day="${day}" data-hour="${hour}" style="background: #f9f9f9; color: #ccc;">-</td>`;
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
 * Muestra una alerta estilizada
 */
function showAlert(type, message) {
  const alert = document.createElement('div');
  alert.className = `drag-alert drag-alert-${type}`;
  alert.innerHTML = message;
  
  document.body.appendChild(alert);
  
  setTimeout(() => {
    alert.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => alert.remove(), 300);
  }, 3000);
}

/**
 * Función genérica para generar y mostrar horarios
 */
function generateAndDisplaySchedule(useVariability = true) {
  // Limpiar contenedores
  summaryContainer.innerHTML = "";
  generalScheduleContainer.innerHTML = "";
  groupSchedulesContainer.innerHTML = "";

  // Mostrar alerta de éxito
  // Mostrar alerta de éxito
  showAlert('success', '✅ Horarios generados correctamente');

  // Generar nuevo horario
  const schedule = generateSchedule(useVariability);
  const summary = window.scheduleSummary;

  // Guardar datos globales para drag-drop
  window.currentSchedule = schedule;
  window.allTeachers = teachers;

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

  // Inicializar drag-and-drop
  window.refreshScheduleDisplay = () => {
    displayGeneralTeacherSchedule(window.currentSchedule);
    displayGroupSchedules(window.currentSchedule);
  };
  initDragAndDrop(schedule, teachers);
  updateDraggableCells();
}

generateBtn.addEventListener("click", () => {
  generateAndDisplaySchedule(false);
});

generateVariableBtn.addEventListener("click", () => {
  generateAndDisplaySchedule(true);
});

// Event listener para reiniciar
resetBtn.addEventListener("click", () => {
  if (
    confirm(
      "¿Estás seguro de que deseas reiniciar? Se borrarán todos los horarios generados."
    )
  ) {
    resetApplication();
    showAlert('info', '🔄 Horarios reiniciados correctamente');
  }
});

// Mostrar información inicial
window.addEventListener("load", () => {
  displayTeachers();
  displaySubjects();
  displayGroups();
  displayStats();
});

/**
 * Inicializa el rastreador de secciones para actualizar el menú y breadcrumb
 */