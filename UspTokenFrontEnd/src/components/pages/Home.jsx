import {fetchTransactions} from '../../utils/utilities.js'
import React, { useState, useEffect } from 'react';
import ListaTransacoes from '../layout/ListaTransacoes.jsx';
import { RiCoinsFill } from "react-icons/ri";
import { PiClockCounterClockwiseBold } from "react-icons/pi";
import { FaHandHoldingUsd } from "react-icons/fa";
import { MdNavigateNext } from "react-icons/md";
import { MdNavigateBefore } from "react-icons/md";
import style from './Home.module.css'

function Home( { contract } ) {

    const [transferEvents, setTransferEvents] = useState(null);
    const [transferEventsPage, setTransferEventsPage] = useState(null);
    const [totalSupply, setTotalSupply] = useState(null);
    const [totalTransactions, setTotalTransactions] = useState(null);
    const [totalHolders, setTotalHolders] = useState(null);
    const [pageTx, setPageTx] = useState(1);
    const [totalPagesTx, setTotalPagesTx] = useState(10);

    useEffect(() => {
        
        function getTransferEventsByPage(){

            if(transferEvents != null) {

                const eventsPage = transferEvents.slice(10*(pageTx-1), 10*(pageTx-1)+10);
                setTransferEventsPage(eventsPage);

            }
            

        }

        getTransferEventsByPage();
        
    }, [pageTx, transferEvents]);

    useEffect(() => {
        
        async function getTransferEvents(){

            try{

                const logEvents = await fetchTransactions();
                setTotalTransactions(logEvents.length);
                setTotalPagesTx(Math.ceil(logEvents.length / 10));
                const propriedades = Object.keys(logEvents).filter(key => key !== "length");
                const numeros = propriedades.map(Number).sort((a, b) => b - a);
                const events = numeros.map(num => logEvents[num]);
                setTransferEvents(events);

            }catch(error) {
                console.error("Ocorreu um erro:", error);
            }

        }

        getTransferEvents();
        
    }, []);

    useEffect(() => {
        
        async function getTotalSupply(){

            const url = `https://api-sepolia.etherscan.io/api?module=stats&action=tokensupply&contractaddress=${import.meta.env.VITE_CONTRACT_ADDRESS}&apikey=${import.meta.env.VITE_API_KEY}`;

            fetch(url, {
        
                method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
            })    
              .then(response => {
        
                if (!response.ok) {
                  throw new Error('Erro ao carregar os dados');
                }
                if (response.status !== 204) { // 204: No Content
                  return response.json();
                }
        
                return null;
              })
              .then( async (data) => {
        
                const totalSupply = await contract.totalSupply();
                const decimals = await contract.decimals();
                const divisor = BigInt(10) ** decimals;
                setTotalSupply(Number(totalSupply/divisor));
        
              })
                .catch(error => {
        
                  console.error('Ocorreu um erro:', error);
        
                });

        }

        getTotalSupply();
        
    }, []);

    useEffect(() => {
        
        async function getTotalHolders(){

            fetch(import.meta.env.VITE_BASE_URL+'/get-num-users', {

                method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },

              })    
                  .then(response => {
        
                    if (!response.ok) {
                      throw new Error('Erro ao carregar os dados');
                    }
                    if (response.status !== 204) { // 204: No Content
                      return response.json();
                    }
        
                    return null;
                  })
                  .then(data => {
        
                    setTotalHolders(data.numUsers);
        
                  })
                    .catch(error => {
        
                      console.error('Ocorreu um erro:', error);
        
                    });

        }

        getTotalHolders();
        
    }, []);

    return(
        <>
            <div className={style.container}>
                <div className={style.info_container}>
                    <div className={style.info}>
                        <p className={style.text}> <RiCoinsFill className={style.icon} /> Número de tokens em circulação</p>
                        <p className={style.value}>{totalSupply} U$PT</p>
                    </div>
                    <div className={style.info}>
                        <p className={style.text}> <PiClockCounterClockwiseBold className={style.icon} /> Número total de transações</p>
                        <p className={style.value}>{totalTransactions}</p>
                    </div>
                    <div className={style.info}>
                        <p className={style.text}> <FaHandHoldingUsd className={style.icon} /> Número de titulares</p>
                        <p className={style.value}>{totalHolders}</p>
                    </div>
                </div>
                <div className={style.list}>
                    <h3 className={style.title}>Últimas Transações realizadas</h3>
                    <hr />
                    {transferEventsPage ? (
                        <ListaTransacoes events={transferEventsPage} />
                    ) : (
                        <div className={style.loader}></div>
                    )}
                    <div className={style.txPageNav}>
                        <button className={style.pageBtt} onClick={ () => { pageTx == 1 ? setPageTx(1) : setPageTx(pageTx-1) } }><MdNavigateBefore className={style.pageIcon}/></button>
                        <p>Página {pageTx} de {totalPagesTx}</p>
                        <button className={style.pageBtt} onClick={ () => { pageTx == totalPagesTx ? setPageTx(totalPagesTx) : setPageTx(pageTx+1) } }><MdNavigateNext className={style.pageIcon}/></button>
                    </div>
                </div>
            </div>
        </>
    )
}


export default Home