import { teachers, groups, days, hours } from "./data.js";

export function generateSchedule() {
  const schedule = [];
  const usedSlots = {
    teacher: {},
    group: {}
  };

  groups.forEach(group => {
    group.subjects.forEach(subject => {
      let assigned = false;

      for (const teacher of teachers) {
        if (!teacher.subjects.includes(subject)) continue;

        for (const day of days) {
          const availableHours = teacher.availability[day] || [];

          for (const hour of availableHours) {
            const teacherKey = `${teacher.id}-${day}-${hour}`;
            const groupKey = `${group.id}-${day}-${hour}`;

            if (!usedSlots.teacher[teacherKey] && !usedSlots.group[groupKey]) {
              schedule.push({
                group: group.name,
                subject,
                teacher: teacher.name,
                day,
                hour
              });

              usedSlots.teacher[teacherKey] = true;
              usedSlots.group[groupKey] = true;
              assigned = true;
              break;
            }
          }
          if (assigned) break;
        }
        if (assigned) break;
      }

      if (!assigned) {
        schedule.push({
          group: group.name,
          subject,
          error: "No fue posible asignar horario"
        });
      }
    });
  });

  return schedule;
}