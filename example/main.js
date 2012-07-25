#!/usr/local/bin/node

with(require("./madmonkey.js")){

	var g = new Generator();
	g.addForm('(Math.sin)', arrowType(arrayType(baseType('num')), baseType('num')) ),
	g.addForm('(function(){ return Math.random() * 360})', arrowType(noneType(), baseType('num')) ),
	g.addForm('(180)', baseType('num'))

	var t = g.gen(5);
	console.log(t.compile());
	console.log(t.eval());
}
