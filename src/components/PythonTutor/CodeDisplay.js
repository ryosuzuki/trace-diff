
const SVG_ARROW_POLYGON = '0,3 12,3 12,0 18,5 12,10 12,7 0,7';
const SVG_ARROW_HEIGHT = 10; // must match height of SVG_ARROW_POLYGON


var brightRed = '#e93f34';
var darkArrowColor = brightRed;
var lightArrowColor = '#c9e6ca';
// Unicode arrow types: '\u21d2', '\u21f0', '\u2907'

var heapPtrSrcRE = /__heap_pointer_src_/;
var rightwardNudgeHack = true; // suggested by John DeNero, toggle with global


class CodeDisplay {

  constructor(owner, domRoot, domRootD3,
              codToDisplay: string, lang: string, editCodeBaseURL: string) {

    this.leftGutterSvgInitialized = false;

    this.owner = owner;
    this.domRoot = domRoot;
    this.domRootD3 = domRootD3;
    this.codToDisplay = codToDisplay;

    /*
    var codeDisplayHTML =
      '<div id="codeDisplayDiv">\
         <div id="langDisplayDiv"></div>\
         <div id="pyCodeOutputDiv"/>\
         <div id="editCodeLinkDiv"><a id="editBtn">Edit code</a>\
         <span id="liveModeSpan" style="display: none;">| <a id="editLiveModeBtn" href="#">Live programming</a></a>\
         </div>\
         <div id="legendDiv"/>\
         <div id="codeFooterDocs">Click a line of code to set a breakpoint; use the Back and Forward buttons to jump there.</div>\
       </div>';
    */

    var codeDisplayHTML =
      '<div id="codeDisplayDiv">\
         <div id="langDisplayDiv"></div>\
         <div id="pyCodeOutputDiv"/></div>\
         <div id="legendDiv"/>\
       </div>';

    this.domRoot.append(codeDisplayHTML);
    if (this.owner.params.embeddedMode) {
      this.domRoot.find('#editCodeLinkDiv').css('font-size', '10pt');
    }
    this.domRoot.find('#legendDiv')
        .append('<svg id="prevLegendArrowSVG"/> line that has just executed')
        .append('<p style="margin-top: 4px"><svg id="curLegendArrowSVG"/> next line to execute</p>');
    this.domRootD3.select('svg#prevLegendArrowSVG')
        .append('polygon')
        .attr('points', SVG_ARROW_POLYGON)
        .attr('fill', lightArrowColor);
    this.domRootD3.select('svg#curLegendArrowSVG')
        .append('polygon')
        .attr('points', SVG_ARROW_POLYGON)
        .attr('fill', darkArrowColor);

    if (editCodeBaseURL) {
      // kinda kludgy
      var pyVer = '2'; // default
      if (lang === 'js') {
        pyVer = 'js';
      } else if (lang === 'ts') {
        pyVer = 'ts';
      } else if (lang === 'java') {
        pyVer = 'java';
      } else if (lang === 'py3') {
        pyVer = '3';
      } else if (lang === 'c') {
        pyVer = 'c';
      } else if (lang === 'cpp') {
        pyVer = 'cpp';
      }

      var urlStr = ''
      // $.param.fragment(editCodeBaseURL,
      //                               {code: this.codToDisplay, py: pyVer},
      //                               2);
      this.domRoot.find('#editBtn').attr('href', urlStr);
    }
    else {
      this.domRoot.find('#editCodeLinkDiv').hide(); // just hide for simplicity!
      this.domRoot.find('#editBtn').attr('href', "#");
      this.domRoot.find('#editBtn').click(function(){return false;}); // DISABLE the link!
    }

    if (lang !== undefined) {
      if (lang === 'js') {
        this.domRoot.find('#langDisplayDiv').html('JavaScript');
      } else if (lang === 'ts') {
        this.domRoot.find('#langDisplayDiv').html('TypeScript');
      } else if (lang === 'ruby') {
        this.domRoot.find('#langDisplayDiv').html('Ruby');
      } else if (lang === 'java') {
        this.domRoot.find('#langDisplayDiv').html('Java');
      } else if (lang === 'py2') {
        this.domRoot.find('#langDisplayDiv').html('Python 2.7');
      } else if (lang === 'py3') {
        this.domRoot.find('#langDisplayDiv').html('Python 3.6');
      } else if (lang === 'c') {
        if (this.owner.params.embeddedMode) {
          this.domRoot.find('#langDisplayDiv').html('C (gcc 4.8, C11)');
        } else {
          this.domRoot.find('#langDisplayDiv').html('C (gcc 4.8, C11) <font color="#e93f34">EXPERIMENTAL!</font><br/>see <a href="https://github.com/pgbovine/opt-cpp-backend/issues" target="_blank">known bugs</a> and report to philip@pgbovine.net');
        }
      } else if (lang === 'cpp') {
        if (this.owner.params.embeddedMode) {
          this.domRoot.find('#langDisplayDiv').html('C++ (gcc 4.8, C++11)');
        } else {
          this.domRoot.find('#langDisplayDiv').html('C++ (gcc 4.8, C++11) <font color="#e93f34">EXPERIMENTAL!</font><br/>see <a href="https://github.com/pgbovine/opt-cpp-backend/issues" target="_blank">known bugs</a> and report to philip@pgbovine.net');
        }
      } else {
        this.domRoot.find('#langDisplayDiv').hide();
      }
    }

  }

  renderPyCodeOutput() {
    var myCodOutput = this; // capture
    this.domRoot.find('#pyCodeOutputDiv').empty();

    var target = document.getElementById('pyCodeOutputDiv')
    var myCodeMirror = CodeMirror(target, {
      value: this.owner.props.beforeCode,
      mode:  'python',
      theme: 'base16-light',
      lineNumbers: true,
    });

    this.owner.cm = myCodeMirror

    // create a left-most gutter td that spans ALL rows ...
    // (NB: valign="top" is CRUCIAL for this to work in IE)
    this.domRoot.find('#pyCodeOutputDiv .CodeMirror-gutters')
        .prepend('<div id="gutterTD" valign="top" rowspan="' + this.owner.codeOutputLines.length + '"><svg id="leftCodeGutterSVG"/></div>');

    // create prevLineArrow and curLineArrow
    this.domRootD3.select('svg#leftCodeGutterSVG')
        .append('polygon')
        .attr('id', 'prevLineArrow')
        .attr('points', SVG_ARROW_POLYGON)
        .attr('fill', lightArrowColor);

    this.domRootD3.select('svg#leftCodeGutterSVG')
        .append('polygon')
        .attr('id', 'curLineArrow')
        .attr('points', SVG_ARROW_POLYGON)
        .attr('fill', darkArrowColor);

    /*
    // maps codeOutputLines down both table columns
    // TODO: get rid of pesky owner dependency
    var codeOutputD3 = this.domRootD3.select('#pyCodeOutputDiv')
      .append('table')
      .attr('id', 'pyCodeOutput')
      .selectAll('tr')
      .data(this.owner.codeOutputLines)
      .enter().append('tr')
      .selectAll('td')
      .data(function(d, i){return [d, d] ;})
      .enter().append('td')
      .attr('class', function(d, i) {
        // add the togetherjsCloneClick class on here so that we can
        // sync clicks via TogetherJS for setting breakpoints in shared
        // sessions (kinda leaky abstraction since pytutor.ts shouldn't
        // need to know about TogetherJS, but oh wells)
        if (i == 0) {
          return 'lineNo togetherjsCloneClick';
        }
        else {
          return 'cod togetherjsCloneClick';
        }
      })
      .attr('id', (d, i) => {
        if (i == 0) {
          return 'lineNo' + d.lineNumber;
        }
        else {
          return this.owner.generateID('cod' + d.lineNumber); // make globally unique (within the page)
        }
      })
      .html(function(d, i) {
        if (i == 0) {
          return d.lineNumber;
        }
        else {
          return htmlspecialchars(d.text);
        }
      });

    // 2012-09-05: Disable breakpoints for now to simplify UX
    // 2016-05-01: Revive breakpoint functionality
    codeOutputD3
      .style('cursor', function(d, i) {
        // don't do anything if exePts empty (i.e., this line was never executed)
        var exePts = d.executionPoints;
        if (!exePts || exePts.length == 0) {
          return;
        } else {
          return 'pointer'
        }
      })
      .on('click', function(d, i) {
        // don't do anything if exePts empty (i.e., this line was never executed)
        var exePts = d.executionPoints;
        if (!exePts || exePts.length == 0) {
          return;
        }

        d.breakpointHere = !d.breakpointHere; // toggle
        if (d.breakpointHere) {
          myCodOutput.owner.setBreakpoint(d);
          d3.select(this.parentNode).select('td.lineNo').style('color', breakpointColor);
          d3.select(this.parentNode).select('td.lineNo').style('font-weight', 'bold');
          d3.select(this.parentNode).select('td.cod').style('color', breakpointColor);
        }
        else {
          myCodOutput.owner.unsetBreakpoint(d);
          d3.select(this.parentNode).select('td.lineNo').style('color', '');
          d3.select(this.parentNode).select('td.lineNo').style('font-weight', '');
          d3.select(this.parentNode).select('td.cod').style('color', '');
        }
      });
    */

  }

  updateCodOutput(smoothTransition=false) {

    var gutterTD = this.domRoot.find('#gutterTD')
    var gutterSVG = this.domRoot.find('svg#leftCodeGutterSVG');

    const outerHeight = this.domRoot.find('.CodeMirror-lines').height()
    gutterTD.height(outerHeight);
    gutterSVG.height(outerHeight);


    // one-time initialization of the left gutter
    // (we often can't do this earlier since the entire pane
    //  might be invisible and hence returns a height of zero or NaN
    //  -- the exact format depends on browser)
    if (!this.leftGutterSvgInitialized) {
      // set the gutter's height to match that of its parent

      // gutterTD.height(gutterTD.parent().height());
      // gutterSVG.height(gutterSVG.parent().height());

      var firstRowOffsetY = this.domRoot.find('#pyCodeOutputDiv .CodeMirror-gutters').offset().top;

      // first take care of edge case when there's only one line ...
      this.codeRowHeight = this.domRoot.find('#pyCodeOutputDiv .CodeMirror-line:first').height();

      // ... then handle the (much more common) multi-line case ...
      // this weird contortion is necessary to get the accurate row height on Internet Explorer
      // (simpler methods work on all other major browsers, erghhhhhh!!!)

      /*
      if (this.owner.codeOutputLines.length > 1) {
        var secondRowOffsetY = this.domRoot.find('#pyCodeOutputDiv .CodeMirror-line:nth-child(2)').offset().top;
        this.codeRowHeight = secondRowOffsetY - firstRowOffsetY;
      }
      */

      // assert(this.codeRowHeight > 0);

      var gutterOffsetY = gutterSVG.offset().top;
      var teenyAdjustment = gutterOffsetY - firstRowOffsetY;

      teenyAdjustment = -4

      // super-picky detail to adjust the vertical alignment of arrows so that they line up
      // well with the pointed-to code text ...
      // (if you want to manually adjust tableTop, then ~5 is a reasonable number)
      this.arrowOffsetY = Math.floor((this.codeRowHeight / 2) - (SVG_ARROW_HEIGHT / 2)) - teenyAdjustment;

      this.leftGutterSvgInitialized = true;
    }

    // assert(this.arrowOffsetY !== undefined);
    // assert(this.codeRowHeight !== undefined);
    // assert(0 <= this.arrowOffsetY && this.arrowOffsetY <= this.codeRowHeight);

    // assumes that this.owner.updateLineAndExceptionInfo has already
    // been run, so line number info is up-to-date!

    // TODO: get rid of this pesky 'owner' dependency
    var myViz = this.owner;
    var isLastInstr = (myViz.curInstr === (myViz.curTrace.length-1));
    var curEntry = myViz.curTrace[myViz.curInstr];
    var hasError = (curEntry.event === 'exception' || curEntry.event === 'uncaught_exception');
    var isTerminated = (!myViz.instrLimitReached && isLastInstr);
    var pcod = this.domRoot.find('#pyCodeOutputDiv');

    var prevVerticalNudge = myViz.prevLineIsReturn ? Math.floor(this.codeRowHeight / 3) : 0;
    var curVerticalNudge  = myViz.curLineIsReturn  ? Math.floor(this.codeRowHeight / 3) : 0;

    // ugly edge case for the final instruction :0
    if (isTerminated && !hasError) {
      if (myViz.prevLineNumber !== myViz.curLineNumber) {
        curVerticalNudge = curVerticalNudge - 2;
      }
    }

    if (myViz.prevLineNumber) {
      var pla = this.domRootD3.select('#prevLineArrow');
      var translatePrevCmd = 'translate(0, ' + (((myViz.prevLineNumber - 1) * this.codeRowHeight) + this.arrowOffsetY + prevVerticalNudge) + ')';
      if (smoothTransition) {
        pla
          .transition()
          .duration(200)
          .attr('fill', 'white')
          .each('end', function() {
                pla
                  .attr('transform', translatePrevCmd)
                  .attr('fill', lightArrowColor);
                gutterSVG.find('#prevLineArrow').show(); // show at the end to avoid flickering
            });
      }
      else {
        pla.attr('transform', translatePrevCmd)
        gutterSVG.find('#prevLineArrow').show();
      }
    } else {
      gutterSVG.find('#prevLineArrow').hide();
    }

    if (myViz.curLineNumber) {
      var cla = this.domRootD3.select('#curLineArrow');
      var translateCurCmd = 'translate(0, ' + (((myViz.curLineNumber - 1) * this.codeRowHeight) + this.arrowOffsetY + curVerticalNudge) + ')';
      if (smoothTransition) {
        cla
          .transition()
          .delay(200)
          .duration(250)
          .attr('transform', translateCurCmd);
      } else {
        cla.attr('transform', translateCurCmd);
      }
      gutterSVG.find('#curLineArrow').show();
    }
    else {
      gutterSVG.find('#curLineArrow').hide();
    }

    this.domRootD3.selectAll('#pyCodeOutputDiv .CodeMirror-line ')
      .style('border-top', function(d) {
        if (hasError && (d.lineNumber == curEntry.line)) {
          return '1px solid ' + errorColor;
        }
        else {
          return '';
        }
      })
      .style('border-bottom', function(d) {
        // COPY AND PASTE ALERT!
        if (hasError && (d.lineNumber == curEntry.line)) {
          return '1px solid ' + errorColor;
        }
        else {
          return '';
        }
      });

    // returns True iff lineNo is visible in pyCodeOutputDiv
    var isOutputLineVisible = (lineNo) => {
      return true
      /*
      var lineNoTd = this.domRoot.find('#lineNo' + lineNo);
      var LO = lineNoTd.offset().top;

      var PO = pcod.offset().top;
      var ST = pcod.scrollTop();
      var H = pcod.height();

      // add a few pixels of fudge factor on the bottom end due to bottom scrollbar
      return (PO <= LO) && (LO < (PO + H - 30));
      */
    }

    // smoothly scroll pyCodeOutputDiv so that the given line is at the center
    var scrollCodeOutputToLine = (lineNo) => {
      var lineNoTd = this.domRoot.find('#lineNo' + lineNo);
      var LO = lineNoTd.offset().top;

      var PO = pcod.offset().top;
      var ST = pcod.scrollTop();
      var H = pcod.height();

      pcod.stop(); // first stop all previously-queued animations
      pcod.animate({scrollTop: (ST + (LO - PO - (Math.round(H / 2))))}, 300);
    }

    // smoothly scroll code display
    if (!isOutputLineVisible(curEntry.line)) {
      scrollCodeOutputToLine(curEntry.line);
    }
  }

} // END class CodeDisplay

export default CodeDisplay


function assert(cond) {
  if (!cond) {
    console.trace();
    alert("Assertion Failure (see console log for backtrace)");
    throw 'Assertion Failure';
  }
}

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
