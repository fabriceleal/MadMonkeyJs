# MadMonkeyJs

A node.js module for generating random javascript programs

## Features

* Generates maximum-depth-constrained trees.
* Generates a walkable/manipulable/evalable tree.
* Compiles to javascript function.
* Several methods for extracting, injecting and 
crossing trees (suitable for genetic programming algorithms).

## TODO

* Generate **typed** programs.
* More types.
* Hability to specify more complex grammars to the generator.

## Installing

```shell
npm install madmonkey
```

## Example

Check example/main.js for a working example!

Usage: 

```javascript
	var madmonkey = require("madmonkey");

	// Create a generator with the "signature" of the program
	// The signature is the type of the parameters (or lack of them...) 
	// and the type of the return value (or lack of it ...)

	// Our program will take no parameters and return a number
	var g = new Generator('_->number');

	// Add "forms" to the generator
	// A form is a valid element inside the program
	// A form can be:
	//		* A constant (ex: '(80)')
	//		* A built-in function (ex: '(Math.cos)')
	//		* A custom function (ex: '(function(x){ return x * 2;})')
	// All forms should be provided with their signature
	g.addForm('(80)', 'number');
	g.addForm('(Math.cos)', '(number)->number');
	g.addForm('(function(x){ return x * 2; })', '(number)->number');

	// Generate a "tree", with a maximum depth of 10.
	// A tree is the main result of the generator, and consists of a nested chain of forms.
	// This tree can be compiled into a javascript function or 
	// immediately evaled in an interpreted way.
	var t = g.gen(10);
	
	// Compile to javascript source
	var f = t.compile();

	// Output final function, output result of evaluation with parameter 5
	console.log(eval(f).toString());
	console.log(eval(f)(5));

```
