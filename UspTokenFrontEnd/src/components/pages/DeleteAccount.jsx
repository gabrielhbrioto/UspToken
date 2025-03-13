import style from './DeleteAccount.module.css'
import { useForm } from "react-hook-form"; 
import { useState } from 'react';

function DeleteAccount() {

    const {register, handleSubmit, reset} = useForm();
    const tokenStr = sessionStorage.getItem('token');
    const token = JSON.parse(tokenStr);
    const [correctPassword, setCorrectPassword] = useState(null);

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function authenticate(data) {

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

            if(dados.auth) 
                setCorrectPassword(true);
      
            else 
                setCorrectPassword(false);
            
      
          })
            .catch(error => {
      
              setCorrectPassword(false);
              console.error('Ocorreu um erro:', error);
              reset();
      
            });

    }

    async function deleteAccount() {

        fetch(import.meta.env.VITE_BASE_URL+'/users-delete', {
        
            method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token
                },
        })    
          .then(async (response) => {

            if (!response.ok) {
              throw new Error('Erro ao excluit sua conta');
            }
            if (response.status !== 204) { // 204: No Content
              return response.json();
            }

            return null

          })
            .catch(error => {

              console.error('Ocorreu um erro:', error);

            });
        
    }

    async function logout() {

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
       
      }

    const handleDeleteAccount = async (data) => {

        await authenticate(data);
        
        if(correctPassword) {

            await deleteAccount();
            await logout();

            sessionStorage.clear();
            alert("Conta excluída com sucesso!");
            await delay(1000);
            window.location.assign("/");

        }else {

            reset();

        }

    }

    return(
        <div className={style.container}>
            <h1>Exclusão de Conta</h1>
            <p>ATENÇÂO: Ao excluir sua conta, todos os seus dados serão permanentemente removidos dos nossos sistemas e não poderão ser recuperados.</p>
            <p className={style.aviso}>Digite sua senha para confirmar a exclusão de sua conta:</p>
            <form className={style.form} onSubmit={handleSubmit(handleDeleteAccount)}>
                <input className={style.input} type="password" id="senha"{...register("senha")} placeholder="Digite sua Senha"  autoComplete="off"/>
                <input className={style.input} type="submit" value="Excluir" />
            </form>
            {
              !correctPassword && correctPassword != null &&(
                <p className={style.senhaIncorreta}>*Senha incorreta</p>
              )
            }
        </div>
    )
}

export default DeleteAccount