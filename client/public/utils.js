function getRandomColor(start, end){
    var min=parseInt(start.replace("#",""), 16);
    var max=parseInt(end.replace("#",""), 16);
    return "#"+Math.floor((Math.random() * (max - min) + min)).toString(16).toUpperCase();
}

