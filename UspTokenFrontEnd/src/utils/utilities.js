import { ethers } from 'ethers';

export async function fetchTransactions() {

  const endBlock = 'latest';

  const url = `https://api-sepolia.etherscan.io/api?module=account&action=tokentx&contractaddress=${import.meta.env.VITE_CONTRACT_ADDRESS}&apikey=${import.meta.env.VITE_API_KEY}`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao carregar os dados');
    }

    const data = await response.json();

    if (data.status !== '1' && data.message !== 'No records found') {
      throw new Error(data.message);
    }

    const transactions = data.result;
    return transactions;

  } catch (error) {

    console.error('Ocorreu um erro:', error);
    return [];
    
  }

}

export async function fetchTxByAddress(address) {

    const endBlock = 'latest';
    const url = `https://api-sepolia.etherscan.io/api?module=account&action=tokentx&contractaddress=${import.meta.env.VITE_CONTRACT_ADDRESS}&address=${address}&page=1&offset=10000&startblock=${import.meta.VITE_CONTRACT_BLOCK}&endblock=${endBlock}&sort=asc&apikey=${import.meta.env.VITE_API_KEY}`;
    try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      
        if (!response.ok) {
          throw new Error('Erro ao carregar os dados');
        }
      
        const data = await response.json();

        if (data.status !== '1' && data.message !== 'No records found') {
            throw new Error(data.message);
        }
      
        const transactions = data.result;
        return transactions;
    
    } catch (error) {
    
        console.error('Ocorreu um erro:', error);
        return [];
    
    }

}

export async function fetchTx(hash) {

    const url = `https://api-sepolia.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${hash}&apikey=${import.meta.env.VITE_API_KEY}`;
    //const url = `https://api-sepolia.etherscan.io/api?module=proxy&action=eth_getTransactionReceipt&txhash=${hash}&apikey=${import.meta.env.VITE_API_KEY}`;

    try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      
        if (!response.ok) {
          throw new Error('Erro ao carregar os dados');
        }
      
        const data = await response.json();
        const transaction = data.result;
        const input = transaction.input;

        const params = input.slice(10);
        const toAddress = "0x" + params.slice(0, 64).slice(24); 
        const valueHex = "0x" + params.slice(64); 
        transaction.amount = BigInt(valueHex).toString();
        transaction.to = toAddress;
        transaction.transactionIndex = parseInt(transaction.transactionIndex, 16);
        return transaction;
    
    } catch (error) {
    
        console.error('Ocorreu um erro:', error);
        return [];
    
    }

}

/*
export async function fetchTransactions(blockNumberEnd, provider, contract) {

    try {

        const blockInterval = 10000; //consultar blocos em intervalos de 10000 blocos
        const blockNumberStart = await provider.getBlockNumber();

        let transferEvents = [];
        let numTransactions = 0;

        while (blockNumberEnd < blockNumberStart && numTransactions < 10) {

            let fromBlock = blockNumberStart;
            let toBlock = blockNumberStart+blockInterval;

            //console.log(`Consultando blocos de ${fromBlock} a ${toBlock}`);

            let newTransferEvents = await contract.queryFilter(contract.filters.Transfer(), fromBlock, toBlock);
            
            for (let index = newTransferEvents.length-1; index >= 0 ; index--) {
                const event = newTransferEvents[index];
                const transaction = await provider.getTransaction(event.transactionHash);
                const receipt = await provider.getTransactionReceipt(event.transactionHash);
                const transfer = {
                    transactionHash: event.transactionHash,
                    transactionIndex: event.transactionIndex,
                    from: event.args.from,
                    to: event.args.to,
                    amount:  Number(event.args.tokens)/(1000000000000000000),
                    block: event.blockNumber,
                    gasPrice : Number(transaction.gasPrice)/(1000000000),
                    gasUsed : Number(receipt.gasUsed)
                }
                if(numTransactions < 10){
                    transferEvents.push(transfer);
                    numTransactions++;
                }
            }
            
            blockNumberStart -= blockInterval;
        }

        return transferEvents;
        
    } catch (error) {
        console.error("Ocorreu um erro:", error);
    }

}
*/
export async function generateWallet() {

    // Criar uma instância de HDNodeWallet com uma chave privada aleatória
    const wallet = ethers.Wallet.createRandom();
    
    return wallet;

}

export async function generateWalletFromMnemonic(mnemonic) {

    // Criar uma instância de HDNodeWallet a partir de uma frase mnemônica
    const wallet = ethers.Wallet.fromPhrase(mnemonic);
    
    return wallet;

}

export async function encryptWallet(wallet, password) {

    //Criptografar uma carteira com base na senha do usuário
    const encriptedWallet = await wallet.encrypt(password);

    return encriptedWallet;

}

export async function decryptWallet(wallet, password) {

    //Descriptografar uma carteira com base na senha do usuário
    const decriptedWallet = await ethers.Wallet.fromEncryptedJson(wallet, password);

    return decriptedWallet;

}

export function isNusp(key) {

   const regexCodigo = /^\d{8}$/;
   return regexCodigo.test(key);

}

export function isEthereumAddress(key) {

    const regexEthereumAddress = /^0x[0-9a-fA-F]{40}$/;
    return regexEthereumAddress.test(key);
 
}

export function isTxHash(key) {

    const regexEthereumAddress = /^0x[0-9a-fA-F]{64}$/;
    return regexEthereumAddress.test(key);
 
}

export function isEmail(key) {

    const regexEmail = /^[^\s@]+@usp.br$/;
    return regexEmail.test(key);

}

export function isName(key) {

    const regexName = /^([A-Z]*[a-z]*)( [A-Z]*[a-z]*)*$/;
    return regexName.test(key);

}

/*
export async function getHolders(contract) {

    let holders = [];

    contract.on("Transfer", (from, to, amount, event) => {
        console.log("Evento Recebido:", event);
        console.log("from:", from);
        console.log("to:", to);
        console.log("amount:", amount);

        if(from !== 0 && to !== 0) {
            
            let newHolder = true;
            for (let index = 0; index < holders.length; index++) {

                const holder = holders[index];
                if(holder === to) {
                    newHolder = false;
                }

                if(contract.balanceOf(from) === 0){//ethers.constants.AddressZero
                    array.splice(index, 1);
                }
            }

            if(newHolder) {
                holders.push(to);
            }
        }
    });

    return holders.length;

 } */