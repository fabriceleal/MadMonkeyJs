#!/usr/local/bin/node

with(require("madmonkey")){

	// Create a generator
	var g = new Generator('_->number');

	// Add forms to the generator
	g.addForm('(Math.sin)', 												'(number)->number' ).
			addForm('(Math.cos)', 											'(number)->number' ).
			addForm('(Math.sqrt)', 											'(number)->number' ).
			addForm('(Math.tan)', 											'(number)->number' ).
			addForm('(180)', 													'number');
	// ---

	var g2 = new Generator('_->number');

	g2.addForm('(function(x){ return Math.random() * x})', 	'(number)->number' ).
			addForm('(function(x){ return Math.random() * x * 2})', 	'(number)->number' ).
			addForm('(function(x){ return Math.random() * x / 2})', 	'(number)->number' ).
			//addForm('(0)', 													'number').
			//addForm('(180)', 													'number').
			//addForm('(270)', 													'number').
			addForm('(360)', 													'number');
	// ---

	var t = g.gen(10);						// Generate a tree with a maximum depth of 10
	var t2 = g2.gen(10);

	console.log( 't = ' + t.compile() ); 			// Compile to javascript code
	console.log( 't2 = ' + t2.compile() )

	var e = t2.extract();
	console.log( 'extracted = ' + e.compile() );
	console.log( 'hybrid = ' + t.inject(e).compile() );

//	console.log(  t.eval() );				// Interpret the internal tree representation
//	console.log(  eval(t.compile()) ); 	// Eval the compilation of the javascript code
//	console.log( 'size = ' + t.codeSize() );
//	console.log( t.extract().compile() );

}
