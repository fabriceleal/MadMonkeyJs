# MadMonkeyJs

A node.js module for generating random javascript programs

## Installing

```shell
npm install madmonkey
```

## Using

Check example/main.js for a working example!

Usage: 

```javascript
	var madmonkey = require("madmonkey");

	// Create a generator with the "signature" of the program
	// The signature is the type of the parameters (or lack of them...) and the type of the return value (or lack of it ...)

	// Our program will take no parameters and return a number
	var g = new Generator('_->number');

	// Add "forms" to the generator
	// A form is a valid element inside the program
	// A form can be:
	//		* A constant (ex: '(80)')
	//		* A built-in function (ex: '(Math.cos)')
	//		* A custom function (ex: '(function(x){ return x * 2;})')
	// All forms should be provided with their signature
	//

```
