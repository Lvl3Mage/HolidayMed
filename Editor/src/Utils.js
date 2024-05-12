function CreateExposedPromise(){
	let resolve, reject;
	const promise = new Promise((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
}
function AssignAtPath(data, path, value){
	let current = data;
	for(let i = 0; i < path.length-1; i++){
		current = current[path[i]];
	}
	current[path[path.length-1]] = value;
}
function ReadAtPath(data, path){
	let current = data;
	for(let i = 0; i < path.length; i++){
		current = current[path[i]];
	}
	return current;
}
function CreateAtPath(data, path){
	let current = data;
	for(let i = 0; i < path.length; i++){
		if(!current[path[i]]){
			current[path[i]] = {};
		}
		current = current[path[i]];
	}
}
const formValueValidation = {
	"notEmpty": function(value){
		return value !== "" && value !== null && value !== undefined;
	},

};
function ParseYMDString(dateString){
	const year = dateString.substring(0,4);
	const month = dateString.substring(4,6);
	const day = dateString.substring(6,8);
	return new Date(`${day}-${month}-${year}`);
}
function ToYMDString(date){
	const day = date.getDate();
	day = day < 10 ? `0${day}` : day.toString();
	const month = date.getMonth();
	month = month < 10 ? `0${month}` : month.toString();
	const year = date.getFullYear();
	return `${year}${month}${day}`;
}
export { CreateExposedPromise, AssignAtPath, ReadAtPath, CreateAtPath, formValueValidation, ParseYMDString, ToYMDString};