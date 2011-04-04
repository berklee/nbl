/*
 * NBL: Non Blocking Lazy loader v2.0
 * Copyright (c) 2010 Berklee.
 * Licensed under the MIT license.
 *
 * Date: 2010-09-24
 */
this.nbl = {
	c: document,
	q: {}, // The dictionary that will hold the script-queue
  n: null,
  
  // The loader function
  //
  // Called with an array, it will interpret the options array
  // Called without an array it will try to load the options from the script-tag's data-nbl attribute
	l: function(a) { 
    var b, c, x, y, z, s, l, i = j = 0, m = this; m.h = m.c.head || m.c.body;
    
    // The timeout counter, counts backwards every 50ms from 50 ticks (50*50=2500ms by default)
    if (!m.i) {
      m.s = m.f = 0; // Reset counters: completed, created, timeout function
      m.i = setInterval(
        function() { 
          // If the timeout counter dips below zero, or the amount of completed scripts equals the amount 
          // of created script-tags, we can clear the interval
          if (m.o < 0 || m.s == 0) { 
            m.i = clearInterval(m.i); 
            // If the amount of completed scripts is smaller than the amount of created script-tags,
            // and there is a timeout function available, call it with the current script-queue.
            (m.s > 0 && m.f) && m.f(m.q)
          } 
          m.o--
        },
        m.o = 50 // Set the initial ticks at 50, as well as the interval at 50ms
      );
    }

    // If no arguments were given (a == l, which is null), try to load the options from the script tag
    if (a == m.n) {
      s = m.c.getElementsByTagName("script"); // Get all script tags in the current document
      while (j < s.length) {
        if ((a = eval("("+s[j].getAttribute("data-nbl")+")")) && a) { // Check for the data-nbl attribute
          m.h = s[j].parentNode;
          break
        }
        j++
      }
    }
    
    // If an options array was provided, proceed to interpret it
    if (a&&a.shift) {
	    while (i < a.length) { // Loop through the options
        b = a[i]; // Get the current element
        c = a[i+1]; // Get the next element
        x = 'function';
        y = typeof b; 
        z = typeof c;
        l = (z == x) ? c : (y == x) ? b : m.n; // Check whether the current or next element is a function and store it
        if (y == 'number') m.o = b/50; // If the current element is a number, set the timeout interval to this number/50
        // If the current element is a string, call this.a() with the string as a one-element array and the callback function l
        if (y == 'string') m.a([b], l); 
        // If the current element is an array, call this.a() with a two-element array of the string and the next element
        // as well as the callback function l
        b.shift && m.a([b.shift(), b], l); 
        if (!m.f && l) m.f = l; // Store the function l as the timeout function if it hasn't been set yet
        i++
      }
    }
  },
  a: function(u,l) {
    var s, m = this, n = u[0].replace(/.+\/|\.min\.js|\.js$|\W/g, ''); // Clean up the name of the script for storage in the queue
    s = m.q[n] = m.c.createElement("script");
		s.setAttribute("src", u[0]);
		// When this script completes loading, it will trigger a callback function consisting of two things:
		// 1. It will call nbl.l() with the remaining items in u[1] (if there are any)
		// 2. It will execute the function l (if it is a function)
    s.onload = s.onreadystatechange = function(){
      var s = this, d = function(){
        var s = m, r = u[1]; 
        s.q[n] = true; // Set the entry for this script in the script-queue to true
        r && s.l(r); // Call nbl.l() with the remaining elements of the original array
        l && l(); // Call the callback function l
        s.s--
      };
      if ( !s.readyState || /de|te/.test( s.readyState ) ) {
        s.onload = s.onreadystatechange = m.n; d() // On completion execute the callback function as defined above
      }
    };
		m.s++;
		m.h.appendChild(s) // Add the script to the document
  }
};
nbl.l()
