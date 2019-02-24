// solium-disable linebreak-style
pragma solidity >=0.4.2;
import "./OwnerToken.sol";

contract Election {

    mapping(address => bool) public voters;
    mapping(uint => address) public votersByIndex;
    mapping(address => bool) public votersByAddress;
    mapping(address => mapping(uint => bool)) public voters2;
    uint public votersCount;
    uint public motionCount;

    mapping(uint => Motion) public motions;

    OwnerToken public tokenContract;
    
    struct Motion {
        string motionName;
        uint amount;
        address addressTo;
        uint motionId;
        string motionState;
        uint voteFor;
        uint voteAgainst;
    }

    event votedEvent (
        uint indexed _motionId
    );
    event registrationEvent (
        address indexed _registeredAddress
    );

    event motionEvent (
        uint indexed _motionCount
    );



    function addMotion (string memory _motionName, uint _amount, address _addressTo, string memory _motionState) public {
        motionCount ++;
        motions[motionCount] = Motion(_motionName, _amount, _addressTo, motionCount, _motionState, 0, 0);

        emit motionEvent(motionCount);
    }

    function addVoter () public {
        votersCount ++;
        votersByIndex[votersCount] = msg.sender;
        votersByAddress[msg.sender] = true;

        emit registrationEvent(msg.sender);
    }

    constructor(OwnerToken _tokenContract) public {
        tokenContract = _tokenContract;
    }



    function vote (uint _motionId, uint _option) public {
        if(_option == 0) {
            motions[_motionId].voteAgainst ++;
        }
        else {
            motions[_motionId].voteFor ++;
        }

        // record that voter has voted
        voters[msg.sender] = true;

        voters2[msg.sender][_motionId] = true;

        if(votersCount == motions[_motionId].voteFor + motions[_motionId].voteAgainst) {
            motions[_motionId].motionState = "doing";
        }

        emit votedEvent(_motionId);
        
    }



    function finishMotion(uint _motionId) public {
        motions[_motionId].motionState = "done";
        
        emit votedEvent(_motionId);
    }
}
