import style from './SearchResult.module.css';
import { useState, useEffect } from 'react';
import ListaTransacoes from '../layout/ListaTransacoes';

function SearchResult() {
    const [searchResults, setSearchResults] = useState(null);

    // Função para carregar os resultados do localStorage
    const loadResultsFromLocal = () => {
        const searchResultStr = localStorage.getItem('results');
        if (searchResultStr) {
            setSearchResults(JSON.parse(searchResultStr));
        } else {
            setSearchResults(null);
        }
    };

    // useEffect para monitorar mudanças no localStorage
    useEffect(() => {
        // Carrega os dados inicialmente
        loadResultsFromLocal();

        const handleStorageChange = (e) => {
            loadResultsFromLocal();
        };

        // Adiciona o listener para mudanças no localStorage
        window.addEventListener('localStorageUpdated', handleStorageChange);

        // Cleanup: remove o listener quando o componente desmonta
        return () => {
            window.removeEventListener('localStorageUpdated', handleStorageChange);
        };
    }, []);

    return (
        <div className={style.container}>
            {(!searchResults || searchResults.length === 0) && (
                <h3>Não foram encontrados resultados para a pesquisa</h3>
            )}
            {searchResults && searchResults.length > 0 && (
                <div>
                    <h3>Resultados da pesquisa:</h3>
                    <ListaTransacoes events={searchResults} />
                </div>
            )}
        </div>
    );
}

export default SearchResult;
