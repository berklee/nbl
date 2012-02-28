/*
 * NBL: Non Blocking Lazy loader v2.0
 * Copyright (c) 2010 Berklee. Additional input from Knowlecules. CSS callback bug fix, additional code reduction by Richard Lopes.
 * Licensed under the MIT license.
 *
 * Date: 2010-09-24
 */

// ==ClosureCompiler==
// @output_file_name default.js
// @compilation_level ADVANCED_OPTIMIZATIONS
// ==/ClosureCompiler==

/*jslint browser: true, white: true, eqeq: true, plusplus: true */

/**
 * @constructor
 */
(function (document) {
    "use strict";
    var queue = {},  // The dictionary that will hold the script-queue
        timeout, ticks,
        timeoutHandler,
        pendingCount,
        addScripts,
        head = document.head || document.body || document.documentElement,
        // The loader function
        //
        // Called with an array, it will interpret the options array
        // Called without an array it will try to load the options from the script-tag's data-nbl attribute
        /**
         * @param {*=} params
         */
            load = function(params) {
            var cur_element, next_element, function_type, cur_type, next_type, scripts, handler, i=0,j = 0;

            // The timeout counter, counts backwards every 50ms from 50 ticks (50*50=2500ms by default)
            if (!timeout) {
                pendingCount = timeoutHandler = 0; // Reset counters: completed, created, timeout function
                timeout = setInterval(
                    function() {
                        // If the timeout counter dips below zero, or the amount of completed scripts equals the amount
                        // of created script-tags, we can clear the interval
                        if (ticks < 0 || !pendingCount) {
                            timeout = clearInterval(timeout);
                            // If the amount of completed scripts is smaller than the amount of created script-tags,
                            // and there is a timeout function available, call it with the current script-queue.
                            if(pendingCount > 0 && timeoutHandler) {timeoutHandler(queue);}
                        }
                        ticks--;
                    },
                    ticks = 50 // Set the initial ticks at 50, as well as the interval at 50ms
                );
            }

            // If no arguments were given (a == l, which is null), try to load the options from the script tag
            if (!params) {
                scripts = document.getElementsByTagName("script"); // Get all script tags in the current document
                while (j < scripts.length) {
                    /*jslint evil:true */
                    params = eval("("+scripts[j].getAttribute("data-nbl")+")");
                    if (params) { // Check for the data-nbl attribute
                        head = scripts[j].parentNode;
                        break;
                    }
                    j++;
                }
            }

            // If an options array was provided, proceed to interpret it
            if (params && params.shift) {
                while (i < params.length) { // Loop through the options
                    cur_element = params[i]; // Get the current element
                    next_element = params[i+1]; // Get the next element
                    function_type = 'function';
                    cur_type = typeof cur_element;
                    next_type = typeof next_element;
                    handler = (next_type == function_type) ?
                        next_element :
                        (cur_type == function_type) ? cur_element : 0; // Check whether the current or next element is a function and store it
                    if (cur_type == 'number') {ticks = cur_element/50;} // If the current element is a number, set the timeout interval to this number/50
                    // If the current element is a string, call this.addScripts() with the string as a one-element array and the callback function l
                    if (cur_type == 'string') {addScripts([cur_element], handler);}
                    // If the current element is an array, call this.addScripts() with a two-element array of the string and the next element
                    // as well as the callback function l
                    if(cur_element.shift) { addScripts([cur_element.shift(), cur_element], handler);}

                    if (!timeoutHandler && handler) {timeoutHandler = handler;} // Store the function l as the timeout function if it hasn't been set yet
                    i++;
                }
            }
        };
        addScripts = function(addList, handler) {
            /*jslint regexp: true*/
            var tag, type,
                name = addList[0].replace(/.+\/|\.min\.js|\.js|\?.+|\W/gi, ''),
                k = {'js': {tagname: "script", attr: "src"},
                    'css': {tagname: "link", attr: "href", relat: "stylesheet"},
                    'i': {tagname: "img", attr: "src"}}, // Clean up the name of the script for storage in the queue
                loaded = function(){
                    var scriptHandler = addList[1];
                    queue[name] = true; // Set the entry for this script in the script-queue to true
                    if(scriptHandler){ load(scriptHandler);} // Call nbl.l() with the remaining elements of the original array
                    if(handler){ handler();} // Call the callback function l
                };
            type = addList[0].match(/\.([cjs]{2,4})$|\?.+/i);
            type = (type) ? type[1] : "i";
            if(queue[name] === true) {
                // don't readd script if script already added
                return loaded();
            }
            tag = queue[name] = document.createElement(k[type].tagname);
            tag.setAttribute(k[type].attr, addList[0]);
            // Fix: CSS links do not fire onload events - Richard Lopes
            // Images do. Limitation: no callback function possible after CSS loads
            if (k[type].relat) {
                tag.setAttribute("rel", k[type].relat);
                loaded();
            } else {
                // When this script completes loading, it will trigger a callback function consisting of two things:
                // 1. It will call nbl.l() with the remaining items in u[1] (if there are any)
                // 2. It will execute the function l (if it is a function)
                tag.onload = tag.onreadystatechange = function(){
                    var s = this;
                    if ( !s.readyState || /de|te/.test( s.readyState ) ) {
                        s.onload = (s.onreadystatechange = 0);
                        loaded(); // On completion execute the callback function as defined above
                        pendingCount--;
                    }
                };
                pendingCount++;
            }
            head.appendChild(tag); // Add the script to the document
        };
    window["nbl"] = {'l':load};
    load();
}(document));
