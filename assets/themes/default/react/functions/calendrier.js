function getDayFr(day){
    let days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

    return days[day];
}

function getShortDayFr(day){
    let days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

    return days[day];
}

function getIntDay(stringDate){
    return stringDate.split('-')[0]
}

function getTimeCalendar(start, end){
    let minutes = ['00', '30']
    let times = []

    for(let i=start ; i <= end ; i++){
        let hour = i < 10 ? '0' + i : i;
        for(let j=0 ; j < 2 ; j++){
            times.push(hour + ':' + minutes[j])
        }
    }

    times.pop()

    return times;
}

module.exports = {
    getDayFr,
    getShortDayFr,
    getTimeCalendar
}