#!/usr/local/bin/node

with(require("madmonkey")){

	// Create a generator
	var g = new Generator('_->number');

	// Add forms to the generator
	g.addForm('(Math.sin)', '(number)->number' ).
			addForm('(Math.cos)', '(number)->number' ).
			addForm('(Math.sqrt)', '(number)->number' ).
			addForm('(Math.tan)', '(number)->number' ).
			addForm('(180)', 'number');
	// ---

	var g2 = new Generator('_->number');

	g2.addForm('(function(x){ return Math.random() * x})', '(number)->number' ).
			addForm('(function(x){ return Math.random() * x * 2})', '(number)->number' ).
			addForm('(function(x){ return Math.random() * x / 2})', '(number)->number' ).
			addForm('(360)', 'number');
	// ---

	// Generate a tree with a maximum depth of 10
	var t = g.gen(10);						
	var t2 = g2.gen(10);

	// Compile to javascript code
	console.log( 't = ' + t.compile() ); 			
	console.log( 't2 = ' + t2.compile() )

	var e = t2.extract();
	console.log( 'extracted = ' + e.compile() );
	console.log( 'hybrid = ' + t.inject(e).compile() );

}
