import style from './Contato.module.css'

function Contato() {
    return(
            <div className={style.container}>
                <div className={style.contato}>
                    <h2>Enviar uma Mensagem</h2>
                    <p>Utilize o formulário abaixo caso seja do seu interesse deixar alguma mensagem</p>
                    <p>(Os campos marcados com "*" são obrigatórios)</p>
                    <form method="POST">
                        <div className={style.input_container}>
                            <input id="name" autocomplete="off" type="text" placeholder="Nome*" required/>
                        </div>
                        <div className={style.input_container}>
                            <input id="email" autocomplete="off" type="email" placeholder="Email*" required/>
                        </div>
                        <div className={style.input_container}>
                            <input id="subject" autocomplete="off" type="text" placeholder="Assunto"/>
                        </div>
                        <div className={style.input_container}>
                            <textarea id="content"  autoComplete="off" type="text" placeholder="Escreva aqui sua mensagem*" required></textarea>
                        </div>
                        <div className={style.input_container}>
                            <input type="submit" placeholder="Enviar*"/>
                        </div>
                    </form>
                </div>
            </div>
    )
}

export default Contato