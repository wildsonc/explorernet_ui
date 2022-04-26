export const formatDate = (date: string) => {
    let newDate = new Date(date).toLocaleString().substring(0, 16);
    return newDate;
};
