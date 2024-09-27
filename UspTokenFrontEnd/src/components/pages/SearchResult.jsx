import style from './SearchResult.module.css'
import { useContext, useEffect } from 'react';
import { SearchContext } from '../layout/SearchContext';
import ListaTransacoes from '../layout/ListaTransacoes';

function SearchResult(){

    const { searchResults, setSearchResults, searchResultsType, setSearchResultsType } = useContext(SearchContext);

    return(
        <div className={style.container}>
            {
                (searchResults == null || searchResults.length == 0 ) &&(
                    <h3>Não foram encontrados resultados para a pesquisa </h3>
                )
            }
            {
                searchResults != null && searchResults.length != 0  &&(
                    <div>
                        <h3>Resultados da pesquisa:</h3>
                        <ListaTransacoes events={searchResults} />
                    </div>
                )
            }
        </div>
    )

}

export default SearchResult