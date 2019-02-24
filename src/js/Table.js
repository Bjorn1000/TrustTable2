import React from 'react'

class Table extends React.Component {
  render() {
    
    return (
      <table class='table'>
        <thead>
          <tr>
            <th></th>
            <th>Total Votes</th>
            <th></th>
          </tr>
        </thead>
        <tbody >
            <tr>
              <th>For</th>
              <td>{this.props.currentMotionObject.voteFor}</td>
              <td><button onClick={() => {this.props.castVote(1)}} class='btn btn-primary'>Vote</button></td>
            </tr>
            <tr>
              <th>Against</th>
              <td>{this.props.currentMotionObject.voteAgainst}</td>
              <td><button onClick={() => {this.props.castAltVote(0)}} class='btn btn-primary'>Vote</button></td>
            </tr>
        </tbody>
      </table>
    )
  }
}

export default Table
