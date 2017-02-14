import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import Datastore from 'nedb'

class HintView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      type: 'none'
    }
    window.hintView = this
  }

  componentDidMount() {
    this.cm = this.refs.editor.getCodeMirror()
  }

  updateHint() {
    console.log(this.state.type)
  }

  onClick(type) {
    this.setState({ type: type }, () => {
      this.updateHint()
    })

  }

  render() {
    const types = ['none', 'location', 'data', 'behavior', 'transformation']
    return (
      <div>
        <div className="ui form">
          <div className="inline fields">
            <label name="hint">Select Hint Types:</label>
            { types.map((type) => {
              return (
                <div className="field" key={ type }>
                  <div className="ui radio checkbox" key={ type } onClick={ this.onClick.bind(this, type) }>
                    <input type="radio" checked={ type === this.state.type ? true : false } tabIndex="0" />
                    <label style={{ cursor: 'pointer' }}>{ type.charAt(0).toUpperCase() + type.slice(1) }</label>
                  </div>
                </div>
              )
            }) }
          </div>
        </div>
        <h2>Code</h2>
        <CodeMirror
          value={ this.props.before }
          ref="editor"
          options={ this.props.options }
        />
        <br />
        <h2>Failed Test Result</h2>
        <div className="markdown">
          <pre><code>{ this.props.log }</code></pre>
        </div>
      </div>
    )
  }
}

export default HintView
