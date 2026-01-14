export const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
export const hours = ["08:00", "10:00", "12:00", "14:00"];

export const teachers = [
  {
    id: 1,
    name: "Ana López",
    subjects: ["Matemáticas", "Física"],
    availability: {
      Lunes: ["08:00", "10:00"],
      Martes: ["10:00", "12:00"],
      Miércoles: ["08:00"]
    }
  },
  {
    id: 2,
    name: "Carlos Pérez",
    subjects: ["Historia"],
    availability: {
      Lunes: ["12:00", "14:00"],
      Jueves: ["08:00", "10:00"]
    }
  }
];

export const groups = [
  {
    id: 1,
    name: "Grupo A",
    subjects: ["Matemáticas", "Historia"]
  }
];