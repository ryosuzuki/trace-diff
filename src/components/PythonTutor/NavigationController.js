
class NavigationController {

  constructor(owner, domRoot, domRootD3, nSteps) {
    this.owner = owner;
    this.domRoot = domRoot;
    this.domRootD3 = domRootD3;
    this.nSteps = nSteps;

    var navHTML = '<div id="navControlsDiv">\
                     <div id="executionSlider"/>\
                     <div id="executionSliderFooter"/>\
                     <div id="vcrControls">\
                       <button id="jmpFirstInstr", type="button">&lt;&lt; First</button>\
                       <button id="jmpStepBack", type="button">&lt; Back</button>\
                       <span id="curInstr">Step ? of ?</span>\
                       <button id="jmpStepFwd", type="button">Forward &gt;</button>\
                       <button id="jmpLastInstr", type="button">Last &gt;&gt;</button>\
                     </div>\
                     <div id="rawUserInputDiv">\
                       <span id="userInputPromptStr"/>\
                       <input type="text" id="raw_input_textbox" size="30"/>\
                       <button id="raw_input_submit_btn">Submit</button>\
                     </div>\
                     <div id="errorOutput"/>\
                   </div>';

    this.domRoot.append(navHTML);

    this.domRoot.find("#jmpFirstInstr").click(() => {
      this.owner.renderStep(0);
      // window.beforeViz.renderStep(0);
      // window.afterViz.renderStep(0);
    });
    this.domRoot.find("#jmpLastInstr").click(() => {
      this.owner.renderStep(this.nSteps - 1);
      // window.beforeViz.renderStep(this.nSteps - 1);
      // window.afterViz.renderStep(this.nSteps - 1);
    });
    this.domRoot.find("#jmpStepBack").click(() => {
      this.owner.stepBack();
      // window.beforeViz.stepBack();
      // window.afterViz.stepBack();
    });
    this.domRoot.find("#jmpStepFwd").click(() => {
      this.owner.stepForward();
      // window.beforeViz.stepForward();
      // window.afterViz.stepForward();
    });

    // disable controls initially ...
    this.domRoot.find("#vcrControls #jmpFirstInstr").attr("disabled", true);
    this.domRoot.find("#vcrControls #jmpStepBack").attr("disabled", true);
    this.domRoot.find("#vcrControls #jmpStepFwd").attr("disabled", true);
    this.domRoot.find("#vcrControls #jmpLastInstr").attr("disabled", true);

    var ruiDiv = this.domRoot.find('#rawUserInputDiv');
    ruiDiv.find('#userInputPromptStr').html(this.owner.userInputPromptStr);
    ruiDiv.find('#raw_input_submit_btn').click(() => {
      var userInput = ruiDiv.find('#raw_input_textbox').val();
      // advance instruction count by 1 to get to the NEXT instruction
      this.owner.params.executeCodeWithRawInputFunc(userInput, this.owner.curInstr + 1);
    });
  }

  hideUserInputDiv() {
    this.domRoot.find('#rawUserInputDiv').hide();
  }

  showUserInputDiv() {
    this.domRoot.find('#rawUserInputDiv').show();
  }

  setSliderVal(v: number) {
    // PROGRAMMATICALLY change the value, so evt.originalEvent should be undefined
    this.domRoot.find('#executionSlider').slider('value', v);
  }

  setVcrControls(msg: string, isFirstInstr: boolean, isLastInstr: boolean) {
    var vcrControls = this.domRoot.find("#vcrControls");
    vcrControls.find("#curInstr").html(msg);
    vcrControls.find("#jmpFirstInstr").attr("disabled", false);
    vcrControls.find("#jmpStepBack").attr("disabled", false);
    vcrControls.find("#jmpStepFwd").attr("disabled", false);
    vcrControls.find("#jmpLastInstr").attr("disabled", false);

    if (isFirstInstr) {
      vcrControls.find("#jmpFirstInstr").attr("disabled", true);
      vcrControls.find("#jmpStepBack").attr("disabled", true);
    }
    if (isLastInstr) {
      vcrControls.find("#jmpLastInstr").attr("disabled", true);
      vcrControls.find("#jmpStepFwd").attr("disabled", true);
    }
  }

  setupSlider(maxSliderVal: number) {
    assert(maxSliderVal >= 0);
    var sliderDiv = this.domRoot.find('#executionSlider');
    sliderDiv.slider({min: 0, max: maxSliderVal, step: 1});
    // disable keyboard actions on the slider itself (to prevent double-firing
    // of events), and make skinnier and taller
    sliderDiv
      .find(".ui-slider-handle")
      .unbind('keydown')
      .css('width', '0.8em')
      .css('height', '1.4em');

    this.domRoot.find(".ui-widget-content").css('font-size', '0.9em');
    this.domRoot.find('#executionSlider').bind('slide', (evt, ui) => {
      // this is SUPER subtle. if this value was changed programmatically,
      // then evt.originalEvent will be undefined. however, if this value
      // was changed by a user-initiated event, then this code should be
      // executed ...
      if (evt.originalEvent) {
        this.owner.renderStep(ui.value);
      }
    });
  }

  renderSliderBreakpoints(sortedBreakpointsList) {
    this.domRoot.find("#executionSliderFooter").empty();
    var w = this.domRoot.find('#executionSlider').width();

    // I originally didn't want to delete and re-create this overlay every time,
    // but if I don't do so, there are weird flickering artifacts with clearing
    // the SVG container; so it's best to just delete and re-create the container each time
    var sliderOverlay = this.domRootD3.select('#executionSliderFooter')
      .append('svg')
      .attr('id', 'sliderOverlay')
      .attr('width', w)
      .attr('height', 12);

    var xrange = d3.scale.linear()
      .domain([0, this.nSteps - 1])
      .range([0, w]);

    sliderOverlay.selectAll('rect')
      .data(sortedBreakpointsList)
      .enter().append('rect')
      .attr('x', function(d, i) {
        // make edge case of 0 look decent:
        return (d === 0) ? 0 : xrange(d) - 1;
      })
      .attr('y', 0)
      .attr('width', 2)
      .attr('height', 12)
      .style('fill', function(d) {
         return breakpointColor;
      });
  }

  showError(msg: string) {
    if (msg) {
      this.domRoot.find("#errorOutput").html(htmlspecialchars(msg)).show();
    } else {
      this.domRoot.find("#errorOutput").hide();
    }
  }

} // END class NavigationController


export default NavigationController

function assert(cond) {
  if (!cond) {
    console.trace();
    alert("Assertion Failure (see console log for backtrace)");
    throw 'Assertion Failure';
  }
}


/*
  owner: ExecutionVisualizer;
  domRoot: any;
  domRootD3: any;
  nSteps: number;

 */