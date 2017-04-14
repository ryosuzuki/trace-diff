
class ProgramOutputBox {

  constructor(owner, domRoot, heightOverride=null) {
    this.owner = owner;
    this.domRoot = domRoot;

    var outputsHTML =
      '<div id="progOutputs">\
         <div id="printOutputDocs">Print output (drag lower right corner to resize)</div>\n\
         <textarea id="pyStdout" cols="40" rows="5" wrap="off" readonly></textarea>\
       </div>';

    this.domRoot.append(outputsHTML);

    // go backwards from the end ... sometimes the final entry doesn't
    // have an stdout
    var lastStdout;
    for (var i = this.owner.curTrace.length-1; i >= 0; i--) {
      lastStdout = this.owner.curTrace[i].stdout;
      if (lastStdout) {
        break;
      }
    }

    if (lastStdout) {
      // this.numStdoutLines = lastStdout.rtrim().split('\n').length;
      this.numStdoutLines = lastStdout.replace(/\s*$/g, "").split('\n').length;
    }

    var stdoutHeight = '75px';
    // heuristic for code with really small outputs
    if (this.numStdoutLines <= 3) {
      stdoutHeight = (18 * this.numStdoutLines) + 'px';
    }
    if (heightOverride) {
      stdoutHeight = heightOverride;
    }
    // do this only after adding outputsHTML to the DOM
    this.domRoot.find('#pyStdout').width('450px')
                                  .height(stdoutHeight)
                                  .resizable();
  }

  renderOutput(stdoutStr: string) {
    if (!stdoutStr) {
      stdoutStr = '';
    }

    // if there isn't anything to display, don't even bother
    // displaying the pane (but this may cause jumpiness later)
    if (this.numStdoutLines > 0) {
      this.domRoot.find('#progOutputs').show();

      var pyStdout = this.domRoot.find("#pyStdout");

      // keep original horizontal scroll level:
      var oldLeft = pyStdout.scrollLeft();
      // pyStdout.val((stdoutStr as any).rtrim() /* trim trailing spaces */);
      pyStdout.val(stdoutStr.replace(/\s*$/g, ""))
      pyStdout.scrollLeft(oldLeft);
      pyStdout.scrollTop(pyStdout[0].scrollHeight); // scroll to bottom, though
    }
    else {
      this.domRoot.find('#progOutputs').hide();
    }
  }

} // END class ProgramOutputBox

export default ProgramOutputBox

/*
  owner: ExecutionVisualizer;
  domRoot: any;

  // how many *maximum* lines get printed to stdout in the entire trace?
  numStdoutLines: number = 0;
 */