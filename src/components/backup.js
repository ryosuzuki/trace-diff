

    // $('#step-3 .button')
    // .popup({
    //   position: 'bottom center',
    //   target: '#table-1',
    //   lastResort: 'bottom right',
    //   title: 'HOGEHO',
    //   content  : 'My favorite dog would like other dogs as much as themselves',
    //   on: 'click'
    // })

    $('#step-3 #table-0')
    .popup({
      position: 'bottom center',
      title: 'square(11)',
    })
    $('#step-3 #table-1')
    .popup({
      position: 'bottom center',
      title: 'add(121, 1)',
    })
    $('#step-3 #table-2')
    .popup({
      position: 'bottom center',
      title: 'add(122, 4)',
    })
    $('#step-3 #table-3')
    .popup({
      position: 'bottom center',
      title: 'add(126, 9)',
    })

    $('#step-3 .button').click(() => {
      $('#table-0').popup('show')
      $('#table-1').popup('show')
      $('#table-2').popup('show')
      $('#table-3').popup('show')
    })

    $('#step-4 #result-0')
    .popup({
      position: 'top center',
      title: 'square(11)',
    })
    $('#step-4 #result-1')
    .popup({
      position: 'top center',
      title: 'add(121, 1)',
    })
    $('#step-4 #result-2')
    .popup({
      position: 'top center',
      title: 'add(122, 4)',
    })
    $('#step-4 #result-3')
    .popup({
      position: 'top center',
      title: 'add(126, 9)',
    })

    $('#step-4 #expected-0')
    .popup({
      position: 'bottom center',
      title: 'square(1)',
    })
    $('#step-4 #expected-1')
    .popup({
      position: 'bottom center',
      title: 'add(1, 1)',
    })
    $('#step-4 #expected-2')
    .popup({
      position: 'bottom center',
      title: 'add(2, 4)',
    })
    $('#step-4 #expected-3')
    .popup({
      position: 'bottom center',
      title: 'add(6, 9)',
    })


    $('#step-4 .button').click(() => {
      $('#result-0').popup('show')
      $('#result-1').popup('show')
      $('#result-2').popup('show')
      $('#result-3').popup('show')
      $('#expected-0').popup('show')
      $('#expected-1').popup('show')
      $('#expected-2').popup('show')
      $('#expected-3').popup('show')
    })

          <div id="step-3">
            <h1>Step 3</h1>
            <p>Let's think about the behavior of <code>{ 'previous' }</code>.</p>

            <table className="ui celled table">
              <thead>
                <tr>
                <th><code>i</code></th>
                <th>-</th>
                <th>1</th>
                <th>2</th>
                <th>3</th>
              </tr></thead>
              <tbody>
                <tr>
                  <td>previous</td>
                  { this.props.beforeHistory['previous'] ? this.props.beforeHistory['previous'].history.map((i, index) => {
                    return <td id={ `table-${index}` }>{ i }</td>
                  }) : '' }
                </tr>
              </tbody>
            </table>

            <p><code>{ 'previous' }</code> updates at line { 3 }</p>

            <p>In a similar way, the behavior of <code>prevous</code> looks like this</p>
            <button className="ui basic button">Next</button>

          </div>

          <div id="step-4">
            <h1>Step 4</h1>
            <p>However, the behavior of <code>{ 'previous' }</code> should be somethin like this</p>
            <button className="ui basic button">Next</button>

            <table className="ui celled table">
              <thead>
                <tr>
                <th><code>previous</code></th>
                <th>-</th>
                <th>1</th>
                <th>2</th>
                <th>3</th>
              </tr></thead>
              <tbody>
                <tr>
                  <td>Result</td>
                  { this.props.beforeHistory['previous'] ? this.props.beforeHistory['previous'].history.map((i, index) => {
                    return <td id={ `result-${index}` }>{ i }</td>
                  }) : '' }
                </tr>
                <tr>
                  <td>Expected</td>
                  { this.props.afterHistory['previous'] ? this.props.afterHistory['previous'].history.map((i, index) => {
                    return <td id={ `expected-${index}` }>{ i }</td>
                  }) : '' }
                </tr>
              </tbody>
            </table>
          </div>


          <div id="step-2" style={{ display: this.state.step >= 2 ? 'block' : 'none' }}>
            <h1>Step 2</h1>
            <p>Let's look at line { this.props.removed[0] + 1 }</p>
            <pre><code>{ this.props.removedLine[0] ? _.last(this.props.removedLine).code.trim() : '' }</code></pre>
            { this.state.quizes.map((quiz, index) => {
              return (
                <div id={ `q-${index}` } key={ index }>
                  <p>Q. What is the value of <code>{ quiz.key }</code>?</p>
                  <p>
                    <code>{ quiz.key }</code> =
                    <input className={ 'inline-input'  } type="text" placeholder={ quiz.value } onChange={ this.onChange.bind(this, quiz, index) } />
                    <span className="inline-message">Correct!</span>
                  </p>
                  { quiz.calls ? quiz.calls.map((call) => {
                    return (
                      <p>{ call }</p>
                    )
                  }) : '' }
                </div>
              )
            }) }
          </div>
          <button className="ui basic button" onClick={ this.onClick.bind(this) }>Next</button>

