/*
 * NBL: Non Blocking Lazy loader v1.0
 * Copyright (c) 2009 Berklee.
 * Licensed under the MIT license.
 *
 * Date: 2009-11-26
 */
var nbl = {
	d: "http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js", // default jQuery url
	h: document.getElementsByTagName("head")[0], // document.head element
	j: false, // true if jQuery's document.ready was used to trigger nbl.ready()
	e: false, // true if there were errors loading any of the scripts
	o: 1200, // default number of milliseconds to wait before triggering nbl.ready()
	p: [], // the jQuery plugins array
	q: {}, // the script-tags queue
	s: 0, // the script-tags stack
	a: 0, // the timout anchor
	ready: function(){}, // by default does nothing
	load: function( n, u ) { // loads a given url 'u' with the given name 'n' via dynamic script-tag
		var s = nbl.q[n] = document.createElement("script");
		s.setAttribute( "src", u );
		if ( s.addEventListener ) { s.addEventListener( "load", function(){ nbl.cmp( n ) }, false ) } // trigger nbl.cmp() on success
		else { s.onreadystatechange = function(){ if ( /loaded|complete/.test( this.readyState ) ) { this.onreadystatechange = null; nbl.cmp( n ) } } }; // for ie
		nbl.h.appendChild( s );
		nbl.s++ // increase stack
	},
	cmp: function( n ) { // triggered on a complete load of script 'n'
		nbl.q[n].parentNode.removeChild( nbl.q[n] );
		nbl.q[n]=true;
		nbl.s--;
		// check if the currently loaded script happens to be jQuery
		if ( n == "jquery" ) {
			for ( i in nbl.p ) { // jQuery has loaded, now load all plugins
				nbl.load( "p" + i, nbl.p[i] )
			}
			if ( typeof( jQuery ) == "function" ) jQuery( function() { nbl.j = true; nbl.ready() } ) // set the jQuery document.ready function
		}
		nbl.chk()
	},
	chk: function() { // check for a non-empty stack, meaning scripts have not loaded successfully
		if ( nbl.o > ( (new Date()).getTime() - nbl.a )  ) { // the timeout value is still larger than the elapsed time
			if ( nbl.s == 0 ) nbl.ready(); // all scripts have loaded, so call nbl.ready()
			else setTimeout( nbl.chk, 50 ); // check back in 50ms
		}
		else { // timeout has been reached, set the error property and call nbl.ready()
			nbl.e = true;
			nbl.ready()
		}
	},
	run: function() {
		// read in the options from the arguments, or from the 'opt' attribute of the 'nbl' script-tag, or an empty object by default
		var o = arguments[0] || eval( "(" + document.getElementById( "nbl" ).getAttribute( "opt" ) + ")" ) || {};
		nbl.a = (new Date()).getTime(); // anchor the timeout

		if ( typeof( o.timeout ) == "number" ) { nbl.o=o.timeout; delete o.timeout }; // extract the timeout value if it is a number, then remove it
		if ( typeof( o.ready ) == "function" ) { nbl.ready = o.ready; delete o.ready }; // extract the ready function if it is a function, then remove it

		// if 'jquery: false' was given don't load jQuery, otherwise, if 'jquery: true' or 'jquery: ""' was given use the default url to load jQuery, else use the supplied url
		if ( o.jquery !== false ) { nbl.load( "jquery", ( o.jquery === true ) ? nbl.d : o.jquery || nbl.d ) };
		delete o.jquery; // remove the jquery option

		// finally, traverse the remaining options, filter out the plugins into a separate nbl.p array and load the other ones
		for ( k in o ) {
			if ( k.indexOf( "plugin" ) > -1 ) { // if this key simply contains the word 'plugin', consider it a jQuery plugin to be loaded after jQuery has
				nbl.p = nbl.p.concat( ( typeof( o[k] ) == "string" ) ? [ o[k] ] : o[k] ) // if the plugin given is a string, convert it to an array and append it to the nbl.p array
			}
			else {
				nbl.load( k ,o[k] ) // this is a normal script definition, so load it
			}
		}
	}
};
nbl.run();