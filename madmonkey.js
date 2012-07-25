(function(){
	var types = require('./types.js').parser;

	/**
	 * The "constant combinator". Returns a function that always returns the argument "v".
	 */
	var k = function(v){
		return function(){
			return v;
		};
	};

	/* "types"
		* noneType: used for functions that do not return values or for functions that do not have input args

		{
			tag:"none"
		}


		* baseType: used for anything other than a function (numbers, strings, objects, arrays)

		{
			tag:"base",
			name:?
		}

		* arrayType: used for holding a function's arguments

		{
			tag: "array",
			value: [ ..., baseType, arrowType, ...]
		}

		* arrowType: used for holding a function's signature

		{
			tag:"arrow",
			left:noneType, arrayType,
			right:noneType, baseType, arrowType
		}

	};

	*/

	/*
	 * Generates a entry of a form for the generator's internal list
	 */
	var generateEntry = function(body, type){
		return {
			fun : k(eval(body)), 
			compilable: body,
			type: type
		};
	};

	/**
	 * Compiles a tree into callable javascript 
	 */
	var compileTree = function(t){
		var f = '';
		// Function call
		if(t.callable !== undefined){
			if(t.callable.compilable !== undefined){
				f = t.callable.compilable;
			}
			else{
				f = t.callable.fun.toString();
			}
			return f + '.apply(null, [' + t.args.map(compileTree).join(', ') + '])';
		// Constant
		}else if(t.constant !== undefined){
			return t.constant.toString();		
		}
	};

	/**
	 * Interpret the internal tree structure
	 */
	var evalTree = function(t){
		// Function call
		if(t.callable !== undefined){
			return t.callable.fun().apply(
					null, 
					t.args.map(function(i){ return evalTree(i); }));
		}
		// Constant
		else if(t.constant !== undefined){
			return t.constant;
		}
	};

	// Helper functions
	var isFunction = function(f){
		return (f.type.tag === "arrow");
	}

	// Any base type or any function without arguments is a terminal.
	var isTerminal = function(f){
		return (isConstant(f) || isFunctionWithNoArgs(f));
	};

	var isConstant = function(c){
		return (c.type.tag === 'base');
	}

	var isFunctionWithArgs = function(f){
		return (isFunction(f) && f.type.left.tag === "array");
	};

	var isFunctionWithNoArgs = function(f){
		return (isFunction(f) && f.type.left.tag === "none");
	};
	
	/**
	 * Generates the internal tree
	 */
	var generateTree = function(ls, maximum_depth, input, output){
		var res = {};
		if(maximum_depth < 1){
			throw new Error("maximum_depth should be greater than zero!");
		}

		// TODO Filter ls accordingly to input / output
		
		
		if(ls.length === 0){
			throw new Error("Nothing to choose!!!");
		}

		var elem = undefined;
		if(maximum_depth === 1){
			// Select terminals
			ls = ls.filter( isTerminal );
			if(ls.length === 0){
				throw new Error("No terminals to choose!!!");
			}
		}

		// Pick at random
		var idx = Math.floor(Math.random() * ls.length);
		elem = ls[idx]

		// Function call
		if( isFunction(elem) ){
			
			var args = [];

			if( isFunctionWithArgs(elem) ){
				// Continue Recursively ...			
				args = elem.type.left.value.map( k(generateTree(ls, maximum_depth - 1, "?", "?")) );
			}

			return {
				callable : elem,
				args: args
			}

		// Constant value
		}else if(isConstant(elem)){
			
			return {
				constant: elem.fun()			
			};

		}else{
			throw new Error('Invalid member!');
		}

		return res;
	}


	// TODO Way to reference arguments
	// TODO Way to validate output of tree and branches inside
	var Generator = function( syntax ){

		var Tree = function( _tree ){
			this.compile = function(){
				return compileTree(_tree);
			};
			this.eval = function(){
				return evalTree(_tree);
			};
			return this;
		}

		var forms = [], _this = this;

		this.addForm = function( stringExpr, typeExpr ){
			forms.push(generateEntry(stringExpr, types.parse(typeExpr)));

			return _this;
		};

		this.gen = function( max_depth ){
			return new Tree(generateTree(forms, max_depth, "?", "?"));
		};

		return this;
	};

	exports.Generator = Generator;
})();
