import { Link } from "react-router-dom"
import { useState } from 'react';

import style from './NewUserPage.module.css'

function NewUserPage() {

    const userDataStr = localStorage.getItem('user');
    const userData = JSON.parse(userDataStr);
    const carteiraStr = localStorage.getItem('carteira');
    const carteira = JSON.parse(userDataStr);

    const [isChecked, setIsChecked] = useState(false);

    let words = [];
    if (userData && userData.mnemonico) {
        words = userData.mnemonico.phrase.trim().split(" ");
    }

    const handleCheckboxChange = () => {
        setIsChecked(!isChecked); // Inverte o estado da checkbox
    };

    const getToken = async () => {

        fetch(import.meta.env.VITE_BASE_URL+'/new-user-token', {
  
          method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(userData),
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
  
              if(data.auth) {
                sessionStorage.setItem('token', JSON.stringify(data.token));
                sessionStorage.setItem('nusp', JSON.stringify(userData.nusp));
                sessionStorage.setItem('nome', JSON.stringify(userData.nome));
                sessionStorage.setItem('endereco_ethereum', JSON.stringify(userData.enderecoEthereum));
                sessionStorage.setItem('carteira', JSON.stringify(carteira));
                localStorage.clear();
                window.location.assign("/profile");
     
              }
            })
              .catch(error => {
  
                console.error('Ocorreu um erro:', error);
  
              });
    }

   
    return(
        <div className={style.container}>
            <h1 className={style.title}>Bem-vindo(a) {userData.nome.trim().match(/^[^\s]+/)}!</h1>
            <p className={style.text}>Essa é sua frase secreta de recuperação:</p>
            <div className={style.phrase}>
                {
                    words.map((word, index) => (
                        <p key={index} className={style.word}>{word}</p>
                    ))
                }
            </div>
            <p className={style.warning}><b>*ATENÇÂO:</b> É sua responsabilidade guardar essa frase em segurança!</p>
            <div className={style.checkBoxContainer}>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={handleCheckboxChange}
                  className={style.checkBox}
                />
                <label className={style.agreement}>Estou ciente de que minha frase secreta não pode ser recuperada.</label>
            </div>
            <button onClick={!isChecked ? (e) => {
                e.preventDefault(); 
                } 
                : getToken} disabled={!isChecked} className={style.button}>Continuar</button>
        </div>
    )
}

export default NewUserPage

