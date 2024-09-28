import style from './Window.module.css';
import { useForm } from "react-hook-form";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { Link } from "react-router-dom";
import { useState } from 'react';
import { ethers } from 'ethers';
import {fetchTx, decryptWallet} from '../../utils/utilities.js'

function TransactionWindow( { uspCoinBalance, provider, contract } ) {

    const { register: registerForm1, handleSubmit: handleSubmitForm1, reset: reset1} = useForm();
    const { register: registerForm2, handleSubmit: handleSubmitForm2, reset: reset2} = useForm();
    const { register: registerForm3, handleSubmit: handleSubmitForm3, reset: reset3} = useForm();
    const [validReceiver, setValidReceiver] = useState(true);
    const [enoughBalance, setEnoughBalance] = useState(false);
    const [correctPassword, setCorrectPassword] = useState(true);
    const [receiverNotFound, setReceiverNotFound] = useState(false);
    const [transactionStep, setTransactionStep] = useState(1);
    const [txAmount, setTxAmount] = useState(null);
    const [receiver, setReceiver] = useState(null);
    const [transaction, setTransaction] = useState(null);

    const tokenStr = sessionStorage.getItem('token');
    const token = JSON.parse(tokenStr);
  
    const userWalletStr = sessionStorage.getItem('carteira');
    const userWallet = JSON.parse(userWalletStr);

    const userAddressStr = sessionStorage.getItem('endereco_ethereum');
    const userAddress = JSON.parse(userAddressStr);

    const authentication = async (data) => {

        fetch(import.meta.env.VITE_BASE_URL+'/confirm-tx', {
          method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token
                },
                body: JSON.stringify(data),
        })
        .then(response => {
    
          if (!response.ok) {
    
            throw new Error('Erro ao realizar autenticação');
    
          }
    
          if (response.status !== 204) { // 204: No Content
    
            return response.json();
    
          }
    
          return null;
    
        })
        .then( async (dados) => {
    
          if(dados.auth) {
            
            setCorrectPassword(true);
            setTransactionStep(4);

            const wallet = await decryptWallet(JSON.stringify(userWallet), data.senha);
            wallet.connect(provider);
            contract.connect(wallet);
    
            try{
    
                //extrai o signer da carteira
                const signer = wallet.connect(provider);
                
                //conecta a instância do contrato com o signer para que seja possível enviar transações
                const newContract = contract.connect(signer);
      
                //envia a transação
                const tx = await newContract.transfer(receiver.enderecoEthereum, ethers.parseEther(txAmount));
                const receipt = await tx.wait();
                if(receipt.status == 1) {

                  try {
                    const results = await fetchTx(receipt.hash);
                    //setSearchResultsType("txLog");
                    const txData = {
                        hash: receipt.hash,
                        transactionIndex: results.transactionIndex,
                        from: results.from,
                        to: results.to,
                        amount: results.amount,
                        block: Number(results.blockNumber),
                        gasUsed: BigInt(results.gas),
                        gasPrice: BigInt(results.gasPrice),
                    };
                    setTransaction(txData);
                  
                  } catch (error) {
                      console.error("Erro ao buscar transação:", error);
                  }
                  setTransactionStep(5);              
                } else {
                  setTransactionStep(6);              
                }
      
            } catch(error) {
    
                setTransactionStep(6);
                console.error("Aconteceu um erro: ", error);
      
            }
    
          }else {
            setCorrectPassword(false);
          }
    
        })
          .catch(error => {
    
            setCorrectPassword(false);
            console.error('Ocorreu um erro:', error);
            reset3();
    
          });
    
      
    }

    function resetTransaction() {

        setTransactionStep(1);
        setReceiver(null);
        setTxAmount(null);
        reset1();
        reset2();
        reset3();
    
    }
    
    function setTxParams(data) {
    
        setTxAmount(data.value);
        setTransactionStep(3);
    
    }

    function handleChange(event) {

        if(Number(event.target.value) > uspCoinBalance || uspCoinBalance == 0 || Number(event.target.value) <= 0)  {
          setEnoughBalance(false);
        }else {
          setEnoughBalance(true);
        }
        
    }

    const getReceiver = async (key) => {

        fetch(import.meta.env.VITE_BASE_URL+'/tx', {
          method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token
                },
                body: JSON.stringify(key),
        })    
            .then(response => {
    
              if (!response.ok) {
    
                throw new Error('Erro ao carregar os dados');
    
              }
    
              if (response.status !== 204) { // 204: No Content
    
                return response.json();
    
              }
    
              if (response.status === 404) { // 404: Not Found
    
                throw new Error('Destinatário não encontrado');
    
              }
    
              return null;
            })
            .then(dados => {
    
              const receiver = {
    
                nome: dados.nome,
                enderecoEthereum: dados.endereco_ethereum
    
              };
    
              if(receiver.enderecoEthereum !== userAddress) {
    
                setReceiver(receiver);
                setValidReceiver(true);
                setReceiverNotFound(false);
                setTransactionStep(2);
    
              }else {
    
                setValidReceiver(false);
    
              }
    
            })
              .catch(error => {
    
                setValidReceiver(true);
                setReceiverNotFound(true);
                console.error('Ocorreu um erro:', error);
                reset1();
    
              });
       
    }
    
    return(

        <>
            {
                  transactionStep === 1 &&(
                  
                    <div className={style.txContainer}>
                      <h2 className={style.txText}>Realizar Transação</h2>
                      <form className={style.form} onSubmit={handleSubmitForm1(getReceiver)}>
                        <label className={style.label} htmlFor="keytx">Para quem deseja enviar?</label>
                        <input className={style.input} id="keytx" {...registerForm1("key")} placeholder="E-mail / Nusp / Endereço Ethereum"/>
                        {
                          receiverNotFound &&(
                            <p>*Destinatário não encontrado</p>
                          )
                        }
                        {
                          !validReceiver &&(
                            <p>*Formato de chave inválido</p>
                          )
                        }
                        <input className={style.input} type="submit" value="Continuar" />
                      </form>
                    </div>
                  
                )}

                {
                  transactionStep === 2 &&(
                  
                    <div className={style.txContainer}>
                      <button className={style.backIconButton} onClick={() => setTransactionStep(1)}><IoArrowBackCircleSharp className={style.backIcon}/></button>
                      <h2 className={style.txText}>Realizar Transação</h2>
                      <form className={style.form} onSubmit={handleSubmitForm2(setTxParams)} onChange={handleChange}>
                        <label className={style.label} htmlFor="value">Quanto deseja Transferir?</label>
                        <input className={style.input} type="number" step={0.01} id="value" {...registerForm2("value")} placeholder="Digite o Valor" autoComplete="off"/>
                        <p>Saldo disponível: {uspCoinBalance}</p>
                        <input className={style.input} type="submit" value="Continuar" disabled={!enoughBalance}/>
                      </form>
                    </div>
                  
                )}

                {
                  transactionStep === 3 &&(
                    <div className={style.txContainer}>
                      <button className={style.backIconButton} onClick={() => setTransactionStep(2)}><IoArrowBackCircleSharp className={style.backIcon}/></button>
                      <h2 className={style.txText}>Revisar Transaferência</h2>
                      <p>Transferir para {receiver.nome}?</p>
                      <p>Endereço: {receiver.enderecoEthereum.substring(0,6)+ '...' + receiver.enderecoEthereum.substring(receiver.enderecoEthereum.length-4)}</p>
                      <p>Quantia: {txAmount} U$PT</p>
                      <form className={style.form} onSubmit={handleSubmitForm3(authentication)}>
                        <label className={style.label} htmlFor="senha">Insira sua senha para confirmar a transação:</label>
                        <input className={style.input} type="password"  id="senha" {...registerForm3("senha")} placeholder="Digite sua senha" autoComplete="off"/>
                        {
                          !correctPassword &&(
                            <p>*Senha incorreta</p>
                          )
                        }
                        <input className={style.input} type="submit" value="Confirmar"/>
                      </form>
                    </div>
                  
                )}

                {
                  transactionStep === 4 &&(
                    <div className={style.txContainer}>
                      <h2 className={style.txText}>Finalizando Transaferência</h2>
                      <p>Aguarde a transação ser confirmada...</p>
                      <div className={style.loader}></div>
                    </div>
                  
                )}
                
                {
                  transactionStep === 5 &&(

                      <div className={style.txContainer}>
                      <h2 className={style.txText}>Transação concluída ✔</h2>
                      <p>Valor {txAmount} U$PT</p>
                      <p>Destinatário: {receiver.nome}</p>
                      {transaction ? (
                        <div>
                        <Link to={"/tx/" + transaction.hash} state={{
                          hash: transaction.hash,
                          transactionIndex: transaction.transactionIndex,
                          from: transaction.from,
                          to: transaction.to,
                          amount: transaction.amount,
                          block: transaction.block,
                          gasUsed: transaction.gasUsed,
                          gasPrice: transaction.gasPrice
                        }}>
                          Visualizar mais detalhes
                        </Link>
                        </div>
                      ) : (
                        <p>Carregando detalhes da transação...</p>
                      )}
                      <br></br>
                      <button className={style.button} onClick={resetTransaction}>Nova Transação</button>
                    </div>
                  
                )}

                {
                  transactionStep === 6 &&(

                    <div className={style.txContainer}>
                      <h2 className={style.txText}>A transação falhou = (</h2>
                      <p>Verifique se você possui Ether suficiente para realizar a transação e tente novamente.</p>
                      <button className={style.button} onClick={resetTransaction}>Nova Transação</button>
                    </div>
                  
                )}

        </>
        
    )
}

export default TransactionWindow