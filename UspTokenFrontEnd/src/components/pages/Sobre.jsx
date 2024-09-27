import style from './Sobre.module.css'
import { Link } from "react-router-dom"

function Sobre() {
    return(
        <div className={style.container}>
            <h1>Sobre o Projeto</h1>
            <br></br>
            <p> 
                &nbsp;&nbsp;&nbsp;&nbsp;A moeda U$P faz parte de uma iniciativa que visa incentivar a participação da comunidade acadêmica em 
                projetos que promovem o desenvolvimento educacional e tecnológico. Ela funciona como um meio de troca simbólico, 
                que pode ser usado em atividades relacionadas ao aprimoramento da formação acadêmica e à integração da comunidade 
                da USP São Carlos.
            </p>
            <br></br>
            <p>
                &nbsp;&nbsp;&nbsp;&nbsp;Associado à ela está o Chronos, uma associação sem fins lucrativos, voltada para a gestão de um fundo patrimonial 
                que apoia projetos de desenvolvimento humano e acadêmico na USP São Carlos. A missão do Chronos é fortalecer a 
                educação, apoiando tanto o corpo discente quanto docente em atividades que complementem o ensino formal, promovam 
                a pesquisa e estimulem a inovação.
            </p>
            <br></br>
            <p>
                &nbsp;&nbsp;&nbsp;&nbsp;Ambos se relacionam na promoção de um ambiente acadêmico mais dinâmico e integrado. Enquanto a moeda serve como um 
                incentivo para a participação em projetos e atividades educacionais, o Chronos fornece o suporte estrutural e 
                financeiro para que esses projetos possam se concretizar. Juntas, essas iniciativas contribuem para o 
                desenvolvimento contínuo da comunidade acadêmica, proporcionando recursos e incentivos que complementam a formação 
                tradicional e promovem o desenvolvimento de novas habilidades.
            </p>
            <br></br>
            <p>
                &nbsp;&nbsp;&nbsp;&nbsp;Informações complementares sobre a moeda podem ser encontradas <Link to={"https://sepolia.etherscan.io/token/0x2a23b5ac7c03312a6ca0dccfc2609aebe7634a9e"}>aqui</Link>.
            </p>
        </div>
    )
}

export default Sobre