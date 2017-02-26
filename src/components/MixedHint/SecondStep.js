import React, { Component } from 'react'
import Highlight from 'react-highlight'

import Quiz from './Quiz'

class SecondStep extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div id="step-2">
        <h1>Step 2</h1>
        <p>Let's think with the following example.</p>
        <Highlight className="python">
          { this.props.test }
        </Highlight>
        <p>Look at line { 2 }</p>
        <Quiz
          code={ 'previous = term(base)' }
        />
      </div>
    )
  }

}

export default SecondStep