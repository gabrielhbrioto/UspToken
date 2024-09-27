import { useLocation } from 'react-router-dom';
import style from './Transacao.module.css'
import { ethers } from 'ethers';

function Transacao(){

    const { state } = useLocation();
    const amountBigInt = state.amount ? BigInt(state.amount) : 0n;
    const formattedAmount = Number(amountBigInt) / Number(10n ** 18n);
    const formattedAmountStr = formattedAmount.toFixed(2);
    const formattedGasPriceStr = state.gasPrice ? ethers.formatEther(state.gasPrice) : "0";
    const gasPriceStr = state.gasPrice ? state.gasPrice.toString() : "0";
    const gasUsedStrs = state.gasUsed ? state.gasUsed.toString() : "0";
    const txFee = (state.gasPrice && state.gasUsed) ? ethers.formatEther(state.gasPrice*state.gasUsed) : 0;

    return(
        <div className={style.container}>
            <div className={style.element}>
                <p className={style.paragraph}>Hash da Transação :</p>
                <p className={style.paragraph}>Index da Transação :</p>
                <p className={style.paragraph}>De :</p>
                <p className={style.paragraph}>Para :</p>
                <p className={style.paragraph}>Bloco :</p>
                <p className={style.paragraph}>Valor :</p>
                <p className={style.paragraph}>Gas Usado :</p>
                <p className={style.paragraph}>Preço do Gas :</p>
                <p className={style.paragraph}>Custo Total da Transação :</p>
            </div>
            <div className={style.element}>
                <p className={style.paragraph}>{state.hash}</p>
                <p className={style.paragraph}>{state.transactionIndex}</p>
                <p className={style.paragraph}>{state.from}</p>
                <p className={style.paragraph}>{state.to}</p>
                <p className={style.paragraph}>{state.block}</p>
                <p className={style.paragraph}>{formattedAmountStr} U$PT</p>
                <p className={style.paragraph}>{gasUsedStrs}</p>
                <p className={style.paragraph}>{gasPriceStr} Gwei ({formattedGasPriceStr} ETH)</p>
                <p className={style.paragraph}>{txFee} ETH</p>
            </div>
        </div>
    )
}

export default Transacao