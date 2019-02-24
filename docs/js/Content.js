import React from 'react'
import Table from './Table'


class Content extends React.Component {
  
  render() {
    let remainingVotes = 0;

    if(this.props.currentMotionObject !== undefined) {
      const getTotalVotes = (x, y, z) => { return x - y - z};
      remainingVotes = getTotalVotes(this.props.votersCount, this.props.currentMotionObject.voteFor, this.props.currentMotionObject.voteAgainst);
    }
    
    

    return (
      <div>
        
        { !this.props.hasVoted ?
          (this.props.currentMotion !== "Select a Motion" ? <Table currentMotionObject={this.props.currentMotionObject} candidates={this.props.candidates} castVote={this.props.castVote}/> : null)
          : null
        }
        
        
        <hr/>
        <div class='form-group'>
          <label>Select Motion</label>
          <select class="form-control" onChange={this.props.handleChange}>
          <option value="Select a Motion" selected="true" disabled="disabled">Select a motion</option>
            {this.props.motions.map((motion) => {
              if(motion.motionState == 'todo'){
                return(
                  <option value={motion.motionId}>{motion.motionName}</option>
                )
              }
            })
            }
          </select>
        </div>
        <p>Your account: {this.props.account}</p>
        {this.props.currentMotion !== "Select a Motion" ? <p>Votes remaining on motion: {remainingVotes}</p> : null}
      </div>
    )
  }
}

export default Content
