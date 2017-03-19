import React, { Component } from 'react'
import Highlight from 'react-highlight'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import Tree from '../Data/Tree'

class HistoryLog extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className="markdown">
        <pre>
          { _.union(Object.keys(this.props.beforeHistory), Object.keys(this.props.afterHistory)).map((key) => {
            if (_.isEqual(this.props.beforeHistory[key], this.props.afterHistory[key])) return null

            return (
              <div key={ key }>
                <code>
                  { key }
                </code>
                <br />
                <code>
                  - Result:   { this.props.afterHistory[key] ? this.props.afterHistory[key].history.join(' | ') : '' }
                </code>
                <br />
                <code>
                  - Expected: { this.props.beforeHistory[key] ? this.props.beforeHistory[key].history.join(' | ') : '' }
                </code>
                <br />
                <code>
                  - Calls:    { this.props.beforeHistory[key] ? this.props.beforeHistory[key].calls ? this.props.beforeHistory[key].calls.join(' | ') : '' : '' }
                </code>
                <br />
                <code>
                  - Calls Exp:{ this.props.afterHistory[key] ? this.props.afterHistory[key].calls ? this.props.afterHistory[key].calls.join(' | ') : '' : '' }
                </code>
                <br />
                <br />
              </div>
            )
          }) }
        </pre>
      </div>
    )
  }
}

export default HistoryLog