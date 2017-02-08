import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import * as jsdiff from 'diff'
import Slider from 'rc-slider'
import Tooltip from 'rc-tooltip'

class DiffView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      items: [],
      code: '',
      id: 0,
      before: '',
      after: '',
      added: [],
      removed: []
    }
    window.diffView = this
  }

  componentDidMount() {
    this.cm = this.refs.editor.getCodeMirror()
    $.ajax({
      method: 'GET',
      url: `${window.location.pathname}data/accumulate_all_attempts.json`
    })
    .then((res) => {
      this.setState({ items: res })
      this.generateDiff(0)
    })
  }

  generateDiff(id) {
    let item = this.state.items[id]
    let before = item.before.substr(2)
    let after = item.SynthesizedAfter.substr(2)
    let diffs = jsdiff.diffJson(before, after)

    let code = ''
    let index = -1
    let added = []
    let removed = []
    for (let diff of diffs) {
      code += diff.value
      for (let i = 0; i < diff.count; i++) {
        index += 1
        if (diff.added) added.push(index)
        if (diff.removed) removed.push(index)
      }
    }
    let state = {
      id: id,
      code: code,
      before: before,
      after: after,
      added: added,
      removed: removed
    }
    this.setState(state)

    setTimeout(() => {
      console.log('update')
      for (let line of removed) {
        this.cm.addLineClass(line, '', 'removed')
      }
      for (let line of added) {
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
      <div style={{ minHeight: '400px' }}>
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
