export const formatDate = (date: string, hours = true) => {
  let newDate = new Date(date).toLocaleString("pt-BR", {
    hour12: false,
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  if (hours) return newDate;
  return newDate.substring(0, 8);
};
