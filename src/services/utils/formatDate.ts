export const formatDate = (date: string, hours = true) => {
    let newDate = new Date(date);
    if (hours) return newDate.toLocaleString().substring(0, 16);
    return newDate.toLocaleDateString().substring(0, 10);
};
