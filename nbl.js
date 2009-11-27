/*
 * NBL: Non Blocking Lazy loader v1.0
 * Copyright (c) 2009 Berklee.
 * Licensed under the MIT license.
 *
 * Date: 2009-11-26
 */
(function() {
	var	m = {
		d: "http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js", // default jQuery url
		p: [], // the jQuery plugins array
		q: {}, // the script-tags queue
		s: 0, // the script-tags stack
		ready: function(){},
		load: function( n, u ) { // loads a given url 'u' with the given name 'n' via dynamic script-tag
			var m = this, // shortcut for the NBL object
			s = m.q[n] = m.c.createElement("script");
			s.setAttribute( "src", u );
			s.onload = s.onreadystatechange = function(){ var s = this; if ( !s.readyState || /de|te/.test( s.readyState ) ) { s.onload = s.onreadystatechange = null; m.cmp( n ) } };
			m.h.appendChild( s );
			m.s++ // increase stack
		},
		cmp: function( n ) { // triggered on a complete load of script 'n'
			var i, m = this;
			m.q[n].parentNode.removeChild( m.q[n] );
			m.q[n]=true;
			m.s--;
			// check if the currently loaded script happens to be jQuery
			if ( n == "jquery" ) {
				for ( i in m.p ) { // jQuery has loaded, now load all plugins
					m.load( "p" + i, m.p[i] )
				}
				if ( typeof( jQuery ) == "function" ) jQuery( function() { m.j = true; m.ready() } ) // set the jQuery document.ready function
			}
			m.chk() // run the check function to check up on the status of all scripts
		},
		chk: function() { // check for a non-empty stack, meaning scripts have not loaded successfully
			m = m||this;
			if ( m.o > ( (new Date()).getTime() - m.a )  ) { // the timeout value is still larger than the elapsed time
				if ( m.s == 0 ) m.ready(); // all scripts have loaded, so call nbl.ready()
				else setTimeout( m.chk, 50 ); // check back in 50ms
			}
			else { // timeout has been reached, set the error property and call nbl.ready()
				m.e = true;
				m.ready();
			}
			return;
		},
		run: function() {
			// read in the options from the arguments, or from the 'opt' attribute of the 'nbl' script-tag, or an empty object by default
			var k, c = document, o = arguments[0] || eval( "(" + c.getElementById( "nbl" ).getAttribute( "opt" ) + ")" ) || {},
			n = o.name||'nbl', // retrieve the NBL objects name from the options
			m = window[n] = this; delete o.name; // assign the NBL object to window object, so we can refer to it later
			m.c = c; // document element
			m.h = ( c.getElementsByTagName("head")[0] || c.documentElement ); // document.head element

			m.a = (new Date()).getTime(); // anchor the timeout
			m.o = ( o.timeout || 1200 ); delete o.timeout; // extract the timeout value if it is a number, then remove it
			m.ready = ( o.ready || m.ready ); delete o.ready; // extract the ready function if it is a function, then remove it

			// if 'jquery: false' was given don't load jQuery, otherwise, if 'jquery: true' or 'jquery: ""' was given use the default url to load jQuery, else use the supplied url
			if ( o.jquery !== false ) { m.load( "jquery", ( o.jquery === true ) ? m.d : o.jquery || m.d ) };
			delete o.jquery; // remove the jquery option

			// finally, traverse the remaining options, filter out the plugins into a separate nbl.p array and load the other ones
			for ( k in o ) {
				if ( /plugin/.test(k) ) { // if this key simply contains the word 'plugin', consider it a jQuery plugin to be loaded after jQuery has
					m.p = m.p.concat( ( typeof( o[k] ) == "string" ) ? [ o[k] ] : o[k] ) // if the plugin given is a string, convert it to an array and append it to the nbl.p array
				}
				else {
					m.load( k ,o[k] ) // this is a normal script definition, so load it
				}
			};
			return;
		}
	}
	return m
})().run();
