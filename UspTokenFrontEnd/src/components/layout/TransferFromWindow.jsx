import style from './Window.module.css';
import { useForm } from "react-hook-form"; 
import { Link } from "react-router-dom";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { useState } from 'react';
import { Contract, ethers } from 'ethers';
import {fetchTx, decryptWallet} from '../../utils/utilities.js';

function TransferFromWindow( { provider, contract } ) {

    const { register: registerForm1, handleSubmit: handleSubmitForm1, reset: reset1} = useForm();
    const { register: registerForm2, handleSubmit: handleSubmitForm2, reset: reset2} = useForm();
    const { register: registerForm3, handleSubmit: handleSubmitForm3, reset: reset3} = useForm();
    const [validReceiver, setValidSender] = useState(true);
    const [correctPassword, setCorrectPassword] = useState(true);
    const [enoughBalance, setEnoughBalance] = useState(false);
    const [senderBalance, setSenderBalance] = useState(false);
    const [allowance, setAllowance] = useState(false);
    const [senderNotFound, setSenderNotFound] = useState(false);
    const [transferFromStep, setTransferFromStep] = useState(1);
    const [transferFromAmount, setTransferFromAmount] = useState(null);
    const [sender, setSender] = useState(null);
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
          credentials: "include",
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
            setTransferFromStep(4);
    
            const wallet = await decryptWallet(JSON.stringify(userWallet), data.senha);
            wallet.connect(provider);
            contract.connect(wallet);
    
            try{
    
                //extrai o signer da carteira
                const signer = wallet.connect(provider);
                
                //conecta a instância do contrato com o signer para que seja possível enviar transações
                const newContract = contract.connect(signer);
      
                //envia a transação
                const tx = await newContract.transferFrom(sender.enderecoEthereum, ethers.parseEther(transferFromAmount));
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
                  setTransferFromStep(5);              
                } else {
                  setTransferFromStep(6);              
                }              
      
            } catch(error) {
    
                setTransferFromStep(6);
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

    function resetTranferFrom() {

        setTransferFromStep(1);
        setSender(null);
        setTransferFromAmount(null);
        reset1();
        reset2();
        reset3();
    
    }
    
    function setTransferFromParams(data) {

        setTransferFromAmount(data.value);
        setTransferFromStep(3);
    
    }
    
    function handleChange(event) {
      
        if(Number(event.target.value) > senderBalance || event.target.value <= 0 || !event.target.value || event.target.value > allowance)  {
          setEnoughBalance(false);
        }else {
          setEnoughBalance(true);
        }
        
    }

    const getSender = async (key) => {

        fetch(import.meta.env.VITE_BASE_URL+'/tx', {
          method: 'POST',
          credentials: "include",
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
            .then(async (dados) => {
    
              const sender = {
    
                nome: dados.nome,
                enderecoEthereum: dados.endereco_ethereum
    
              };
    
              if(sender.enderecoEthereum) {
    
                setSender(sender);
                setValidSender(true);
                setSenderNotFound(false);
                setTransferFromStep(2);

                //consultar saldo do sender pra ver se a quantidade que estou digitando é maior que aquele saldo
                const balance = await contract.balanceOf(sender.enderecoEthereum);
                const numericBalance = parseFloat(ethers.formatEther(balance));  
                setSenderBalance(numericBalance);

                const userAllowance = await contract.allowance(sender.enderecoEthereum, userAddress);
                const numericAllowance = parseFloat(ethers.formatEther(userAllowance));  
                setAllowance(numericAllowance);
    
              }else {
    
                setValidSender(false);
    
              }
    
            })
              .catch(error => {
    
                setSenderNotFound(true);
                console.error('Ocorreu um erro:', error);
                reset1();
    
              });
      }
    
    return(

        <>
            {
                  transferFromStep === 1 &&(
                  
                    <div className={style.txContainer}>
                      <h2 className={style.txText}>Tranferir Tokens de Terceiros</h2>
                      <form className={style.form} onSubmit={handleSubmitForm1(getSender)}>
                        <label className={style.label} htmlFor="keytransferfrom">De qual conta deseja transferir os tokens?</label>
                        <input className={style.input} id="keytransferfrom" {...registerForm1("key")} placeholder="E-mail / Nusp / Endereço Ethereum"/>
                        {
                          senderNotFound &&(
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
                  transferFromStep === 2 &&(
                  
                    <div className={style.txContainer}>
                      <button className={style.backIconButton} onClick={() => setTransferFromStep(1)}><IoArrowBackCircleSharp className={style.backIcon}/></button>
                      <h2 className={style.txText}>Tranferir Tokens de Terceiros</h2>
                      <form className={style.form} onSubmit={handleSubmitForm2(setTransferFromParams)} onChange={handleChange}>
                        <label className={style.label} htmlFor="value">Quanto tokens deseja tranferir?</label>
                        <input className={style.input} type="number" step={0.01} id="value" {...registerForm2("value")} placeholder="Digite o Valor" autoComplete="off"/>
                        <p>Saldo disponível: {senderBalance < allowance ? senderBalance : allowance}</p>
                        <input className={style.input} type="submit" value="Continuar" disabled={!enoughBalance}/>
                      </form>
                    </div>
                  
                )}

                {
                  transferFromStep === 3 &&(
                    <div className={style.txContainer}>
                      <button className={style.backIconButton} onClick={() => setTransferFromStep(2)}><IoArrowBackCircleSharp className={style.backIcon}/></button>
                      <h2 className={style.txText}>Revisar Operação</h2>
                      <p>Tranferir da conta de {sender.nome}?</p>
                      <p>Endereço: {sender.enderecoEthereum.substring(0,6)+ '...' + sender.enderecoEthereum.substring(sender.enderecoEthereum.length-4)}</p>
                      <p>Quantia: {transferFromAmount} U$PT</p>
                      <form className={style.form} onSubmit={handleSubmitForm3(authentication)}>
                        <label className={style.label} htmlFor="senha">Insira sua senha para confirmar a operação:</label>
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
                  transferFromStep === 4 &&(
                    <div className={style.txContainer}>
                      <h2 className={style.txText}>Finalizando Operação</h2>
                      <p>Aguarde a transação ser confirmada...</p>
                      <div className={style.loader}></div>
                    </div>
                  
                )}
                
                {
                  transferFromStep === 5 &&(

                      <div className={style.txContainer}>
                      <h2 className={style.txText}>Operação concluída ✔</h2>
                      <p>Valor {transferFromAmount} U$PT</p>
                      <p>Usuário: {sender.nome}</p>
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
                      <button className={style.button} onClick={resetTranferFrom}>Nova Operação</button>
                    </div>
                  
                )}

                {
                  transferFromStep === 6 &&(

                    <div className={style.txContainer}>
                      <h2 className={style.txText}>A operação falhou = (</h2>
                      <p>Verifique se você possui Ether suficiente para realizar a transação e tente novamente.</p>
                      <button className={style.button} onClick={resetTranferFrom}>Nova Operação</button>
                    </div>
                  
                )}
                
        </>
        
    )
}

export default TransferFromWindow