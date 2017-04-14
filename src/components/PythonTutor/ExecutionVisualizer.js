
import DataVisualizer from './DataVisualizer'
import NavigationController from './NavigationController'
import ProgramOutputBox from './ProgramOutputBox'
import CodeDisplay from './CodeDisplay'

let curVisualizerID = 1;
let DEFAULT_EMBEDDED_CODE_DIV_WIDTH = 380;
let DEFAULT_EMBEDDED_CODE_DIV_HEIGHT = 400;

class ExecutionVisualizer {

  constructor(domRootID, data, params) {
    this.params = {};
    this.curInputCode = '';
    this.curTrace = [];
    this.codeOutputLines = [] // {text: string, lineNumber: number, executionPoints: number[], this.breakpointHere = boolean}[] = [];
    this.promptForUserInput // boolean;
    this.userInputPromptStr // string;
    this.promptForMouseInput // boolean;
    this.curInstr = 0;
    this.updataeHistory = [];
    this.creationTime // number;
    this.pytutor_hooks = {} // {string?: any[]} = {};
    this.prevLineIsReturn // boolean;
    this.curLineIsReturn // boolean;
    this.prevLineNumber // number;
    this.curLineNumber // number;
    this.curLineExceptionMsg // string;
    this.instrLimitReached = false;
    this.instrLimitReachedWarningMsg // string;
    this.hasRendered = false;
    this.visualizerID // number;
    this.breakpoints = d3.map(); // d3.Map<{}>  set of execution points to set as breakpoints
    this.sortedBreakpointsList = [];  // sorted and synced with breakpoints


    this.curInputCode = data.beforeCode.replace(/\s*$/g, ""); // kill trailing spaces
    this.params = params;

    this.props = data
    this.curTrace = data.beforeTraces;

    // postprocess the trace
    if (this.curTrace.length > 0) {
      var lastEntry = this.curTrace[this.curTrace.length - 1];

      // if the final entry is raw_input or mouse_input, then trim it from the trace and
      // set a flag to prompt for user input when execution advances to the
      // end of the trace
      if (lastEntry.event === 'raw_input') {
        this.promptForUserInput = true;
        this.userInputPromptStr = htmlspecialchars(lastEntry.prompt);
        this.curTrace.pop() // kill last entry so that it doesn't get displayed
      }
      else if (lastEntry.event === 'mouse_input') {
        this.promptForMouseInput = true;
        this.userInputPromptStr = htmlspecialchars(lastEntry.prompt);
        this.curTrace.pop() // kill last entry so that it doesn't get displayed
      }
      else if (lastEntry.event === 'instruction_limit_reached') {
        this.instrLimitReached = true;
        this.instrLimitReachedWarningMsg = lastEntry.exception_msg;
        this.curTrace.pop() // postprocess to kill last entry
      }
    }

    // if you have multiple ExecutionVisualizer on a page, their IDs
    // better be unique or else you'll run into rendering problems
    if (this.params.visualizerIdOverride) {
      this.visualizerID = this.params.visualizerIdOverride;
    } else {
      this.visualizerID = curVisualizerID;
      assert(this.visualizerID > 0);
      curVisualizerID++;
    }

    // sanitize to avoid nasty 'undefined' states
    this.params.disableHeapNesting = (this.params.disableHeapNesting === true);
    this.params.drawParentPointers = (this.params.drawParentPointers === true);
    this.params.textualMemoryLabels = (this.params.textualMemoryLabels === true);
    this.params.showAllFrameLabels = (this.params.showAllFrameLabels === true);

    // insert ExecutionVisualizer into domRootID in the DOM
    var tmpRoot = $('#' + domRootID);
    var tmpRootD3 = d3.select('#' + domRootID);
    tmpRoot.html('<div class="ExecutionVisualizer"></div>');

    // the root elements for jQuery and D3 selections, respectively.
    // ALWAYS use these and never use raw $(__) or d3.select(__)
    this.domRoot = tmpRoot.find('div.ExecutionVisualizer');
    this.domRootD3 = tmpRootD3.select('div.ExecutionVisualizer');

    if (this.params.lang === 'java') {
      this.activateJavaFrontend(); // ohhhh yeah! do this before initializing codeOutputLines (ugh order dependency)
    }


    var lines = this.curInputCode.split('\n');
    for (var i = 0; i < lines.length; i++) {
      var cod = lines[i];
      var n: {text: string, lineNumber: number, executionPoints: number[], breakpointHere: boolean} = {
        text: cod,
        lineNumber: i + 1,
        executionPoints: [],
        breakpointHere: false,
      };

      $.each(this.curTrace, function(j, elt) {
        if (elt.line === n.lineNumber) {
          n.executionPoints.push(j);
        }
      });

      // if there is a comment containing 'breakpoint' and this line was actually executed,
      // then set a breakpoint on this line
      var breakpointInComment = false;
      var toks = cod.split('#');
      for (var j = 1 /* start at index 1, not 0 */; j < toks.length; j++) {
        if (toks[j].indexOf('breakpoint') != -1) {
          breakpointInComment = true;
        }
      }

      if (breakpointInComment && n.executionPoints.length > 0) {
        n.breakpointHere = true;
        this.addToBreakpoints(n.executionPoints);
      }

      this.codeOutputLines.push(n);
    }

    this.try_hook("end_constructor", {myViz:this});
    this.render(); // go for it!
  }

  /* API for adding a hook, created by David Pritchard
     https://github.com/daveagp

    [this documentation is a bit deprecated since Philip made try_hook a
     method of ExecutionVisualizer, but the general ideas remain]

   An external user should call
     add_pytutor_hook("hook_name_here", function(args) {...})
   args will be a javascript object with several named properties;
   this is meant to be similar to Python's keyword arguments.

   The hooked function should return an array whose first element is a boolean:
   true if it completely handled the situation (no further hooks
   nor the base function should be called); false otherwise (wasn't handled).
   If the hook semantically represents a function that returns something,
   the second value of the returned array is that semantic return value.

   E.g. for the Java visualizer a simplified version of a hook we use is:

  add_pytutor_hook(
    "isPrimitiveType",
    function(args) {
      var obj = args.obj; // unpack
      if (obj instanceof Array && obj[0] == "CHAR-LITERAL")
        return [true, true]; // yes we handled it, yes it's primitive
      return [false]; // didn't handle it, let someone else
    });

   Hook callbacks can return false or undefined (i.e. no return
   value) in lieu of [false].

   NB: If multiple functions are added to a hook, the oldest goes first. */
  add_pytutor_hook(hook_name, func) {
    if (this.pytutor_hooks[hook_name])
      this.pytutor_hooks[hook_name].push(func);
    else
      this.pytutor_hooks[hook_name] = [func];
  }

  /*  [this documentation is a bit deprecated since Philip made try_hook a
       method of ExecutionVisualizer, but the general ideas remain]

  try_hook(hook_name, args): how the internal codebase invokes a hook.

  args will be a javascript object with several named properties;
  this is meant to be similar to Python's keyword arguments. E.g.,

  function isPrimitiveType(obj) {
    var hook_result = try_hook("isPrimitiveType", {obj:obj});
    if (hook_result[0]) return hook_result[1];
    // go on as normal if the hook didn't handle it

  Although add_pytutor_hook allows the hooked function to
  return false or undefined, try_hook will always return
  something with the strict format [false], [true] or [true, ...]. */
  try_hook(hook_name, args) {
    if (this.pytutor_hooks[hook_name]) {
      for (var i=0; i<this.pytutor_hooks[hook_name].length; i++) {
        // apply w/o "this", and pack sole arg into array as required by apply
        var handled_and_result
          = this.pytutor_hooks[hook_name][i].apply(null, [args]);

        if (handled_and_result && handled_and_result[0])
          return handled_and_result;
      }
    }
    return [false];
  }

  // create a unique ID, which is often necessary so that jsPlumb doesn't get confused
  // due to multiple ExecutionVisualizer instances being displayed simultaneously
  generateID(original_id) {
    // (it's safer to start names with a letter rather than a number)
    return 'v' + this.visualizerID + '__' + original_id;
  }

  render() {
    if (this.hasRendered) {
      alert('ERROR: You should only call render() ONCE on an ExecutionVisualizer object.');
      return;
    }

    var myViz = this; // to prevent confusion of 'this' inside of nested functions

    if (this.params.verticalStack) {
      this.domRoot.html('<table border="0" class="visualizer">\
                           <tr><td class="vizLayoutTd" id="vizLayoutTdFirst""></td></tr>\
                           <tr><td class="vizLayoutTd" id="vizLayoutTdSecond"></td></tr>\
                         </table>');
    }
    else {
      this.domRoot.html('<table border="0" class="visualizer"><tr>\
                           <td class="vizLayoutTd" id="vizLayoutTdFirst"></td>\
                           <td class="vizLayoutTd" id="vizLayoutTdSecond"></td>\
                         </tr></table>');
    }

    // create a container for a resizable slider to encompass
    // both CodeDisplay and NavigationController
    this.domRoot.find('#vizLayoutTdFirst').append('<div id="codAndNav" style="width: 550px;"/>');
    var base = this.domRoot.find('#vizLayoutTdFirst #codAndNav');
    var baseD3 = this.domRootD3.select('#vizLayoutTdFirst #codAndNav');

    this.codDisplay = new CodeDisplay(this, base, baseD3,
                                      this.curInputCode, this.params.lang, this.params.editCodeBaseURL);
    this.navControls = new NavigationController(this, base, baseD3, this.curTrace.length);

    if (this.params.embeddedMode) {
      // don't override if they've already been set!
      if (this.params.codeDivWidth === undefined) {
        this.params.codeDivWidth = DEFAULT_EMBEDDED_CODE_DIV_WIDTH;
      }

      if (this.params.codeDivHeight === undefined) {
        this.params.codeDivHeight = DEFAULT_EMBEDDED_CODE_DIV_HEIGHT;
      }

      // add an extra label to link back to the main site, so that viewers
      // on the embedded page know that they're seeing an OPT visualization
      // base.append('<div style="font-size: 8pt; margin-bottom: 10px;">Visualized using <a href="http://pythontutor.com" target="_blank" style="color: #3D58A2;">Python Tutor</a> by <a href="http://www.pgbovine.net/" target="_blank" style="color: #3D58A2;">Philip Guo</a></div>');
      base.find('#codeFooterDocs').hide(); // cut out extraneous docs
    }

    // not enough room for these extra buttons ...
    if (this.params.codeDivWidth &&
        this.params.codeDivWidth < 470) {
      this.domRoot.find('#jmpFirstInstr').hide();
      this.domRoot.find('#jmpLastInstr').hide();
    }

    if (this.params.codeDivWidth) {
      this.domRoot.find('#codAndNav').width(this.params.codeDivWidth);
    }

    if (this.params.codeDivHeight) {
      this.domRoot.find('#pyCodeOutputDiv')
        .css('max-height', this.params.codeDivHeight + 'px');
    }


    // enable left-right draggable pane resizer (originally from David Pritchard)
    base.resizable({
      handles: "e", // "east" (i.e., right)
      minWidth: 100, //otherwise looks really goofy
      resize: (event, ui) => {

        this.updateOutput(true);

        this.domRoot.find("#codeDisplayDiv").css("height", "auto"); // redetermine height if necessary
        this.navControls.renderSliderBreakpoints(this.sortedBreakpointsList); // update breakpoint display accordingly on resize
        if (this.params.updateOutputCallback) // report size change
          this.params.updateOutputCallback(this);
      }});

    this.outputBox = new ProgramOutputBox(this, this.domRoot.find('#vizLayoutTdSecond'),
                                          this.params.embeddedMode ? '45px' : null);
    this.dataViz = new DataVisualizer(this,
                                      this.domRoot.find('#vizLayoutTdSecond'),
                                      this.domRootD3.select('#vizLayoutTdSecond'));

    myViz.navControls.showError(this.instrLimitReachedWarningMsg);
    myViz.navControls.setupSlider(this.curTrace.length - 1);

    if (this.params.startingInstruction) {
      this.params.jumpToEnd = false; // override! make sure to handle FIRST

      // weird special case for something like:
      // e=raw_input(raw_input("Enter something:"))
      if (this.params.startingInstruction == this.curTrace.length) {
        this.params.startingInstruction--;
      }

      // fail-soft with out-of-bounds startingInstruction values:
      if (this.params.startingInstruction < 0) {
        this.params.startingInstruction = 0;
      }
      if (this.params.startingInstruction >= this.curTrace.length) {
        this.params.startingInstruction = this.curTrace.length - 1;
      }

      assert(0 <= this.params.startingInstruction &&
             this.params.startingInstruction < this.curTrace.length);
      this.curInstr = this.params.startingInstruction;
    }

    if (this.params.jumpToEnd) {
      var firstErrorStep = -1;
      for (var i = 0; i < this.curTrace.length; i++) {
        var e = this.curTrace[i];
        if (e.event == 'exception' || e.event == 'uncaught_exception') {
          firstErrorStep = i;
          break;
        }
      }

      // set to first error step if relevant since that's more informative
      // than simply jumping to the very end
      if (firstErrorStep >= 0) {
        this.curInstr = firstErrorStep;
      } else {
        this.curInstr = this.curTrace.length - 1;
      }
    }

    if (this.params.hideCode) {
      this.domRoot.find('#vizLayoutTdFirst').hide(); // gigantic hack!
    }

    this.dataViz.precomputeCurTraceLayouts();

    if (!this.params.hideCode) {
      this.codDisplay.renderPyCodeOutput();
    }

    this.updateOutput();
    this.hasRendered = true;
    this.try_hook("end_render", {myViz:this});
  }

  _getSortedBreakpointsList() {
    var ret = [];
    this.breakpoints.forEach(function(k, v) {
      ret.push(Number(k)); // these should be NUMBERS, not strings
    });
    ret.sort(function(x,y){return x-y}); // WTF, javascript sort is lexicographic by default!
    return ret;
  }

  addToBreakpoints(executionPoints) {
    $.each(executionPoints, (i, ep) => {
      this.breakpoints.set(ep, 1);
    });
    this.sortedBreakpointsList = this._getSortedBreakpointsList(); // keep synced!
  }

  removeFromBreakpoints(executionPoints) {
    $.each(executionPoints, (i, ep) => {
      this.breakpoints.remove(ep);
    });
    this.sortedBreakpointsList = this._getSortedBreakpointsList(); // keep synced!
  }

  setBreakpoint(d) {
    this.addToBreakpoints(d.executionPoints);
    this.navControls.renderSliderBreakpoints(this.sortedBreakpointsList);
  }

  unsetBreakpoint(d) {
    this.removeFromBreakpoints(d.executionPoints);
    this.navControls.renderSliderBreakpoints(this.sortedBreakpointsList);
  }

  // find the previous/next breakpoint to c or return -1 if it doesn't exist
  findPrevBreakpoint() {
    var c = this.curInstr;

    if (this.sortedBreakpointsList.length == 0) {
      return -1;
    }
    else {
      for (var i = 1; i < this.sortedBreakpointsList.length; i++) {
        var prev = this.sortedBreakpointsList[i-1];
        var cur = this.sortedBreakpointsList[i];
        if (c <= prev)
          return -1;
        if (cur >= c)
          return prev;
      }

      // final edge case:
      var lastElt = this.sortedBreakpointsList[this.sortedBreakpointsList.length - 1];
      return (lastElt < c) ? lastElt : -1;
    }
  }

  findNextBreakpoint() {
    var c = this.curInstr;

    if (this.sortedBreakpointsList.length == 0) {
      return -1;
    }
    // usability hack: if you're currently on a breakpoint, then
    // single-step forward to the next execution point, NOT the next
    // breakpoint. it's often useful to see what happens when the line
    // at a breakpoint executes.
    else if ($.inArray(c, this.sortedBreakpointsList) >= 0) {
      return c + 1;
    }
    else {
      for (var i = 0; i < this.sortedBreakpointsList.length - 1; i++) {
        var cur = this.sortedBreakpointsList[i];
        var next = this.sortedBreakpointsList[i+1];
        if (c < cur)
          return cur;
        if (cur <= c && c < next) // subtle
          return next;
      }

      // final edge case:
      var lastElt = this.sortedBreakpointsList[this.sortedBreakpointsList.length - 1];
      return (lastElt > c) ? lastElt : -1;
    }
  }

  // returns true if action successfully taken
  stepForward() {
    var myViz = this;

    if (myViz.curInstr < myViz.curTrace.length - 1) {
      // if there is a next breakpoint, then jump to it ...
      if (myViz.sortedBreakpointsList.length > 0) {
        var nextBreakpoint = myViz.findNextBreakpoint();
        if (nextBreakpoint != -1)
          myViz.curInstr = nextBreakpoint;
        else
          myViz.curInstr += 1; // prevent "getting stuck" on a solitary breakpoint
      }
      else {
        myViz.curInstr += 1;
      }
      myViz.updateOutput(true);
      return true;
    }

    return false;
  }

  // returns true if action successfully taken
  stepBack() {
    var myViz = this;

    if (myViz.curInstr > 0) {
      // if there is a prev breakpoint, then jump to it ...
      if (myViz.sortedBreakpointsList.length > 0) {
        var prevBreakpoint = myViz.findPrevBreakpoint();
        if (prevBreakpoint != -1)
          myViz.curInstr = prevBreakpoint;
        else
          myViz.curInstr -= 1; // prevent "getting stuck" on a solitary breakpoint
      }
      else {
        myViz.curInstr -= 1;
      }
      myViz.updateOutput();
      return true;
    }

    return false;
  }

  // This function is called every time the display needs to be updated
  updateOutput(smoothTransition=false) {
    if (this.params.hideCode) {
      this.updateOutputMini();
    }
    else {
      this.updateOutputFull(smoothTransition);
    }
    this.outputBox.renderOutput(this.curTrace[this.curInstr].stdout);
    this.try_hook("end_updateOutput", {myViz:this});
  }

  // does a LOT of stuff, called by updateOutput
  updateOutputFull(smoothTransition) {
    assert(this.curTrace);
    assert(!this.params.hideCode);

    var myViz = this; // to prevent confusion of 'this' inside of nested functions

    // there's no point in re-rendering if this pane isn't even visible in the first place!
    if (!myViz.domRoot.is(':visible')) {
      return;
    }

    myViz.updateLineAndExceptionInfo(); // very important to call this before rendering code (argh order dependency)

    var prevDataVizHeight = myViz.dataViz.height();

    this.codDisplay.updateCodOutput(smoothTransition);

    // call the callback if necessary (BEFORE rendering)
    if (this.params.updateOutputCallback) {
      this.params.updateOutputCallback(this);
    }

    var totalInstrs = this.curTrace.length;
    var isFirstInstr = (this.curInstr == 0);
    var isLastInstr = (this.curInstr == (totalInstrs-1));
    var msg = "Step " + String(this.curInstr + 1) + " of " + String(totalInstrs-1);
    if (isLastInstr) {
      if (this.promptForUserInput || this.promptForMouseInput) {
        msg = '<b><font color="' + brightRed + '">Enter user input below:</font></b>';
      } else if (this.instrLimitReached) {
        msg = "Instruction limit reached";
      } else {
        msg = "Program terminated";
      }
    }

    this.navControls.setVcrControls(msg, isFirstInstr, isLastInstr);
    this.navControls.setSliderVal(this.curInstr);

    // render error (if applicable):
    if (myViz.curLineExceptionMsg) {
      if (myViz.curLineExceptionMsg === "Unknown error") {
        myViz.navControls.showError('Unknown error: Please email a bug report to philip@pgbovine.net');
      } else {
        myViz.navControls.showError(myViz.curLineExceptionMsg);
      }
    } else if (!this.instrLimitReached) { // ugly, I know :/
      myViz.navControls.showError(null);
    }

    // finally, render all of the data structures
    this.dataViz.renderDataStructures(this.curInstr);

    // call the callback if necessary (AFTER rendering)
    if (myViz.dataViz.height() != prevDataVizHeight) {
      if (this.params.heightChangeCallback) {
        this.params.heightChangeCallback(this);
      }
    }

    if (isLastInstr &&
        myViz.params.executeCodeWithRawInputFunc &&
        myViz.promptForUserInput) {
      this.navControls.showUserInputDiv();
    } else {
      this.navControls.hideUserInputDiv();
    }
  } // end of updateOutputFull

  updateOutputMini() {
    assert(this.params.hideCode);
    this.dataViz.renderDataStructures(this.curInstr);
  }

  renderStep(step) {
    assert(0 <= step);
    assert(step < this.curTrace.length);

    // ignore redundant calls
    if (this.curInstr == step) {
      return;
    }

    this.curInstr = step;
    this.updateOutput();
  }

  redrawConnectors() {
    this.dataViz.redrawConnectors();
  }

  // All of the Java frontend code in this function was written by David
  // Pritchard and Will Gwozdz, and integrated into pytutor.js by Philip Guo
  activateJavaFrontend() {
    var prevLine = null;
    this.curTrace.forEach((e, i) => {
      // ugh the Java backend doesn't attach line numbers to exception
      // events, so just take the previous line number as our best guess
      if (e.event === 'exception' && !e.line) {
        e.line = prevLine;
      }

      // super hack by Philip that reverses the direction of the stack so
      // that it grows DOWN and renders the same way as the Python and JS
      // visualizer stacks
      if (e.stack_to_render !== undefined) {
        e.stack_to_render.reverse();
      }

      prevLine = e.line;
    });

    this.add_pytutor_hook(
      "renderPrimitiveObject",
      function(args) {
        var obj = args.obj, d3DomElement = args.d3DomElement;
        var typ = typeof obj;
        if (obj instanceof Array && obj[0] == "VOID") {
          d3DomElement.append('<span class="voidObj">void</span>');
        }
        else if (obj instanceof Array && obj[0] == "NUMBER-LITERAL") {
          // actually transmitted as a string
          d3DomElement.append('<span class="numberObj">' + obj[1] + '</span>');
        }
        else if (obj instanceof Array && obj[0] == "CHAR-LITERAL") {
          var asc = obj[1].charCodeAt(0);
          var ch = obj[1];

          // default
          var show = asc.toString(16);
          while (show.length < 4) show = "0" + show;
          show = "\\u" + show;

          if (ch == "\n") show = "\\n";
          else if (ch == "\r") show = "\\r";
          else if (ch == "\t") show = "\\t";
          else if (ch == "\b") show = "\\b";
          else if (ch == "\f") show = "\\f";
          else if (ch == "\'") show = "\\\'";
          else if (ch == "\"") show = "\\\"";
          else if (ch == "\\") show = "\\\\";
          else if (asc >= 32) show = ch;

          // stringObj to make monospace
          d3DomElement.append('<span class="stringObj">\'' + show + '\'</span>');
        }
        else
          return [false]; // we didn't handle it
        return [true]; // we handled it
      });

    this.add_pytutor_hook(
      "isPrimitiveType",
      function(args) {
        var obj = args.obj;
        if ((obj instanceof Array && obj[0] == "VOID")
            || (obj instanceof Array && obj[0] == "NUMBER-LITERAL")
            || (obj instanceof Array && obj[0] == "CHAR-LITERAL")
            || (obj instanceof Array && obj[0] == "ELIDE"))
          return [true, true]; // we handled it, it's primitive
        return [false]; // didn't handle it
      });

    this.add_pytutor_hook(
      "end_updateOutput",
      function(args) {
        var myViz = args.myViz;
        var curEntry = myViz.curTrace[myViz.curInstr];
        if (myViz.params.stdin && myViz.params.stdin != "") {
          var stdinPosition = curEntry.stdinPosition || 0;
          var stdinContent =
            '<span style="color:lightgray;text-decoration: line-through">'+
            escapeHtml(myViz.params.stdin.substr(0, stdinPosition))+
            '</span>'+
            escapeHtml(myViz.params.stdin.substr(stdinPosition));
          myViz.domRoot.find('#stdinShow').html(stdinContent);
        }
        return [false];
      });

    this.add_pytutor_hook(
      "end_render",
      function(args) {
        var myViz = args.myViz;

        if (myViz.params.stdin && myViz.params.stdin != "") {
          var stdinHTML = '<div id="stdinWrap">stdin:<pre id="stdinShow" style="border:1px solid gray"></pre></div>';
          myViz.domRoot.find('#dataViz').append(stdinHTML); // TODO: leaky abstraction with #dataViz
        }

        myViz.domRoot.find('#'+myViz.generateID('globals_header')).html("Static fields");
      });

    this.add_pytutor_hook(
      "isLinearObject",
      function(args) {
        var heapObj = args.heapObj;
        if (heapObj[0]=='STACK' || heapObj[0]=='QUEUE')
          return ['true', 'true'];
        return ['false'];
      });

    this.add_pytutor_hook(
      "renderCompoundObject",
      function(args) {
        var objID = args.objID;
        var d3DomElement = args.d3DomElement;
        var obj = args.obj;
        var typeLabelPrefix = args.typeLabelPrefix;
        var myViz = args.myViz;
        var stepNum = args.stepNum;

        if (!(obj[0] == 'LIST' || obj[0] == 'QUEUE' || obj[0] == 'STACK'))
          return [false]; // didn't handle

        var label = obj[0].toLowerCase();
        var visibleLabel = {list:'array', queue:'queue', stack:'stack'}[label];

        if (obj.length == 1) {
          d3DomElement.append('<div class="typeLabel">' + typeLabelPrefix + 'empty ' + visibleLabel + '</div>');
          return [true]; //handled
        }

        d3DomElement.append('<div class="typeLabel">' + typeLabelPrefix + visibleLabel + '</div>');
        d3DomElement.append('<table class="' + label + 'Tbl"></table>');
        var tbl = d3DomElement.children('table');

        if (obj[0] == 'LIST') {
          tbl.append('<tr></tr><tr></tr>');
          var headerTr = tbl.find('tr:first');
          var contentTr = tbl.find('tr:last');

          // i: actual index in json object; ind: apparent index
          for (var i=1, ind=0; i<obj.length; i++) {
            var val = obj[i];
            var elide = val instanceof Array && val[0] == 'ELIDE';

            // add a new column and then pass in that newly-added column
            // as d3DomElement to the recursive call to child:
            headerTr.append('<td class="' + label + 'Header"></td>');
            headerTr.find('td:last').append(elide ? "&hellip;" : ind);

            contentTr.append('<td class="'+ label + 'Elt"></td>');
            if (!elide) {
              myViz.renderNestedObject(val, stepNum, contentTr.find('td:last'));
              ind++;
            }
            else {
              contentTr.find('td:last').append("&hellip;");
              ind += val[1]; // val[1] is the number of cells to skip
            }
          }
        } // end of LIST handling

       // Stack and Queue handling code by Will Gwozdz
        /* The table produced for stacks and queues is formed slightly differently than the others,
       missing the header row. Two rows made the dashed border not line up properly */
        if (obj[0] == 'STACK') {
          tbl.append('<tr></tr><tr></tr>');
          var contentTr = tbl.find('tr:last');
          contentTr.append('<td class="'+ label + 'FElt">'+'<span class="stringObj symbolic">&#8596;</span>'+'</td>');
          $.each(obj, function(ind, val) {
            if (ind < 1) return; // skip type tag and ID entry
            contentTr.append('<td class="'+ label + 'Elt"></td>');
            myViz.renderNestedObject(val, stepNum, contentTr.find('td:last'));
          });
          contentTr.append('<td class="'+ label + 'LElt">'+'</td>');
        }

        if (obj[0] == 'QUEUE') {
          tbl.append('<tr></tr><tr></tr>');
          var contentTr = tbl.find('tr:last');
          // Add arrows showing in/out direction
          contentTr.append('<td class="'+ label + 'FElt">'+'<span class="stringObj symbolic">&#8592;</span></td>');
          $.each(obj, function(ind, val) {
            if (ind < 1) return; // skip type tag and ID entry
            contentTr.append('<td class="'+ label + 'Elt"></td>');
            myViz.renderNestedObject(val, stepNum, contentTr.find('td:last'));
          });
          contentTr.append('<td class="'+ label + 'LElt">'+'<span class="stringObj symbolic">&#8592;</span></td>');
        }

        return [true]; // did handle
      });

    this.add_pytutor_hook(
      "end_renderDataStructures",
      function(args) {
        var myViz = args.myViz;
        myViz.domRoot.find("td.instKey:contains('___NO_LABEL!___')").hide();
        myViz.domRoot.find(".typeLabel:contains('dict')").each(
          function(i) {
            if ($(this).html()=='dict')
              $(this).html('symbol table');
            if ($(this).html()=='empty dict')
              $(this).html('empty symbol table');
          });
      });

    // java synthetics cause things which javascript doesn't like in an id

    // VERY important to bind(this) so that when it's called, 'this' is this current object
    var old_generateID = ExecutionVisualizer.prototype.generateID.bind(this);
    this.generateID = function(original_id) {
      var sanitized = original_id.replace(
          /[^0-9a-zA-Z_]/g,
        function(match) {return '-'+match.charCodeAt(0)+'-';}
      );
      return old_generateID(sanitized);
    }

    // utility functions
    var entityMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': '&quot;',
      "'": '&#39;',
      "/": '&#x2F;'
    };

    var escapeHtml = function(string) {
      return String(string).replace(/[&<>"'\/]/g, function (s) {
          return entityMap[s];
        });
    };
  }

  // update fields corresponding to the current and previously executed lines
  // in the trace so that they can be properly highlighted; must call before
  // rendering code output (NB: argh pesky ordering dependency)
  updateLineAndExceptionInfo() {
    var myViz = this;
    var totalInstrs = myViz.curTrace.length;
    var isLastInstr = myViz.curInstr === (totalInstrs-1);

    myViz.curLineNumber = undefined;
    myViz.prevLineNumber = undefined;
    myViz.curLineIsReturn = undefined;
    myViz.prevLineIsReturn = undefined;
    myViz.curLineExceptionMsg = undefined;

    /* if instrLimitReached, then treat like a normal non-terminating line */
    var isTerminated = (!myViz.instrLimitReached && isLastInstr);

    var curLineNumber = null;
    var prevLineNumber = null;

    var curEntry = myViz.curTrace[myViz.curInstr];

    var curIsReturn = (curEntry.event == 'return');
    var prevIsReturn = false;

    if (myViz.curInstr > 0) {
      prevLineNumber = myViz.curTrace[myViz.curInstr - 1].line;
      prevIsReturn = (myViz.curTrace[myViz.curInstr - 1].event == 'return');

      /* kinda nutsy hack: if the previous line is a return line, don't
         highlight it. instead, highlight the line in the enclosing
         function that called this one (i.e., the call site). e.g.,:

         1. def foo(lst):
         2.   return len(lst)
         3.
         4. y = foo([1,2,3])
         5. print y

         If prevLineNumber is 2 and prevIsReturn, then curLineNumber is
         5, since that's the line that executes right after line 2
         finishes. However, this looks confusing to the user since what
         actually happened here was that the return value of foo was
         assigned to y on line 4. I want to have prevLineNumber be line
         4 so that it gets highlighted. There's no ideal solution, but I
         think that looks more sensible, since line 4 was the previous
         line that executed *in this function's frame*.
      */
      if (prevIsReturn) {
        var idx = myViz.curInstr - 1;
        var retStack = myViz.curTrace[idx].stack_to_render;
        assert(retStack.length > 0);
        var retFrameId = retStack[retStack.length - 1].frame_id;

        // now go backwards until we find a 'call' to this frame
        while (idx >= 0) {
          var entry = myViz.curTrace[idx];
          if (entry.event == 'call' && entry.stack_to_render) {
            var topFrame = entry.stack_to_render[entry.stack_to_render.length - 1];
            if (topFrame.frame_id == retFrameId) {
              break; // DONE, we found the call that corresponds to this return
            }
          }
          idx--;
        }

        // now idx is the index of the 'call' entry. we need to find the
        // entry before that, which is the instruction before the call.
        // THAT's the line of the call site.
        if (idx > 0) {
          var callingEntry = myViz.curTrace[idx - 1];
          prevLineNumber = callingEntry.line; // WOOHOO!!!
          prevIsReturn = false; // this is now a call site, not a return
        }
      }
    }

    var hasError = false;
    if (curEntry.event === 'exception' || curEntry.event === 'uncaught_exception') {
      assert(curEntry.exception_msg);
      hasError = true;
      myViz.curLineExceptionMsg = curEntry.exception_msg;
    }

    curLineNumber = curEntry.line;

    // edge case for the final instruction :0
    if (isTerminated && !hasError) {
      // don't show redundant arrows on the same line when terminated ...
      if (prevLineNumber == curLineNumber) {
        curLineNumber = null;
      }
    }

    // add these fields to myViz, which is the point of this function!
    myViz.curLineNumber = curLineNumber;
    myViz.prevLineNumber = prevLineNumber;
    myViz.curLineIsReturn = curIsReturn;
    myViz.prevLineIsReturn = prevIsReturn;
  }

  isOutputLineVisibleForBubbles(lineDivID) {
    var pcod = this.domRoot.find('#pyCodeOutputDiv');

    var lineNoTd = $('#' + lineDivID);
    var LO = lineNoTd.offset().top;

    var PO = pcod.offset().top;
    var ST = pcod.scrollTop();
    var H = pcod.height();

    // add a few pixels of fudge factor on the bottom end due to bottom scrollbar
    return (PO <= LO) && (LO < (PO + H - 25));
  }

} // END class ExecutionVisualizer


function assert(cond) {
  if (!cond) {
    console.trace();
    alert("Assertion Failure (see console log for backtrace)");
    throw 'Assertion Failure';
  }
}

// taken from http://www.toao.net/32-my-htmlspecialchars-function-for-javascript
function htmlspecialchars(str) {
  if (typeof(str) == "string") {
    str = str.replace(/&/g, "&amp;"); /* must do &amp; first */

    // ignore these for now ...
    //str = str.replace(/"/g, "&quot;");
    //str = str.replace(/'/g, "&#039;");

    str = str.replace(/</g, "&lt;");
    str = str.replace(/>/g, "&gt;");

    // replace spaces:
    str = str.replace(/ /g, "&nbsp;");

    // replace tab as four spaces:
    str = str.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
  }
  return str;
}


// same as htmlspecialchars except don't worry about expanding spaces or
// tabs since we want proper word wrapping in divs.
function htmlsanitize(str) {
  if (typeof(str) == "string") {
    str = str.replace(/&/g, "&amp;"); /* must do &amp; first */

    str = str.replace(/</g, "&lt;");
    str = str.replace(/>/g, "&gt;");
  }
  return str;
}



// make sure varname doesn't contain any weird
// characters that are illegal for CSS ID's ...
//
// I know for a fact that iterator tmp variables named '_[1]'
// are NOT legal names for CSS ID's.
// I also threw in '{', '}', '(', ')', '<', '>' as illegal characters.
//
// also some variable names are like '.0' (for generator expressions),
// and '.' seems to be illegal.
//
// also '=', '!', and '?' are common in Ruby names, so escape those as well
//
// also spaces are illegal, so convert to '_'
// TODO: what other characters are illegal???

function isHeapRef(obj, heap) {
  // ordinary REF
  if (obj[0] === 'REF') {
    return (heap[obj[1]] !== undefined);
  } else if (obj[0] === 'C_DATA' && obj[2] === 'pointer') {
    // C-style pointer that has a valid value
    if (obj[3] != '<UNINITIALIZED>' && obj[3] != '<UNALLOCATED>') {
      return (heap[obj[3]] !== undefined);
    }
  }

  return false;
}


export default ExecutionVisualizer




  // Constructor with an ever-growing feature-crepped list of options :)
  // domRootID is the string ID of the root element where to render this instance
  //
  // dat is data returned by the Python Tutor backend consisting of two fields:
  //   code  - string of executed code
  //   trace - a full execution trace
  //
  // params is an object containing optional parameters, such as:
  //   jumpToEnd - if non-null, jump to the very end of execution if
  //               there's no error, or if there's an error, jump to the
  //               FIRST ENTRY with an error
  //   startingInstruction - the (zero-indexed) execution point to display upon rendering
  //                         if this is set, then it *overrides* jumpToEnd
  //   codeDivHeight - maximum height of #pyCodeOutputDiv (in integer pixels)
  //   codeDivWidth  - maximum width  of #pyCodeOutputDiv (in integer pixels)
  //   editCodeBaseURL - the base URL to visit when the user clicks 'Edit code' (if null, then 'Edit code' link hidden)
  //   embeddedMode         - shortcut for codeDivWidth=DEFAULT_EMBEDDED_CODE_DIV_WIDTH,
  //                                       codeDivHeight=DEFAULT_EMBEDDED_CODE_DIV_HEIGHT
  //                          (and hide a bunch of other stuff & don't activate keyboard shortcuts!)
  //   disableHeapNesting   - if true, then render all heap objects at the top level (i.e., no nested objects)
  //   drawParentPointers   - if true, then draw environment diagram parent pointers for all frames
  //                          WARNING: there are hard-to-debug MEMORY LEAKS associated with activating this option
  //   textualMemoryLabels  - render references using textual memory labels rather than as jsPlumb arrows.
  //                          this is good for slow browsers or when used with disableHeapNesting
  //                          to prevent "arrow overload"
  //   updateOutputCallback - function to call (with 'this' as parameter)
  //                          whenever this.updateOutput() is called
  //                          (BEFORE rendering the output display)
  //   heightChangeCallback - function to call (with 'this' as parameter)
  //                          whenever the HEIGHT of #dataViz changes
  //   verticalStack - if true, then stack code display ON TOP of visualization
  //                   (else place side-by-side)
  //   visualizerIdOverride - override visualizer ID instead of auto-assigning it
  //                          (BE CAREFUL ABOUT NOT HAVING DUPLICATE IDs ON THE SAME PAGE,
  //                           OR ELSE ARROWS AND OTHER STUFF WILL GO HAYWIRE!)
  //   executeCodeWithRawInputFunc - function to call when you want to re-execute the given program
  //                                 with some new user input (somewhat hacky!)
  //   compactFuncLabels - render functions with a 'func' prefix and no type label
  //   showAllFrameLabels - display frame and parent frame labels for all functions (default: false)
  //   hideCode - hide the code display and show only the data structure viz
  //   lang - to render labels in a style appropriate for other languages,
  //          and to display the proper language in langDisplayDiv:
  //          'py2' for Python 2, 'py3' for Python 3, 'js' for JavaScript, 'java' for Java,
  //          'ts' for TypeScript, 'ruby' for Ruby, 'c' for C, 'cpp' for C++
  //          [default is Python-style labels]



  /*
  params: any = {};
  curInputCode: string;
  curTrace: any[];

  // an array of objects with the following fields:
  //   'text' - the text of the line of code
  //   'lineNumber' - one-indexed (always the array index + 1)
  //   'executionPoints' - an ordered array of zero-indexed execution points where this line was executed
  //   'breakpointHere' - has a breakpoint been set here?
  codeOutputLines: {text: string, lineNumber: number, executionPoints: number[], breakpointHere: boolean}[] = [];

  promptForUserInput: boolean;
  userInputPromptStr: string;
  promptForMouseInput: boolean;

  codDisplay: CodeDisplay;
  navControls: NavigationController;
  outputBox: ProgramOutputBox;
  dataViz: DataVisualizer;

  domRoot: any;
  domRootD3: any;

  curInstr: number = 0;

  updateHistory: any[];
  creationTime: number;

  // API for adding a hook, created by David Pritchard
  // keys, hook names; values, list of functions
  pytutor_hooks: {string?: any[]} = {};

  // represent the current state of the visualizer object; i.e., which
  // step is it currently visualizing?
  prevLineIsReturn: boolean;
  curLineIsReturn: boolean;
  prevLineNumber: number;
  curLineNumber: number;
  curLineExceptionMsg: string;

  // true iff trace ended prematurely since maximum instruction limit has
  // been reached
  instrLimitReached: boolean = false;
  instrLimitReachedWarningMsg: string;

  hasRendered: boolean = false;

  visualizerID: number;

  breakpoints: d3.Map<{}> = d3.map(); // set of execution points to set as breakpoints
  sortedBreakpointsList: any[] = [];  // sorted and synced with breakpoints
  */
