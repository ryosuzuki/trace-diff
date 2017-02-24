import { applyMiddleware, compose, createStore } from 'redux'
import rootReducer from './reducer'
import createLogger from 'redux-logger'
import thunk from 'redux-thunk'

const logger = createLogger()

let finalCreateStore = compose(
  // applyMiddleware(thunk, logger)
  applyMiddleware(thunk)
)(createStore)

export default function configureStore(initialState) {
  return finalCreateStore(rootReducer, initialState)
}