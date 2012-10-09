
final=types.js

types.js: types.peg
	pegjs -e exports.parser types.peg
