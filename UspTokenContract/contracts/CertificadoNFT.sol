// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

// contract address: 0x82778B2dd60f760ECC97c15991b996670fa20C1b

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./IERC20.sol";

contract CertificadoNFT is ERC721, Ownable {
    uint256 private _tokenIdCounter;
        
    // Endereço do contrato do seu token ERC20
    IERC20 private immutable _erc20Token;
    
    // O endereço do token ERC20, agora como uma variável local no construtor.
    // Assim, ele pode ser usado para inicializar a variável 'immutable'.

    // Mapeamento de tokenId para os metadados do certificado
    struct CertificateMetadata {
        uint256 extracurricularHoursCompleted;
        string activityName;
        string description;
        uint256 issueDate;
        string ipfsHash;
    }
    mapping(uint256 => CertificateMetadata) public certificateDetails;

    // Custo em tokens ERC20 por hora extra curricular (Ex: 1 token por hora)
    uint256 public costPerExtraCurricularHour;

    // Evento para notificar a emissão de um novo certificado
    event CertificateMinted(
        address indexed recipient,
        uint256 indexed tokenId,
        uint256 extracurricularHoursCompleted,
        string activityName
    );

    constructor() ERC721("USP NFT Certificate", "USP-NFT") {
        // Endereço do contrato USPToken, cravado diretamente no construtor.
        address erc20TokenAddress = 0x2A23B5aC7c03312A6CA0dcCfC2609AeBE7634A9E;
        
        // Inicializa a variável 'immutable' com o endereço fixo.
        _erc20Token = IERC20(erc20TokenAddress);
        costPerExtraCurricularHour = 1 * 10**18; // Define o custo inicial como 1 token (ajuste conforme necessário)
    }

    /**
     * @dev Função para o administrador definir o custo por hora extra curricular.
     * Somente o dono do contrato pode chamar.
     * @param newCost O novo custo em tokens ERC20 por hora.
     */
    function setCostPerExtraCurricularHour(uint256 newCost) public onlyOwner {
        require(newCost > 0, "Custo por hora deve ser maior que zero");
        costPerExtraCurricularHour = newCost;
    }

    /**
     * @dev Função para cunhar um novo NFT de certificado.
     * Somente o dono do contrato (universidade) pode chamar.
     * O 'recipient' deve ter previamente transferido os tokens ERC20 para este contrato.
     * @param recipient Endereço do aluno que receberá o NFT.
     * @param extracurricularHours Quantidade de horas extra curriculares.
     * @param activity Nome da atividade.
     * @param description Descrição detalhada.
     * @param ipfsHash Hash IPFS para os metadados.
     */
    function mintCertificate(
        address recipient,
        uint256 extracurricularHours,
        string calldata activity,
        string calldata description,
        string calldata ipfsHash
    ) public onlyOwner {
        require(recipient != address(0), "Endereco do destinatario invalido");
        require(extracurricularHours > 0, "Numero de horas deve ser maior que zero");
        require(bytes(activity).length > 0, "Nome da atividade nao pode ser vazio");
        require(bytes(ipfsHash).length > 0, "Hash IPFS nao pode ser vazio");

        // Calcular o custo total em tokens ERC20
        uint256 totalCost = extracurricularHours * costPerExtraCurricularHour;

        // Verificar se o contrato recebeu tokens suficientes do aluno
        uint256 contractBalanceOfRecipient = _erc20Token.balanceOf(address(this));
        require(contractBalanceOfRecipient >= totalCost, "Saldo insuficiente de tokens no contrato para cobrir o custo");

        // Transferir os tokens do contrato de volta para o dono (universidade)
        bool success = _erc20Token.transfer(owner(), totalCost);
        require(success, "Falha ao transferir tokens para o dono do contrato");

        // Obter o próximo ID de token
        _tokenIdCounter++;
        uint256 newItemId = _tokenIdCounter;

        // Cunhar o NFT para o aluno
        _safeMint(recipient, newItemId);

        // Armazenar os metadados do certificado
        certificateDetails[newItemId] = CertificateMetadata({
            extracurricularHoursCompleted: extracurricularHours,
            activityName: activity,
            description: description,
            issueDate: block.timestamp,
            ipfsHash: ipfsHash
        });

        // Emitir o evento
        emit CertificateMinted(recipient, newItemId, extracurricularHours, activity);
    }

    /**
     * @dev Função para obter a URI dos metadados do token.
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "URI query for nonexistent token");
        // Concatena "ipfs://" com o hash IPFS armazenado nos metadados
        return string(abi.encodePacked("ipfs://", certificateDetails[tokenId].ipfsHash));
    }

    // Permite que o dono do contrato retire tokens ERC20 que foram transferidos para este contrato.
    function withdrawERC20Tokens() public onlyOwner {
        uint256 balance = _erc20Token.balanceOf(address(this));
        require(balance > 0, "Nenhum token ERC20 para sacar");
        _erc20Token.transfer(owner(), balance);
    }
}