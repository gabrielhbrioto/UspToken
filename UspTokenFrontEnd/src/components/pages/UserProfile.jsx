import style from './UserProfile.module.css'
import { Contract, ethers } from 'ethers';
import TransactionWindow from '../layout/TransactionWindow.jsx';
import MintWindow from '../layout/MintWindow.jsx';
import BurnWindow from '../layout/BurnWindow.jsx';
import NavBar from '../layout/NavBar.jsx'
import ApproveWindow from '../layout/ApproveWindow.jsx';
import TransferFromWindow from '../layout/TransferFromWindow.jsx';
import React, { useState, useEffect } from 'react';
import { FaRegCopy } from "react-icons/fa";

function UserProfile( { contract, provider } ) {

  const [activeTab, setActiveTab] = useState('Transaction');
  const [uspCoinBalance, setUspCoinBalance] = useState(null);
  const [ethBalance, setEthBalance] = useState(null);
  const [showUspCoinBalance, setShowUspCoinBalance] = useState(true);
  const [receiverTx, setReceiverTx] = useState(null);
  const [receiverApprove, setReceiverApprove] = useState(null);
  const [senderTransferFrom, setSenderTransferFrom] = useState(null);
  const [receiverMint, setReceiverMint] = useState(null);
  const [receiverBurn, setReceiverBurn] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [copied, setCopied] = useState(false);

  const tabs = [
    { name: 'Transaction', title: 'Transação', component: <TransactionWindow uspCoinBalance={uspCoinBalance} receiver={receiverTx} provider={provider} contract={contract} /> },
    { name: 'Approve', title: 'Aprovar', component: <ApproveWindow uspCoinBalance={uspCoinBalance} receiver={receiverApprove} provider={provider} contract={contract} /> },
    { name: 'TransferFrom', title: 'Transferir de', component: <TransferFromWindow sender={senderTransferFrom} provider={provider} contract={contract} /> },
    ...(isOwner ? [
      { name: 'Mint', title: 'Mintar', component: <MintWindow receiver={receiverMint} provider={provider} contract={contract} /> },
      { name: 'Burn', title: 'Queimar', component: <BurnWindow uspCoinBalance={uspCoinBalance} receiver={receiverBurn} provider={provider} contract={contract} /> }
    ] : []),
  ];
  
  

  const userNameStr = sessionStorage.getItem('nome');
  const userName = JSON.parse(userNameStr);

  const userAddressStr = sessionStorage.getItem('endereco_ethereum');
  const userAddress = JSON.parse(userAddressStr);

  const ethButtonClass = !showUspCoinBalance ? style.clickedButton : style.releasedButton;
  const uspCoinButtonClass = showUspCoinBalance ? style.clickedButton : style.releasedButton;
  const addressCopyButton = copied ? style.addressCopyClickedButton : style.addressCopyReleasedButton;
  const addressText = copied ? style.textCopied : style.textNotCopied;

  const copyText = () => {
      const textToCopy = userAddress; 

      navigator.clipboard.writeText(textToCopy)
          .then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 3000);
          })
          .catch(err => {
              console.error('Falha ao copiar para a área de transferência:', err);
          });
  };

    useEffect(() => {
        
      async function getUspCoinBalance(){

        if(userAddress != null){
          try{

            const balance = await contract.balanceOf(userAddress);
            const numericBalance = parseFloat(ethers.formatEther(balance));
            setUspCoinBalance(numericBalance.toFixed(4));
            
          }catch(error) {
              console.error("Ocorreu um erro:", error);
          }
        }
        
      }

      getUspCoinBalance();
      
    }, [userAddress]);

    useEffect(() => {
        
      async function checkForOwner(){

        if(userAddress != null){
          try{

            const ownerAddress = await contract.owner();

            if(userAddress == ownerAddress)
              setIsOwner(true);

          }catch(error) { 
              console.error("Ocorreu um erro:", error);
          }
        }
        
      }

      checkForOwner();
      
    }, [userAddress]);

    useEffect(() => {
        
      async function getEthBalance() {

        if(userAddress != null){
          try {

            const balance = await provider.getBalance(userAddress);
            const numericBalance = parseFloat(ethers.formatEther(balance));
            setEthBalance(numericBalance.toFixed(4));
            
          } catch (error) {
              console.error("Erro ao consultar saldo:", error);
          }
        }
        
      }
      
      getEthBalance();
      
    }, [userAddress]);

    if (!userName || !userAddress) {
      return <div className={style.loader}></div>;
    }

    return (
      <div className={style.container}>
          <NavBar />
          <div className={style.helloContainer}>
            <div className={style.addressContainer}>
              <button className={addressCopyButton} onClick={() => copyText()}>
                <FaRegCopy />
              </button>
              <p className={addressText}>{userAddress}</p>
            </div>
            <h1 className={style.helloText}>Olá, {userName.trim().match(/^[^\s]+/)}</h1>
            <div className={style.buttonContainer}>
              <button className={uspCoinButtonClass} onClick={() => setShowUspCoinBalance(true)}>
                U$PT
              </button>
              <button className={ethButtonClass} onClick={() => setShowUspCoinBalance(false)}>
                ETH
              </button>
            </div>
            {showUspCoinBalance ? (
              <p className={style.balance}>{uspCoinBalance} U$PT</p>
            ) : (
              <p className={style.balance}>{ethBalance} ETH</p>
            )}
          </div>
          
          {/* Barra de navegação de abas */}
          <div className={style.tabs}>
            {tabs.map((tab, index) => {
              const isActive = tab.name === activeTab;
              const isLeft = tabs[index + 1]?.name === activeTab;
              const isRight = tabs[index - 1]?.name === activeTab;
            
              return (
                <button
                  key={tab.name}
                  className={`${style.tab} 
                    ${isActive ? style.activeTab : ""} 
                    ${isLeft ? style.leftTab : ""} 
                    ${isRight ? style.rightTab : ""}`}
                  onClick={() => setActiveTab(tab.name)}
                >
                  {tab.title}
                </button>
              );
            })}
          </div>
          
          {/* Conteúdo da aba ativa */}
          <div className={style.tabContent}>
            {tabs.find((tab) => tab.name === activeTab)?.component}
          </div>
      </div>
    );
    
}

export default UserProfile