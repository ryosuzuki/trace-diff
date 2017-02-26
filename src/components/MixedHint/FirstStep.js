import React, { Component } from 'react'
import Highlight from 'react-highlight'

class FirstStep extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div id="step-1">
        <h1>Step 1</h1>
        <p>Your <code>accumulate</code> function failed 1 test case</p>
        <Highlight className="python">
          { this.props.log }
        </Highlight>
      </div>
    )
  }

}

export default FirstStep