import { Link } from "react-router-dom"
import { useForm } from "react-hook-form" 
import { useState, useEffect} from "react";
import { IoSearchSharp } from "react-icons/io5";
import { SearchContext } from "./SearchContext";
import { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 

import styles from './NavBar.module.css'
import { isEthereumAddress, isName, isNusp, isEmail, isTxHash, fetchTx, fetchTxByAddress } from '../../utils/utilities.js';

function NavBar() {

    const location = useLocation();
    const navigate = useNavigate();
    const { searchResults, setSearchResults } = useContext(SearchContext);
    const { register: registerForm, handleSubmit: registerFormhandleSubmitForm, reset: reset} = useForm();
    const [logged, setLogged] = useState(false);

    const tokenStr = sessionStorage.getItem('token');
    const token = JSON.parse(tokenStr);

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function updateLocalStorage(newData) {
        localStorage.setItem('results', JSON.stringify(newData));
        window.dispatchEvent(new Event('localStorageUpdated'));
    }

    function normalizeToArray(key) {

      if (Array.isArray(key)) {

        if (key.every(item => typeof item === 'object' && 'endereco_ethereum' in item)) {
            return key.map(item => item.endereco_ethereum);
          }

          return key;
        }
      
        if (typeof key === 'object' && 'endereco_ethereum' in key) {
          return [key.endereco_ethereum];
        }
      
        if (typeof key === 'string' && /^0x[a-fA-F0-9]{40}$/.test(key)) {
          return [key];
        }
      
        return [];
      }

    async function getAddressByKey(key) {

        let searchExpression = {
            key: null,
            type: null,
        };

        if(isEthereumAddress(key)) {

            return key;

        }else if(isEmail(key)) {
            
            searchExpression.key = key;
            searchExpression.type = "email";

        }else if(isName(key)) {
            
            searchExpression.key = key;
            searchExpression.type = "nome";

        }else if(isNusp(key)) {
            
            searchExpression.key = key;
            searchExpression.type = "nusp";

        }

        const address = key = await fetch(import.meta.env.VITE_BASE_URL+'/get-address', {
        
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': token
            },
            body: JSON.stringify(searchExpression)
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
            .catch(error => {

              console.error('Ocorreu um erro:', error);

            });

        return address;
    }

    async function handleSearch(data){

      localStorage.removeItem('results');
      let results = null;
        let txData = null;
        if(isNusp(data.key) || isEmail(data.key) || isName(data.key) || isEthereumAddress(data.key)) {
            
            const key = await getAddressByKey(data.key);
            const keyArray = normalizeToArray(key);
            
            const allTransactions = [];

            for (const address of keyArray) {

                try {

                    const txs = await fetchTxByAddress(address);
                    allTransactions.push(...txs); // Concatena os arrays retornados
                
                } catch (error) {

                    console.error(`Erro ao buscar transações para o endereço ${address}:`, error);
                
                }
            }
            results = allTransactions;
            setSearchResults(results);
            //setSearchResultsType("txListLogs");
            //navigate("/search/"+data.key);

        }else if(isTxHash(data.key)){
            
            try {
                const results = await fetchTx(data.key);
                //setSearchResultsType("txLog");
                txData = {
                    hash: results.hash,
                    transactionIndex: results.transactionIndex,
                    from: results.from,
                    to: results.to,
                    amount: results.amount,
                    block: Number(results.blockNumber),
                    gasUsed: BigInt(results.gas),
                    gasPrice: BigInt(results.gasPrice),
                };
              
            } catch (error) {
                console.error("Erro ao buscar transação:", error);
            }
        }
        // reset();
        if(txData == null){
          updateLocalStorage(results);
          navigate("/search/"+data.key);
        }else {
          navigate(`/tx/${data.key}`, { state: txData });
        }
        
    }  

    useEffect(() => {
        
        async function checkToken(){
  
            if(token) {
                fetch(import.meta.env.VITE_BASE_URL+'/check-token', {
        
                    method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-access-token': token
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
        
                    setLogged(JSON.stringify(data.validToken))
        
                  })
                    .catch(error => {
        
                      setLogged(false);
                      console.error('Ocorreu um erro:', error);
        
                    });
        
            } else {
        
                setLogged(false);
        
            }
          
        }
  
        checkToken();
        
      }, [token]);

      const handleLogOut = async () => {

        fetch(import.meta.env.VITE_BASE_URL+'/logout', {
        
            method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token
                },
        })    
          .then(async (response) => {

            if (!response.ok) {
              throw new Error('Erro ao carregar os dados');
            }
            if (response.status !== 204) { // 204: No Content
              return response.json();
            }

            return null

          })
            .catch(error => {

              setLogged(false);
              console.error('Ocorreu um erro:', error);

            });
       
            sessionStorage.clear();
            alert("Logout realizado com sucesso!");
            await delay(1000);
            window.location.assign("/");
      };

    return (
        <nav className={styles.navbar}>
            <Link className={styles.linkLogo} to="/">
                <img className={styles} src={"/logo.png"} width={60} />
            </Link>
            <div className={styles.searchContainer}>
                <form className={styles.form} onSubmit={registerFormhandleSubmitForm(handleSearch)}>
                        <button type="submit" className={styles.searchIconButton}>
                            <IoSearchSharp className={styles.searchIcon}/>
                        </button>
                        <input className={styles.input} id="keytx" {...registerForm("key")} placeholder="E-mail / Nusp / Endereço Ethereum / Nome / Tx Hash"/>
                </form>
            </div>
            <div className={styles.links}>
                <ul className={styles.list}>
                    <li className={styles.item}>
                        <Link to="/">Home</Link>
                    </li>
                    <li className={styles.item}>
                        <Link to="/sobre">Sobre</Link>
                    </li>
                    <li className={styles.item}>
                        <Link to="/contato">Contato</Link>
                    </li>
                </ul>                
            </div>
            <div>
            {
                    !logged &&(
                        <ul className={styles.list}>
                            <li>
                                <Link to="/login"><button className={styles.button}>Login</button></Link>
                            </li>
                            <li>
                                <Link to="/signup"><button className={styles.button}>Sign In</button></Link>
                            </li>
                        </ul>
                    )
                }

                {
                    logged &&(
                        <ul className={styles.list}>
                            <li>
                               <button onClick={handleLogOut} className={styles.button}>Logout</button>
                            </li>
                            <li>
                                <Link to="/profile"><button className={styles.button}>Minha Página</button></Link>
                            </li>
                            <li>
                                <Link to="/delete-account"><button className={styles.button}>Excluir Conta</button></Link>
                            </li>
                        </ul>
                    )
                }
            </div>
        </nav>
    )

}

export default NavBar