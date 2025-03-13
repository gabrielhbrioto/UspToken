import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { IoSearchSharp, IoMenu } from "react-icons/io5";
import { SearchContext } from "./SearchContext";
import { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRef } from "react";

import styles from './NavBar.module.css';
import { isEthereumAddress, isName, isNusp, isEmail, isTxHash, fetchTx, fetchTxByAddress } from '../../utils/utilities.js';

function NavBar() {

    const location = useLocation();
    const navigate = useNavigate();
    const menuRef = useRef();
    const { searchResults, setSearchResults } = useContext(SearchContext);
    const { register: registerForm, handleSubmit: registerFormhandleSubmitForm, reset: reset } = useForm();
    const [logged, setLogged] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false); // Novo estado para controlar o menu lateral

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

        if (isEthereumAddress(key)) {
            return key;
        } else if (isEmail(key)) {
            searchExpression.key = key;
            searchExpression.type = "email";
        } else if (isName(key)) {
            searchExpression.key = key;
            searchExpression.type = "nome";
        } else if (isNusp(key)) {
            searchExpression.key = key;
            searchExpression.type = "nusp";
        }

        const address = key = await fetch(import.meta.env.VITE_BASE_URL + '/get-address', {
            method: 'POST',
            credentials: "include",
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

    async function handleSearch(data) {
        localStorage.removeItem('results');
        let results = null;
        let txData = null;
        if (isNusp(data.key) || isEmail(data.key) || isName(data.key) || isEthereumAddress(data.key)) {
            const key = await getAddressByKey(data.key);
            const keyArray = normalizeToArray(key);
            const allTransactions = [];

            for (const address of keyArray) {
                try {
                    const txs = await fetchTxByAddress(address);
                    allTransactions.push(...txs);
                } catch (error) {
                    console.error(`Erro ao buscar transações para o endereço ${address}:`, error);
                }
            }
            results = allTransactions;
            setSearchResults(results);
        } else if (isTxHash(data.key)) {
            try {
                const results = await fetchTx(data.key);
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

        if (txData == null) {
            updateLocalStorage(results);
            navigate("/search/" + data.key);
        } else {
            navigate(`/tx/${data.key}`, { state: txData });
        }
    }

    useEffect(() => {
      function handleClickOutside(event) {
          if (menuRef.current && !menuRef.current.contains(event.target)) {
              setMenuOpen(false); // Fecha o menu
          }
      }

      // Adiciona o listener para cliques no documento
      document.addEventListener("mousedown", handleClickOutside);

      // Remove o listener quando o componente é desmontado
      return () => {
          document.removeEventListener("mousedown", handleClickOutside);
      };
  }, [menuRef]);

    useEffect(() => {
        async function checkToken() {
            if (token) {
                fetch(import.meta.env.VITE_BASE_URL + '/check-token', {
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
                        if (response.status !== 204) {
                            return response.json();
                        }
                        return null;
                    })
                    .then(data => {
                        setLogged(JSON.stringify(data.validToken));
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
        fetch(import.meta.env.VITE_BASE_URL + '/logout', {
            method: 'GET',
            credentials: "include",
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': token
            },
        })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error('Erro ao carregar os dados');
                }
                if (response.status !== 204) {
                    return response.json();
                }
                return null;
            })
            .catch(error => {
                setLogged(false);
                console.error('Ocorreu um erro:', error);
            });

        sessionStorage.clear();
        alert("Logout realizado com sucesso!");
        //await delay(1000000);
        window.location.assign("/");
    };

    const toggleMenu = () => setMenuOpen(!menuOpen); // Função para alternar o menu

    return (
      <nav className={styles.navbar}>
          <Link className={styles.linkLogo} to="/">
              <img className={styles} src={"/logo.png"} width={60} />
          </Link>
          <div className={styles.searchContainer}>
              <form className={styles.form} onSubmit={registerFormhandleSubmitForm(handleSearch)}>
                  <button type="submit" className={styles.searchIconButton}>
                      <IoSearchSharp className={styles.searchIcon} />
                  </button>
                  <input className={styles.input} id="keytx" {...registerForm("key")} placeholder="E-mail / Nusp / Endereço Ethereum / Nome / Tx Hash" />
              </form>
          </div>
          <div className={styles.menuIcon} onClick={toggleMenu}>
              <IoMenu size={30} />
          </div>
          <div ref={menuRef} className={`${styles.sideMenu} ${menuOpen ? styles.open : ""}`}>
              <ul className={styles.list}>
                <li><button className={styles.closeButton} onClick={toggleMenu}>X</button> {/* Botão de fechar */}</li>
                  {!logged ? (
                      <>
                          <li><Link to="/login">Login</Link></li>
                          <hr></hr>
                          <li><Link to="/signup">Sign In</Link></li>
                          <hr></hr>
                          <li><Link to="/">Home</Link></li>
                          <hr></hr>
                      </>
                  ) : (
                      <>
                          <li><button onClick={handleLogOut} className={styles.button}>Logout</button></li>
                          <hr></hr>
                          <li><Link to="/profile">Minha Página</Link></li>
                          <hr></hr>
                          <li><Link to="/delete-account">Excluir Conta</Link></li>
                          <hr></hr>
                          <li><Link to="/">Home</Link></li>
                          <hr></hr>
                      </>
                  )}
              </ul>
          </div>
      </nav>
  );
}

export default NavBar;
