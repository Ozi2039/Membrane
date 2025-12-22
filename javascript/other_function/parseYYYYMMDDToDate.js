export function parseYYYYMMDDToDate(dateString) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {

        console.error("Invalid date format provided to parseYYYYMMDDToDate");
        return new Date(0);
    }

    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);


    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {

        console.error("Invalid date value provided to parseYYYYMMDDToDate");
        return new Date(0);
    }


    date.setHours(0, 0, 0, 0);

    return date;
}
