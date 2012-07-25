#!/usr/local/bin/node

with(require("../madmonkey.js")){

	// Create a generator
	var g = new Generator('_->number');

	// Add forms to the generator
	g.addForm('(Math.sin)', 												'(number)->number' ).
			addForm('(Math.cos)', 											'(number)->number' ).
			addForm('(Math.sqrt)', 											'(number)->number' ).
			addForm('(Math.tan)', 											'(number)->number' ).
			addForm('(function(x){ return Math.random() * x})', 	'(number)->number' ).
			addForm('(90)', 													'number').
			//addForm('(180)', 													'number').
			addForm('(270)', 													'number');
			//addForm('(360)', 													'number');
	// ---


	var t = g.gen(10);						// Generate a tree with a maximum depth of 10
	console.log(  t.compile() ); 			// Compile to javascript code
	console.log(  t.eval() );				// Interpret the internal tree representation
	console.log(  eval(t.compile()) ); 	// Eval the compilation of the javascript code
}
