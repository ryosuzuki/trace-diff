import React, { Component } from 'react'
import Highlight from 'react-highlight'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import Tree from '../Data/Tree'
import Slider from 'rc-slider'
import Tooltip from 'rc-tooltip'

class Ladder extends Component {
  constructor(props) {
    super(props)
    this.state = {
      text: '',
      level: 0,
      max: 0,
      marks: []
    }
    window.ladder = this
  }

  init() {
    let key = this.props.name
    let max = 0
    if (!this.props.beforeHistory[key]) return null
    let after = this.props.afterHistory[key].history
    let before = this.props.beforeHistory[key].history
    let text = ''
    for (let i = 0; i < before.length; i++) {
      let quiz = window.quizes[i]
      if (!quiz) continue
      let updates = _.uniq(quiz.state.updates).reverse()
      let update = updates[this.state.level]
      max = Math.max(max, updates.length)
      if (!update) update = _.last(updates)
      if (i === 0) {
        text += `${key} is initialized with ${update}`
      } else {
        text += `${key} is updated to ${update}`
      }
      text += '\n'
    }
    text += `${this.props.test} returns ${this.props.result}`

    let marks = new Array(max)
    marks[0] = 'concrete'
    marks[max] = 'abstract'
    this.setState({ text: text, max: max, marks: marks })
  }

  onChange(value) {
    this.setState({ level: value }, () => {
      this.init()
    })
  }


  render() {
    return (
      <div id={ this.props.id } className="ladder">
        <p>However, the behavior of <code>{ this.props.name }</code> should be somethin like this</p>
        <Highlight className="python">
          { this.state.text }
        </Highlight>

        <p>Q. Why the behavior of previous is different ?</p>
        <p>
          <button className="ui primary button" onClick={ this.init.bind(this) }>Why ?</button>
        </p>

        <Slider
          dots
          min={ 0 }
          max={ this.state.max }
          marks={ this.state.marks }
          value={ this.state.level }
          handle={ handle }
          onChange={ this.onChange.bind(this) }
        />



      </div>
    )
  }
}

export default Ladder


const Handle = Slider.Handle;
const handle = (props) => {
  const { value, dragging, index, ...restProps } = props;
  return (
    <Tooltip
      overlay={ value === 0 ? 'concrete value' : `${value}-step abstract` }
      visible={dragging}
      placement="top"
      key={index}
    >
      <Handle {...restProps} />
    </Tooltip>
  );
};