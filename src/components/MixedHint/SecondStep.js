import React, { Component } from 'react'

class SecondStep extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div id="step-2">
        <h1>Step 2</h1>
        <p>Your <code>accumulate</code> function failed 1 test case</p>
        <pre>
          <code>{ this.props.log }</code>
        </pre>
      </div>
    )
  }

}

export default SecondStep