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


export { CreateExposedPromise, AssignAtPath, ReadAtPath, CreateAtPath};