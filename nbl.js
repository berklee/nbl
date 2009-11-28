/*
 * NBL: Non Blocking Lazy loader v1.0
 * Copyright (c) 2009 Berklee.
 * Licensed under the MIT license.
 *
 * Date: 2009-11-28
 */
(function() {
	return m = {
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
			m.q[n] = true;
			m.s--;
			// check if the currently loaded script happens to be jQuery
			if ( n == "jquery" ) {
				if ( typeof( m.p ) == "string" ) m.p = [ m.p ]; // convert the single plugin to an array if neccessary
				for ( i in m.p ) m.load( "p" + i, m.p[i] ); // now load all plugins
				if ( typeof( jQuery ) == "function" ) jQuery( function() { m.j = true; m.ready() } ) // set the jQuery document.ready function
			}
			m.chk() // run the check function to check up on the status of all scripts
		},
		chk: function() { // check for a non-empty stack, meaning scripts have not loaded successfully
			if ( m.o < 0 || m.s == 0 ) {
				clearInterval( m.i );
				m.e = Boolean( m.s );
				m.ready()
			}
			m.o -= 50
		},
		run: function() {
			// read the options from the arguments, the 'opt' attribute of the 'nbl' script-tag or false
			var k, c = document, o = arguments[0] || eval( "(" + c.getElementById( "nbl" ).getAttribute( "opt" ) + ")" ) || false, 
			m = window[o.name||'nbl'] = this; // assign the NBL with the given or default name to the window object, so we can refer to it later
			m.c = c; m.h = ( c.getElementsByTagName("head")[0] || c.documentElement ); // define the document and document.head element

			// only run when there are options
			if ( o ) {
				m.p = ( o.plugins || m.p ); // get the plugins
				m.o = ( o.timeout || 1200 ); // timeout value
				m.ready = ( o.ready || m.ready ); // ready function
				m.i = setInterval( m.chk, 50 ); // start the interval timer

				// if 'jquery: false' was given don't load jQuery, otherwise, if 'jquery: true' or 'jquery: ""' was given use the default url to load jQuery, else use the supplied url
				if ( o.jquery !== false ) m.load( "jquery", o.jquery || m.d );

				// finally, traverse the options, filter out the settings and plugins and load the rest
				for ( k in o ) {
					if ( !(/name|ready|timeout|jquery|plugins/.test(k)) ) m.load( k ,o[k] )
				}
			}
		}
	}
})().run();
