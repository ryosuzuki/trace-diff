let reducer = function (state, action) {
  switch (action.type) {
    case 'UPDATE_STATE':
      return Object.assign({}, state,
        action.state
      )
    default:
      return state
  }
}

export default reducer