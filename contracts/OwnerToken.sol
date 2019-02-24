// solium-disable linebreak-style
pragma solidity >=0.4.2;
import "./SafeMath.sol";

contract OwnerToken {

    string public name = "OwnerToken";
    string public symbol = "OTN";
    string public version = "v0.01";
    uint256 public totalSupply;
    address public bank;

    using SafeMath for uint256;
    modifier bankFunc {
        require(bank == msg.sender,"only the bank can mint");
        _;
    }  

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );
    
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    constructor() public {
        totalSupply = 0;
        balanceOf[msg.sender] = 0;
        bank = msg.sender;
    }

    function mint(uint x, address _addressTo) public bankFunc {
        totalSupply = totalSupply.add(x);
        balanceOf[_addressTo] = balanceOf[_addressTo].add(x);


    }

    function transfer(address _receiver,  uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value, "you can't send more tokens than you possess");

        balanceOf[msg.sender] = balanceOf[msg.sender].sub(_value);
        balanceOf[_receiver] = balanceOf[_receiver].add(_value);

        emit Transfer(msg.sender, _receiver, _value);
        return true;
    }

    /*
    function altTransfer(address _sender, address _receiver, uint256 _value) public returns (bool success) {
        require(balanceOf[_sender] >= _value, "you can't send more tokens than you possess");
        balanceOf[_sender] = balanceOf[_sender].sub(_value);
        balanceOf[_receiver] = balanceOf[_receiver].add(_value);

        emit Transfer(_sender,  _receiver, _value);
        return true;
    }
    */

    function approve(address _spender, uint256 _value) public returns (bool success) {

        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }
    
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {

        require(_value <= balanceOf[_from], "sending address does not have enough tokens");
        require(_value <= allowance[_from][msg.sender], "sending address is not authorized to send that many tokens");
        

        balanceOf[_from].sub(_value);
        balanceOf[_to].add(_value);
        allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;

    }

}