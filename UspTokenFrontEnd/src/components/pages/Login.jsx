import { Link } from 'react-router-dom';
import { useState } from 'react';
import style from './Login.module.css';
import { useForm } from "react-hook-form"; 

function Login() {

    const {register, handleSubmit, reset} = useForm();
    const [wrongCredentials, setWrongCredentials] = useState(false);

    const verificarLogin = async (dados) => {

      fetch(import.meta.env.VITE_BASE_URL+'/login', {

        method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dados),
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
   
              setWrongCredentials(false);
              sessionStorage.setItem('token', JSON.stringify(data.token));
              sessionStorage.setItem('nusp', JSON.stringify(data.nusp));
              sessionStorage.setItem('nome', JSON.stringify(data.nome));
              sessionStorage.setItem('endereco_ethereum', JSON.stringify(data.endereco_ethereum));
              sessionStorage.setItem('carteira', JSON.stringify(data.carteira));
              window.location.assign("/profile");
   
            }else {

              setWrongCredentials(true);
              reset();
              
            }

          })
            .catch(error => {

              setWrongCredentials(true);
              console.error('Ocorreu um erro:', error);
              reset();

            });
    }

    return(
        <div className={style.container}>
            <h1>Login</h1>
            <form className={style.form} onSubmit={handleSubmit(verificarLogin)}>
                <div className={style.input_container}>
                    <label className={style.label} htmlFor="key">E-mail/Nusp:</label>
                    <input className={style.input} {...register("key")} id="key" placeholder="Digite seu E-mail ou NUSP" />
                </div>
                <div className={style.input_container}>
                    <label className={style.label} htmlFor="senha">Senha:</label>
                    <input className={style.input} type="password"{...register("senha")} id="senha" placeholder="Digite sua Senha" />
                </div>
                {wrongCredentials && (
                    <p>*Credenciais incorretas</p>
                )}
                <div className={style.input_container}>
                    <input className={style.input} type="submit" value="Entrar" />
                </div>
            </form>
            <p>Ainda não possui uma conta? <Link to="/signup">Criar conta</Link></p>
        </div>
    )
}

export default Login