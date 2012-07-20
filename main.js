#!/usr/local/bin/node

var k = function(v){
	return function(){
		return v;
	};
};

// "types"

var noneType = (function(){
	var n = {
		tag:"none"
	};
	return function(){
		return n;
	};
})();

var baseType = function(name){	
	return {
			tag:"base",
			name:name
		};
};

var arrayType = function(){
	return {
		tag: "array",
		value: Array.prototype.slice.call(arguments)
	};
};

var arrowType = function(left, right){
	return {
		tag:"arrow",
		left:left,
		right:right
	};
};

var generateEntry = function(body, type){
	return {
		fun : k(eval(body)), 
		compilable: body,
		type: type
	};
};

var fns = [
		generateEntry('(Math.sin)', arrowType(arrayType(baseType('num')), baseType('num')) ),
		generateEntry('(function(){ return Math.random() * 360})', arrowType(noneType(), baseType('num')) ),
		generateEntry('(180)', baseType('num'))
	];

//console.log(JSON.stringify(fns, null, 3));

// evalTree

var evalTree = function(t){
	if(t.callable !== undefined)
		return t.callable.fun().apply(
				null, 
				t.args.map(function(i){ return evalTree(i); }));
	//---
	else if(t.constant !== undefined)
		return t.constant;
};

var test = { 
	callable: fns[0], 
	args:[
		{
			callable: fns[1], 
			args:[]
		}
	] 
};

//console.log(evalTree(test));

// generateTree

var generateTree = function(ls, maximum_depth){
	var res = {};
	
	var elem = undefined;
	if(maximum_depth === 1){
		// Pick a terminal at random
		ls = ls.filter(function(f){ return f.type.left.tag === "none" });
	}

	if(ls.length === 0)
		throw new Error("Nothing to choose!!!");

	// Pick at random
	var idx = Math.floor(Math.random() * ls.length);

	elem = ls[idx]

	if(elem.type.tag === "arrow"){
		// Function call

		var args = undefined;

		if(elem.type.left.tag === "array"){
			// continue recursively ...			
			args = elem.type.left.value.map(
					function(i){
						return generateTree(
								ls, 
								maximum_depth - 1);
					});
			//---
		}else{
			args = [];
		}

		return {
			callable : elem,
			args: args
		}

	}else{
		// Constant value

		return {
			constant: elem.fun()			
		};
	}	

	return res;
}

var ttt = generateTree(fns, 5);

console.log(ttt);
console.log(evalTree(ttt));

var compileTree = function(t){
	var f = '';
	if(t.callable !== undefined){
		if(t.callable.compilable !== undefined)
			f = t.callable.compilable;
		else
			f = t.callable.fun.toString();
		return f + '.apply(null, [' + t.args.map(compileTree).join(', ') + '])';
	}else if(t.constant !== undefined){
		return t.constant.toString();		
	}
};

console.log(compileTree(ttt));

// ----

var Generator = function(){

	this.addForm = function(){
		
	};
	this.gen = function(){
		
	};
	return this;
};

var Tree = function(tr){
	this.compile = function(){

	};
	this.eval = function(){

	};
	return this;
}

