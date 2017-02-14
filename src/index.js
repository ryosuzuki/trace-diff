import 'semantic-ui-css/semantic.js'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/zenburn.css'
import 'codemirror/theme/solarized.css'
import 'codemirror/theme/railscasts.css'
import 'codemirror/theme/elegant.css'
import 'codemirror/theme/duotone-light.css'
import 'codemirror/theme/base16-light.css'
import 'codemirror/theme/3024-day.css'
import 'codemirror/theme/vibrant-ink.css'
import 'rc-slider/dist/rc-slider.css'
import 'rc-tooltip/assets/bootstrap.css'
import './style.css'

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
  test: '',
  expected: '',
  result: '',
  rule: '',
  log: '',
  currentCode: '',
  step: 0,
  stop: false,
}

let store = configureStore(initialStore)

render(
  <Provider store={store}>
    <App store={store}/>
  </Provider>,
  document.getElementById('react-app')
)