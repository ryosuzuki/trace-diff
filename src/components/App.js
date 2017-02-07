import React, { Component } from 'react'
import LocationHint from './LocationHint'
import DataHint from './DataHint'
import BehaviorHint from './BehaviorHint'
import TransformationHint from './TransformationHint'
import ExampleHint from './ExampleHint'

class App extends Component {

  componentDidMount() {
    window.app = this
  }

  render() {
    const options = {
      mode: 'python',
      theme: 'base16-light',
      lineNumbers: true
    }

    return (
      <div>
        <div className="ui two column centered grid">
          <div className="nine wide column">
            <h1 id="top" className="ui center aligned huge header">
              Exploring the Design Space of Automated Hints
            </h1>
          </div>
          <div id="location-hint" className="nine wide column">
            <h1>Location Hint</h1>
            <p className="ui text">{ description.location }</p>
            <h2>Example 1</h2>
            <LocationHint
              options={ options }
              index={ 1 }
              error={ 4 }
            />
            <br />
            <h2>Example 2</h2>
            <LocationHint
              options={ options }
              index={ 2 }
              error={ 1 }
            />
            <div className="ui divider"></div>
          </div>
          <div id="data-hint" className="nine wide column">
            <h1>Data Hint</h1>
            <p className="ui text">{ description.data }</p>
            <DataHint />
            <div className="ui divider"></div>
          </div>
          <div id="behavior-hint" className="nine wide column">
            <h1>Behavioral Hint</h1>
            <p className="ui text">{ description.behavior }</p>
            <BehaviorHint />
            <div className="ui divider"></div>
          </div>
          <div id="transformation-hint" className="nine wide column">
            <h1>Transformation Hint</h1>
            <p className="ui text">{ description.transformation }</p>
            <TransformationHint />
            <div className="ui divider"></div>
          </div>
          <div id="example-hint" className="nine wide column">
            <h1>Example Hint</h1>
            <p className="ui text">{ description.example }</p>
            <ExampleHint />
            <div className="ui divider"></div>
          </div>
        </div>
      </div>
    )
  }
}

export default App

const description = {}
description.location = 'The location hint provides information about which part of the student code is incorrect. For instance, a location hint for our running example would be: “There is an error in line 3”. The level of abstraction of a location hint can vary. A more concrete hint would be: “There is an error in the value assigned to the variable total in line 3”. This type of information is easily extracted from a synthesized bug fix.'
description.data = 'Data hint provides information about expected internal data values of the program during a de- bugging section. The system iteratively executes the code, line-by-line, similar to a debugging tool such as PythonTu- tor [11]. When the system detects that a value of variable is incorrect, it pauses the execution of the program, and shows the difference between the expected value and the actual value.'
description.behavior = 'The Data hint points to a difference in the program state in a particular moment of the program execution. Sometimes, however, it is hard to understand how that difference affects the program behavior considering the entire program execution. The Behavioral hint provides information about the internal behavior of the program dur- ing its execution. For instance, in our running example, a Behavioral hint would be: “The variable total received the following values after the program execution: 0, 0, 0, 0. The expected values are: 2, 18, 72, 72. As another example of a Behavioral hint, consider a scenario where the student had forgotten to add a base case to the recursion, and the code thrown a StackOverFlowException. A Behavioral hint will show the difference in the expected number of calls to the recursive function and the actual one.'
description.transformation = 'The Transformation hint abstracts the synthesized fix and provides an information about what change the student should do. For example: “you should replace the initialization of the variable total” or “you should add an If statement”. The abstraction level can be configured by the teaching staff. This type of hint is already used by current program synthesis techniques.'
description.example = 'Another way of showing how to fix the code is using a similar example. In our study, we found that the teaching assistants often used this type of hint. For instance, in one scenario, the student did not know how to use the combine function. The TA explained to him: “ accumulate(add, 0, 5, identity) should return 0 + 1 + 2 + 3 + 4 + 5. In this case combiner is the two-argument add function,whichweuselikethis: 0 + 1 + 2 + 3 + 4 + 5 = ((((0 + 1) + 2) + 3) + 4) + 5 = add(add(add(add(add(0, 1), 2),3), 4), 5).”. In another scenario, the TA gave an example of proper way of using lambda functions.'
