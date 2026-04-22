export const areLast3Down = (arr) => {
    if (arr.length === 3) {
        return arr.every(hb => hb.status === "down")
    }
    return false;
}

export const floorToHour = (date) => {
    const d = new Date(date);
    d.setMinutes(0,0,0)
    return d; 
}