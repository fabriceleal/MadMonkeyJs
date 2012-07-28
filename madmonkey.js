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
	
	/*
	 * Generates a entry for a argument, replaced at execution time
	 */
	var generateEntrySymbol = function(symbol, type){
		return {
			symbol : symbol, 
			compilable: symbol,
			type: type
		};
	};

	/**
	 * Compiles a tree into callable javascript 
	 */
	var compileTree = function(t, argList){
		var f = ''; 
		f += '(function(' ;

		if(argList) f += argList.map(function(a){ return a.name; }).join(', ');

		f += '){';
		f += 'return ('; 
		f += (function _iCompileTree(t){
				// Function call
				if(t.callable !== undefined){
					if(t.callable.compilable !== undefined){
						f = t.callable.compilable;
					}
					else{
						f = t.callable.fun.toString();
					}
					return f + '.apply(null, [' + t.args.map(_iCompileTree).join(', ') + '])';
				// Constant
				}else if(t.constant !== undefined){
					return t.constant.toString();		
				}else if(t.symbol !== undefined){
					return t.symbol.toString();		
				}
		})(t);
		f += '); })';
		return f;
	};

	/**
	 * Interpret the internal tree structure
	 */
	var evalTree = function(t, env){
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
		// Symbol
		else if(t.symbol !== undefined){
			return env[t.symbol];
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

	var isSymbol = function(s){
		return s.symbol !== undefined;
	}

	var isConstant = function(c){
		return (c.type.tag === 'base');
	}

	var isFunctionWithArgs = function(f){
		return (isFunction(f) && f.type.left.tag === "array");
	};

	var isFunctionWithNoArgs = function(f){
		return (isFunction(f) && f.type.left.tag === "none");
	};

	var randomInRange = function(start, end){
		return Math.floor(Math.random() * (end - start) + start);
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
		var idx = randomInRange(0, ls.length);
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
			if(isSymbol(elem)){
				return {
					symbol : elem.symbol
				};
			}else{
				return {
					constant: elem.fun()			
				};
			}
		}else{
			throw new Error('Invalid member!');
		}

		return res;
	}

	// aux, from here: http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-a-javascript-object
	function clone(obj){
		 if(obj == null || typeof(obj) != 'object')
		     return obj;

		 var temp = obj.constructor(); // changed

		 for(var key in obj)
		     temp[key] = clone(obj[key]);
		 return temp;
	}


	// TODO Way to reference arguments
	// TODO Way to validate output of tree and branches inside
	var Generator = function( syntax , args ){
		if(args === undefined){ 
			args = []; 
		}
		//console.log(args);

		var Tree = function( _tree ){
			this.raw = _tree;

			this.compile = function( ){
				return compileTree(_tree, args);
			};
			this.eval = function( binds ){
				return evalTree(_tree, binds );
			};

			// Counts all leafs
			var _size = 
					(function __codeSize(node){
						if(node.constant !== undefined || node.symbol !== undefined){
							return 1;
						}
						else if (node.args !== undefined){
							return 1 + node.args.reduce(function(t, i){ return t + __codeSize(i)}, 0);
						}
						return 0;
					})(_tree);
			//---
			if(_size < 1){
				console.log(_tree);
				throw new Error('Codesize says that programs of size zero are not allowed!!!');
			}

			this.codeSize = function(){
				return _size;
			}

			var pickNode = function(tree){
				var prob = 1 / _size;

				var max_depth = (function _maxDepth(node){
					if(node.constant !== undefined || node.symbol !== undefined){
						return 1;
					} else if (node.args !== undefined){
						return 1 + node.args.reduce(function(v, i){ return Math.max(v, _maxDepth(i));	}, -1);
					}
					return 0;
				})(tree);

				return (function _pick(node, depth){
							if (depth === max_depth) {
								// the end ...
								return node;
							} else if(Math.random() <= prob){
								// return current node
								return node;
							} else if(node.args !== undefined) {
								for(var k in node.args){
									var tmp = _pick(node.args[k], depth + 1); 
									if(tmp !== null) return tmp;
								}
								return node; // Just to be sure ...
							}
							throw new Error('I wanted to pick a node, but I didnt like none.');
						})(tree, 1) 
			}

			this.inject = function(src){
				// inject src into this
				var indRaw = clone(_tree);
				var nodeTarget = pickNode(indRaw);

				//console.log('');
				//console.log('OLD:' + JSON.stringify(nodeTarget, null, 3));
				//console.log('NEW:' + JSON.stringify(src.raw, null, 3));
				if(src.raw.constant === undefined && src.raw.callable === undefined && src.raw.args === undefined && src.raw.symbol === undefined){
					//console.log(JSON.stringify(src, null, 3));
					throw new Error('Dont try to inject nothing!');
				}
				nodeTarget.symbol 	= src.raw.symbol;
				nodeTarget.constant 	= src.raw.constant;
				nodeTarget.callable 	= src.raw.callable;
				nodeTarget.args 		= src.raw.args;
				
				return new Tree(indRaw);
			}

			this.extract = function(){
				var node = clone(pickNode(_tree));
				if(node.constant === undefined && node.callable === undefined && node.args === undefined && node.symbol === undefined){
					throw new Error("extract'ed empty node from tree!");
				}
				return new Tree( node );
			};
			return this;
		}

		var forms = [], _this = this/*, _args = []*/;
		//console.log(args);
		// Add args to forms
		args.forEach(function(a){
			//console.log('hey!');
			forms.push(generateEntrySymbol(a.name , types.parse(a.type)));
		});

		this.addForm = function( stringExpr, typeExpr ){
			forms.push(generateEntry(stringExpr, types.parse(typeExpr)));

			return _this;
		};

		this.gen = function( max_depth ){
			//console.log(forms);
			return new Tree(generateTree(forms, max_depth, "?", "?"));
		};

		return this;
	};

	exports.Generator = Generator;
})();
