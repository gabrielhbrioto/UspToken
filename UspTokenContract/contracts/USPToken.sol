// SPDX-License-Identifier: MIT
/// @title USPToken
/// @author Gabriel H Brioto
/// @notice Implements a token ethereum
/// @dev Implements a token based on ERC20 standart

/*
    Adicionar mensagens de erro mais completas
    Contract address:0x2A23B5aC7c03312A6CA0dcCfC2609AeBE7634A9E
    Bloco do contrato: 5178854
*/

pragma solidity ^0.8.17;
import "./IERC20.sol";

contract USPToken is IERC20 {

    //atributos
    string public constant name = "USPToken"; 
    string public constant symbol = "U$PT";
    uint256 public constant decimals = 18;
    uint256 public totalSupply_= 100000000000000000000000;
    address public owner;

    mapping(address => uint256) public balances;
    mapping(address => mapping(address => uint256)) public allowed;
    mapping(address => uint256) public totalAllowances;

    //construtor
    constructor(){
        balances[msg.sender] = totalSupply_ ;
        owner = msg.sender;
    }

    //modificador que verifica se quem chamou a função foi o dono do contrato
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    //verifica se o endereço é válido
    modifier isValidAddress(address account) {

        require(account != address(0), "ERRO: Invalid address!");
        _;

    }

    //modificador que checa se há saldo suficiente para a transação
    modifier enoughBalance(address account, uint256 amount) {
        
        require(amount <= balances[account], 'ERRO: Account does not have enough balance!');
        _;

    }

    //modificador que verifica se o valor permissionado é suficiente
    modifier enoughAllowance(address account, uint256 amount) {

        require(amount <= allowed[account][msg.sender], 'ERRO: Account does not have enough allowance!');
        _;

    }

    //método do tipo "get" que retorna o totalSupply_ do contrato
    function totalSupply() public override view returns( uint256){
        return totalSupply_;
    }

    //método do tipo "get" que retorna a quantidade de tokens que uma conta possui
    function balanceOf(address tokenOwner) public override view returns (uint256){
        return balances[tokenOwner];
    }

    //realiza uma transferência
    function transfer(address receiver, uint256 amount) public override enoughBalance(msg.sender, amount) returns (bool){

        //recalcula a quantidade de tokens do recebedor e do remetente
        balances[msg.sender] -= amount;
        balances[receiver] += amount;

        //consolida a transferência
        emit Transfer(msg.sender, receiver, amount);
        return true;

    }

    function approve(address delegate, uint256 amount) public override returns (bool) {
        // Verifica se a nova soma total das allowances não excede o saldo do usuário
        uint256 currentAllowance = allowed[msg.sender][delegate];
        uint256 newTotalAllowances = totalAllowances[msg.sender] - currentAllowance + amount;

        require(newTotalAllowances <= balances[msg.sender], "ERRO: Soma total das allowances excede o saldo!");

        // Atualiza a soma total das allowances e registra a nova allowance
        totalAllowances[msg.sender] = newTotalAllowances;
        allowed[msg.sender][delegate] = amount;

        emit Approval(msg.sender, delegate, amount);
        return true;
    }

    //verifica a quantia aprovada para a transação dados o endereço de origem e o endereço autorizado a efetuar a transação
    function allowance(address origin, address delegate) public override view returns(uint256){
        return allowed[origin][delegate];
    }

    //uma vez emitida uma autorização, o endereço autorizado pode chamar este método para tranferir um valor menor ou igual à quantia 
    //autorizada para seu próprio endereço
    function transferFrom(address origin, uint256 amount) public override enoughBalance(origin, amount) enoughAllowance(owner, amount) returns(bool){
 
        //recalcula a quantidade de tokens do recebedor e do remetente
        balances[origin] -= amount;
        allowed[origin][msg.sender] -= amount;
        balances[msg.sender] += amount;

        //consolida a transferência
        emit Transfer(origin, msg.sender, amount);
        return true;

    }

    //cria uma dada quantia de tokens e os destina a um dado endereço 
    function mint(address account, uint256 amount) public onlyOwner() isValidAddress(account) {

        //atualiza o totalSupply e o saldo do endereço que recebeu os tokens
        totalSupply_ += amount;
        balances[account] += amount;

        //emite um evento para registrar a ação na blockchain
        emit Transfer(address(0), account, amount);

    }

    //queima uma dada quantia de tokens de um dado endereço
    function burn(address account, uint256 amount) public onlyOwner() isValidAddress(account) enoughBalance(account, amount) {

        //atualiza o totalSupply e o saldo do endereço que recebeu os tokens        
        totalSupply_ -= amount;
        balances[account] -= amount;

        //emite um evento para registrar a ação na blockchain
        emit Transfer(account, address(0), amount);

    }

}   