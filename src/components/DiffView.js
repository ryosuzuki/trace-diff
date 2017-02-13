import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import Slider from 'rc-slider'
import Tooltip from 'rc-tooltip'
import Datastore from 'nedb'

const db = new Datastore()
window.db = db

class DiffView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      items: [],
      code: '',
      id: 0,
      before: '',
      after: '',
      diffs: [],
      added: [],
      removed: [],
      test: '',
      expected: '',
      result: '',
      log: '',
    }
    window.diffView = this
  }

  componentDidMount() {
    this.cm = this.refs.editor.getCodeMirror()
    $.ajax({
      method: 'GET',
      url: `${window.location.pathname}data/accumulate.json`
    })
    .then((items) => {
      console.log('start')
      this.setState({ items: items })
      this.generateDiff(0)

      items = items.map((item) => {
        return {
          id: item.id,
          test: item.test,
          expected: item.expected,
          result: item.result
        }
      })
      db.insert(items, (err) => {
        console.log('finish')
      })
    })
  }

  generateDiff(id) {
    let item = this.state.items[id]
    let state = Object.assign(item, { id: id })
    this.setState(state)
    setTimeout(() => {
      console.log('update')
      for (let line of this.state.removed) {
        this.cm.addLineClass(line, '', 'removed')
      }
      for (let line of this.state.added) {
        this.cm.addLineClass(line, '', 'added')
      }
    }, 50)
  }

  onChange(value) {
    if (value.target) value = value.target.value
    const id = Math.floor(value)
    this.generateDiff(id)
  }

  render() {
    return (
      <div>
        <div className="ui form">
          <input
            type="text"
            value={ this.state.id }
            onChange={ this.onChange.bind(this) }
          />
        </div>
        <Slider
          dots
          min={ 0 }
          max={ this.state.items.length-1 }
          value={ this.state.id }
          onChange={ this.onChange.bind(this) }
          handle={ handle }
        />
        <br />
        <br />
        <CodeMirror
          value={ this.state.code }
          ref="editor"
          options={ this.props.options }
        />
        <br />
        <h2>Failed Test Result</h2>
        <div className="markdown">
          <pre><code>{ this.state.log }</code></pre>
        </div>
      </div>
    )
  }
}

export default DiffView

const Handle = Slider.Handle;
const handle = (props) => {
  const { value, dragging, index, ...restProps } = props;
  return (
    <Tooltip
      overlay={value}
      visible={dragging}
      placement="top"
      key={index}
    >
      <Handle {...restProps} />
    </Tooltip>
  );
};
