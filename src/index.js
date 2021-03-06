import 'semantic-ui-css/semantic.js'
import 'jquery-ui-bundle/jquery-ui.js'
import 'd3/d3.v2.js'
import 'codemirror/lib/codemirror.js'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/python/python.js'
import 'codemirror/theme/base16-light.css'
import 'rc-slider/dist/rc-slider.css'
import 'rc-tooltip/assets/bootstrap.css'
import 'highlight.js/styles/tomorrow.css'
import './style/codemirror.less'
import './style/pytutor.less'
import './style/main.less'

import React from 'react'
import { render } from 'react-dom'
import App from './components/App'
import configureStore from './redux/store'
import { Provider } from 'react-redux'

let initialStore = {
  items: [],
  id: 0,
  studentId: 0,
  code: '',
  before: '',
  after: '',
  beforeCode: '',
  afterCode: '',
  traces: [],
  beforeTraces: [],
  afterTraces: [],
  diffs: [],
  added: [],
  removed: [],
  addedLine: [],
  removedLine: [],
  test: '',
  expected: '',
  result: '',
  rule: '',
  log: '',
  currentCode: '',
  step: 0,
  stop: false,
  relatedItems: [],
  beforeHistory: {},
  afterHistory: {},
  beforeEvents: [],
  afterEvents: [],
  beforeAst: [],
  afterAst: [],
  beforeTicks: {},
  afterTicks: {},
  commonKeys: [],
  focusKeys: [],
}

let store = configureStore(initialStore)

render(
  <Provider store={store}>
    <App store={store}/>
  </Provider>,
  document.getElementById('react-app')
)