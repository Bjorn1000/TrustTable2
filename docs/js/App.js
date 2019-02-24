import React from 'react'
import ReactDOM from 'react-dom'
import Web3 from 'web3'
import TruffleContract from 'truffle-contract'
import Election from '../../build/contracts/Election.json'
import OwnerToken from '../../build/contracts/OwnerToken.json'

import Content from './Content'


import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'bootstrap/dist/css/bootstrap.css'
import "react-tabs/style/react-tabs.css";

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      addresses: [],
      addressTo: 0x0,
      motions: [],
      isBank: false,
      hasVoted: false,
      loading: true,
      voting: false,
      registered: false,
      currentMotion: 'Select a Motion',
      currentMotionId: 0,
      currentMotionObject: {motionName: 'Select a Motion', voteFor: 0, voteAgainst: 0, amount: 0, addressTo: '0x0', motionId: 0}
    }

    if (typeof web3 != 'undefined') {
      this.web3Provider = web3.currentProvider
    } else {
      this.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545')
    }

    this.web3 = new Web3(this.web3Provider)

    this.election = TruffleContract(Election)
    this.election.setProvider(this.web3Provider)
    this.ownertoken = TruffleContract(OwnerToken)
    this.ownertoken.setProvider(this.web3Provider)

    this.onAmountChanged = this.onAmountChanged.bind(this)
    this.castVote = this.castVote.bind(this)
    this.watchEvents = this.watchEvents.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.registerAddress = this.registerAddress.bind(this)
    this.createMotion = this.createMotion.bind(this)
    this.uniqify = this.uniqify.bind(this)
    this.uniqifyObjects = this.uniqifyObjects.bind(this)
    this.updateMotions = this.updateMotions.bind(this)
    this.onAddressChanged = this.onAddressChanged.bind(this)
    this.motionExecute = this.motionExecute.bind(this)
  }

  componentDidMount() {

    /*
    this.election.defaults({
      from:this.web3.eth.accounts[0]
    });
    */
    this.updateMotions();

    
    this.ownertoken.deployed().then((tokenInstance) => {
      this.tokenInstance = tokenInstance;
      this.tokenInstance.totalSupply().then((supply) => {
        this.setState({ totalSupply: supply});
        console.log(this.state.account);
        return this.tokenInstance.balanceOf(this.state.account);
      }).then((balance) => {
        console.log(balance.toNumber());
        this.setState({bankBalance: balance.toNumber()})
      });
    });
    

    this.web3.eth.getCoinbase((err, account) => {
      this.web3.eth.getCoinbase((err, account) => {
        this.ownertoken.deployed().then((tokenInstance) => {
          this.tokenInstance = tokenInstance;
          return this.tokenInstance.bank();
      }).then((bankAccount) => {
          console.log(bankAccount);
          if(account == bankAccount) {
            console.log("is bank");
            this.setState({isBank: true});
          }
          else {
            console.log("is not bank");
            this.setState({isBank: false});
          }
      });
    });
  });

    // TODO: Refactor with promise chain
    this.web3.eth.getCoinbase((err, account) => {
      this.setState({ account })
      this.election.deployed().then((electionInstance) => {
        this.electionInstance = electionInstance
        this.watchEvents()
        this.electionInstance.voters2(this.state.account, this.state.currentMotionId).then((hasVoted) => {
          this.setState({ hasVoted, loading: false });
        });

        this.electionInstance.votersByAddress(this.state.account).then((registered) => {

          if(registered) {
            this.setState({registered: true});
          }

        });

        this.electionInstance.motionCount().then((count) => {
          this.setState({motionCount: count.toNumber()});
        });

        this.electionInstance.votersCount().then((count) => {
          this.setState({votersCount: count});
          for(var i = 1; i < count.toNumber() + 1; i++) {
            this.electionInstance.votersByIndex(i).then((value) => {
              this.setState({ 
                addresses: this.uniqify(this.state.addresses.concat([value]))
              })
            }) 
          }  
        })
        
      })
    });
  }

  updateMotions() {
    this.election.deployed().then((electionInstance) => {
      this.electionInstance = electionInstance
      this.electionInstance.motionCount().then((count) => {
        for(var i = 1; i <= count; i++) {
          this.electionInstance.motions(i).then((motion) => {
            let motions = [...this.state.motions];
            motions.push({
              motionName: motion[0],
              amount: motion[1].toNumber(),
              addressTo: motion[2],
              motionId: motion[3].toNumber(),
              motionState: motion[4],
              voteFor: motion[5].toNumber(),
              voteAgainst: motion[6].toNumber()
            });
            motions = this.uniqifyObjects(motions);
            this.setState({ motions: motions});
            
          })
        }
      });
    });
  }

  handleChange(event) {

    this.setState({currentMotion: event.target.options[event.target.selectedIndex].text});
    var numnum = parseInt(event.target.options[event.target.selectedIndex].text.split(' ')[1]);

    this.setState({currentMotionId: numnum}, () => {
      this.electionInstance.voters2(this.state.account, this.state.currentMotionId).then((hasVoted) => {
        this.setState({ hasVoted, loading: false });
      });
    });

    const currentMotion = this.state.motions[event.target.value - 1];
    this.setState({currentMotionObject: currentMotion});
  }

  onAmountChanged(e) {
    this.setState({amount: e.target.value});
  }

  onAddressChanged(e) {
    console.log(e.target.value);
    this.setState({addressTo: e.target.value});
  }

  uniqify(array) {
    const distinct = (value, index, self) => {
      return self.indexOf(value) === index;
    }
    const distinctValues = array.filter(distinct);
    return distinctValues;
  }

  uniqifyObjects(array) {
    const distinctObjects = Array.from(new Set(array.map(s => s.motionName))).map(
      id => {
        return {
          motionName: id,
          amount: array.find(s => s.motionName === id).amount,
          addressTo: array.find(s => s.motionName === id).addressTo,
          motionId: array.find(s => s.motionName === id).motionId,
          motionState: array.find(s => s.motionName === id).motionState,
          voteFor: array.find(s => s.motionName === id).voteFor,
          voteAgainst: array.find(s => s.motionName === id).voteAgainst
        }
      }
    )
    return distinctObjects;
  }

  watchEvents() {
    // TODO: trigger event when vote is counted, not when component renders
    this.electionInstance.votedEvent({}, {
      fromBlock: 0,
      toBlock: 'latest'
    }).watch((error, event) => {
      this.setState({ voting: false })
      this.electionInstance.motions(event.args._motionId.toNumber()).then((motion) => {
        let motions = this.state.motions;
        let newMotion  = {
          motionName: motion[0],
          amount: motion[1].toNumber(),
          addressTo: motion[2],
          motionId: motion[3].toNumber(),
          motionState: motion[4],
          voteFor: motion[5].toNumber(),
          voteAgainst: motion[6].toNumber()
        };

        motions[event.args._motionId.toNumber() - 1] = newMotion;

        this.setState({
          currentMotionObject: newMotion
        });
        this.setState({
          motions: motions
        });
      });

    })

    this.electionInstance.registrationEvent({}, {
      fromBlock: 0,
      toBlock: 'latest'
    }).watch((error, event) => {
      let newAddress = event.args._registeredAddress;
      if(this.state.account == newAddress) {
        this.setState({ registered: true });
        this.setState({ 
          addresses: this.uniqify(this.state.addresses.concat([newAddress]))
        });

        this.updateMotions();
        this.electionInstance.votersCount().then((count) => {
          this.setState({votersCount: count});
        });
      }
    })

    this.electionInstance.motionEvent({}, {
      fromBlock: 0,
      toBlock: 'latest'
    }).watch((error, event) => {
      this.electionInstance.motions(event.args._motionCount).then((motion) => {
        let newMotion  = {
          motionName: motion[0],
          amount: motion[1].toNumber(),
          addressTo: motion[2],
          motionId: motion[3].toNumber(),
          motionState: motion[4],
          voteFor: motion[5].toNumber(),
          voteAgainst: motion[6].toNumber()
        };
        let motions = this.uniqifyObjects(this.state.motions.concat([newMotion]));
        this.setState({ motions: motions});


      });
    })

  }

  
  registerAddress() {

    this.election.defaults({
      from:this.web3.eth.accounts[0]
    });
    this.electionInstance.addVoter({ from: this.state.account });
  }

  createMotion() {
    // need motion count to create proper names
    this.electionInstance.motionCount().then((count) => {
      var motionName = "Motion " + (count.toNumber() + 1);
      this.electionInstance.addMotion(motionName, this.state.amount, this.state.addressTo, "todo", { from: this.state.account });
    });
    

    // todo send restful post request to python backend
  }



  castVote(optionId) {
    this.electionInstance.vote(this.state.currentMotionId, optionId, { from: this.state.account }).then((result) =>
    {
      this.setState({ hasVoted: true })
      
    })
  }

  motionExecute(motionId) {

    let executedMotion = this.state.motions[motionId - 1];
    this.ownertoken.defaults({
      from:this.web3.eth.accounts[0]
    })

    event.preventDefault();
    this.ownertoken.deployed().then((tokenInstance) => {
      this.tokenInstance = tokenInstance;
      this.tokenInstance.mint(executedMotion.amount, executedMotion.addressTo).then(() => {
        console.log(executedMotion.motionId);
        
        this.electionInstance.finishMotion(executedMotion.motionId, { from: this.state.account }).then(() => {
          console.log('refresh and get your balance :)');
        });
        
        
      });
    });
    
  }

  render() {


    return (
      <div class='row'>
        <div class='col-lg-12 text-center' >
        
        <Tabs>
          <TabList>
            {!this.state.registered ? <Tab>Register Address</Tab> : <div></div> }
            {this.state.addresses.length > 1 ? <Tab disabled={!this.state.registered}>Motion Maker</Tab> : <div></div> }
            
            <Tab>Voting</Tab>
            <Tab>List of addresses</Tab>
            {this.state.isBank ? <Tab>Motions pending approval</Tab> : <div></div> }
          </TabList>

          {!this.state.registered ?
          <TabPanel>
            <h1 style={{paddingTop: '10px'}}>Register your address:</h1>
            <p>{this.state.account}</p>
            <button class='btn btn-primary' onClick={this.registerAddress}>Register this address</button>   
          </TabPanel>
          :
          <div></div>
          }
          {this.state.addresses.length > 1 ?
          <TabPanel>
          <h1 style={{paddingTop: '10px'}}>Motion Maker</h1>
            <div>
              <label>
                Amount to mint then transfer <br />
                <input type="number" onChange={this.onAmountChanged} />
                
              </label>
            </div>

                  To: <select onChange={this.onAddressChanged} style={{marginBottom: '10px'}}>
                    <option disabled selected value> -- select an address -- </option>
                      {this.state.addresses.map((address) => {
                        return(
                          <option value={address}>{address}</option>
                        )
                      })}
                    
                    </select>
                 <br />


            <button onClick={this.createMotion} class='btn btn-primary'>Submit Motion</button>

          </TabPanel>
           : <div></div> }
          <TabPanel>
          <h1 style={{paddingTop: '10px'}}>{this.state.currentMotion}</h1>
          <br/>
          { this.state.loading || this.state.voting
            ? <p class='text-center'>Loading...</p>
            : <Content
                account={this.state.account}
                addresses={this.state.addresses}
                currentMotionObject={this.state.currentMotionObject}
                currentMotion={this.state.currentMotion}
                castVote={this.castVote}
                hasVoted={this.state.hasVoted}
                handleChange={this.handleChange}
                motions={this.state.motions}
                votersCount={this.state.votersCount}
                />   
          }
          </TabPanel>

          <TabPanel>
            <h1 style={{paddingTop: '10px'}}>List of registered addresses</h1>
              {this.state.addresses.map((item, index) => (
                <div key={item}>
                  {item}
                </div>
              ))}

            
          </TabPanel>
          {this.state.isBank ? 
          <TabPanel>
            <h1 style={{paddingTop: '10px'}}>Motions that require stamp of approval.</h1>
            <table class="table">
              <thead>
                <tr>
                  <th>Motion Id</th>
                  <th>What the motion does</th>
                  <th>Stamp of approval</th>
                </tr>
              </thead>
              <tbody >
              
              {this.state.motions.filter(motion => motion.motionState === 'doing').map((motion) => 
                  (<tr>
                    <td>{motion.motionId}</td><td>Mint {motion.amount} tokens then transfer to {motion.addressTo}</td><td><button onClick={() => {this.motionExecute(motion.motionId)}} class='btn btn-primary'>Stamp</button></td>
                  </tr>)
                )}
              
              </tbody>
            </table>
          </TabPanel>
          : <div></div> }
        </Tabs>
          
        </div>
      </div>
    )
  }
}

ReactDOM.render(
   <App />,
   document.querySelector('#root')
)
