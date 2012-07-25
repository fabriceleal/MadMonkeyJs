(function(){

	/**
	 * The "constant combinator"
	 */
	var k = function(v){
		return function(){
			return v;
		};
	};

	// "types"

	/**
	 * Used in functions with no args or with functions that dont return values
	 */
	var noneType = (function(){
		var n = {
			tag:"none"
		};
		return function(){
			return n;
		};
	})();

	/**
	 * A scalar/list type (string, number, object, array)
	 */
	var baseType = function(name){	
		return {
				tag:"base",
				name:name
			};
	};

	/**
	 * Used to typify the arg list of a function
	 */
	var arrayType = function(){
		return {
			tag: "array",
			value: Array.prototype.slice.call(arguments)
		};
	};

	/**
	 * Type of a function
	 */
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

	/**
	 * evalTree
	 */
	var evalTree = function(t){
		if(t.callable !== undefined)
			return t.callable.fun().apply(
					null, 
					t.args.map(function(i){ return evalTree(i); }));
		//---
		else if(t.constant !== undefined)
			return t.constant;
	};
	
	// generateTree
	var generateTree = function(ls, maximum_depth){
		var res = {};
	
		var elem = undefined;
		if(maximum_depth === 1){
			// Pick a terminal at random
			ls = ls.filter(function(f){ return f.type.tag === 'base' || f.type.left.tag === "none" });
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

	var compileTree = function(t){
		var f = '';
		if(t.callable !== undefined){
			if(t.callable.compilable !== undefined){
				f = t.callable.compilable;
			}
			else{
				f = t.callable.fun.toString();
			}
			return f + '.apply(null, [' + t.args.map(compileTree).join(', ') + '])';
		}else if(t.constant !== undefined){
			return t.constant.toString();		
		}
	};


	var Generator = function(){

		var Tree = function(_tree){
			this.compile = function(){
				return compileTree(_tree);
			};
			this.eval = function(){
				return evalTree(_tree);
			};
			return this;
		}

		var forms = [];

		this.addForm = function(stringExpr, typeExpr){
			forms.push(generateEntry(stringExpr, typeExpr));
		};

		this.gen = function(max_depth){
			return new Tree(generateTree(forms, max_depth));
		};

		return this;
	};

	exports.noneType = noneType;
	exports.baseType = baseType;
	exports.arrayType = arrayType;
	exports.arrowType = arrowType;
//	exports. = ;
	exports.Generator = Generator;
})();
