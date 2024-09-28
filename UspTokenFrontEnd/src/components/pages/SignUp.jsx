import style from './Login.module.css'
import { useForm } from "react-hook-form" 
import { useState } from 'react';
import {generateWallet, generateWalletFromMnemonic, encryptWallet} from '../../utils/utilities.js'

function SignUp() {

    const {register, handleSubmit} = useForm();
    const [isChecked, setIsChecked] = useState(false);

    const handleCheckboxChange = () => {
        setIsChecked(!isChecked); // Inverte o estado da checkbox
    };

    const cadastrarUsuario = async (dados) => {

        let wallet;
        let encryptedWallet;

        if(isChecked && (dados.mnemonico != "")) {

            wallet = await generateWalletFromMnemonic(dados.mnemonico);
            encryptedWallet = await encryptWallet(wallet, dados.senha);      

        } else {

            wallet = await generateWallet();   
            encryptedWallet = await encryptWallet(wallet, dados.senha); 

        }        

        const user = {
            nusp: dados.nusp,
            nome: dados.nome,
            email: dados.email,
            senha: dados.senha,
            mnemonico: wallet.mnemonic,
            enderecoEthereum: wallet.address,
            carteiraCriptografada: encryptedWallet,
        };

        fetch(import.meta.env.VITE_BASE_URL+'/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
        }) 
            .then(response => {

                if (!response.ok) {
                    response.json().then((result) => {
                        alert("Erro ao cadastrar usuário: " + result.mensagem);
                        throw new Error('Erro ao realizar cadastro');
                    });
                }
                if (response.status === 201) { // 201: Success

                    //localStorage.setItem('carteira', JSON.stringify(wallet));
                    localStorage.setItem('user', JSON.stringify(user));
                    window.location.assign("/new-user/" + user.nusp);

                }

              })
            .catch(error => {
              console.error('Ocorreu um erro:', error);
            });
    }

    return(
        <div className={style.container}>
            <h1>Preencha com seus dados:</h1>
            <form className={style.form} onSubmit={handleSubmit(cadastrarUsuario)}>
                <div className={style.input_container}>
                    <label className={style.label} htmlFor="nome">Nome Completo:</label>
                    <input className={style.input} type="text"{...register("nome")} id="nome" placeholder="Digite seu Nome" required="required" />
                </div>
                <div className={style.input_container}>
                    <label className={style.label} htmlFor="email">E-mail USP:</label>
                    <input className={style.input} type="email"{...register("email")} id="email" placeholder="Digite seu E-mail"  required="required" />
                </div>
                <div className={style.input_container}>
                    <label className={style.label} htmlFor="nusp">Número USP:</label>
                    <input className={style.input} type="number"{...register("nusp")} id="nusp" placeholder="Digite seu Numero USP"  required="required" />
                </div>
                <div className={style.input_container}>
                    <label className={style.label} htmlFor="senha">Senha:</label>
                    <input className={style.input} type="password"{...register("senha")} id="senha" placeholder="Digite sua Senha"  required="required" />
                </div>
                <div className={style.checkBoxContainer}>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={handleCheckboxChange}
                  className={style.checkBox}
                />
                <label className={style.agreement}>Importar carteira</label>
            </div>
            {isChecked &&(
                <div className={style.input_container}>
                    <textarea id="mnemonic"  autoComplete="off" type="text"{...register("mnemonico")} required></textarea>
                </div>
            )}
            <div className={style.input_container}>
                <input className={style.input} type="submit" id="btt-cadastrar" value="Cadastrar" />
            </div>
            </form>
        </div>
    )
}

export default SignUp