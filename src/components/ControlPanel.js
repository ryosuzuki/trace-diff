import React, { Component } from 'react'
import Slider from 'rc-slider'
import Tooltip from 'rc-tooltip'

class ControlPanel extends Component {
  constructor(props) {
    super(props)
    window.controlPanel = this
  }

  onChange(value) {
    if (value.target) value = value.target.value
    const id = Math.floor(value)
    window.app.setCurrent(id)
  }

  render() {
    return (
      <div>
        <div className="ui form">
          <input
            type="text"
            value={ this.props.id }
            onChange={ this.onChange.bind(this) }
          />
        </div>
        <Slider
          dots
          min={ 0 }
          max={ this.props.items.length-1 }
          value={ this.props.id }
          onChange={ this.onChange.bind(this) }
          handle={ handle }
        />

        <div>
          <h1>Clustering similar results</h1>
          { this.props.relatedItems.map((item) => {
            return (
              <a className="ui basic label" onClick={ this.onChange.bind(this, item.id) } key={ item.id }>
                { item.id }
              </a>
            )
          }) }

        </div>
      </div>
    )
  }
}

export default ControlPanel


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