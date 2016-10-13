var fun = {}

module.exports = fun;

fun.p = function(msg){
	console.log(msg);
}

fun.formatTime = function(time){
	return time.toLocaleDateString() 
	+ ' '
	+ time.toTimeString().replace(/\sGM.*$/, '');
}


