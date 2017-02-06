import 'semantic-ui-css/semantic.css'
import 'semantic-ui-css/semantic.js'
import 'font-awesome/css/font-awesome.css'
import 'codemirror/lib/codemirror.css'
import 'rc-slider/dist/rc-slider.css'
import './style.css'

import React from 'react'
import { render } from 'react-dom'
import App from './components/App'

render(
  <App />,
  document.getElementById('react-app')
)
