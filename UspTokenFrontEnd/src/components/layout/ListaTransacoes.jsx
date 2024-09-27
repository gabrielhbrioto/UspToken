import { Link } from "react-router-dom"
import { GrTransaction } from "react-icons/gr";

import styles from './ListaTransacoes.module.css'

function ListaTransacoes( {events} ) {

    return(
        <div className={styles.container}>
            {
               events.map((event) =>(
                    <div key={event.hash}>
                        <div className={styles.list}>
                            <GrTransaction className={styles.icon}/>
                            <div className={styles.info}>
                                <Link className={styles.hash} to={"/tx/" + event.hash} state={
                                    {
                                        hash: event.hash,
                                        transactionIndex: event.transactionIndex,
                                        from: event.from,
                                        to: event.to,
                                        amount: event.value,
                                        block: Number(event.blockNumber),
                                        gasUsed: BigInt(event.gasUsed),
                                        gasPrice: BigInt(event.gasPrice),
                                    }
                                }>
                                    {event.hash.substring(0, 8) + '...' + event.hash.substring(event.hash.length-6, event.hash.length)}
                                </Link>
                            </div>
                            <div className={styles.info}>
                                <p className={styles.item}>De: {event.from.substring(0, 8) + '...' + event.from.substring(event.from.length-6, event.from.length)}</p>
                                <p className={styles.item}>Para: {event.to.substring(0, 8) + '...' + event.to.substring(event.to.length-4, event.to.length)}</p>
                            </div>
                        </div>
                        <hr />
                    </div>
                ))       
            }           
        </div>
    )
}

export default ListaTransacoes