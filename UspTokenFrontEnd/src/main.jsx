import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ethers } from 'ethers';
import './index.css';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { SearchProvider } from './components/layout/SearchContext.jsx'; 
import Home from './components/pages/Home.jsx';
import Sobre from './components/pages/Sobre.jsx';
import Contato from './components/pages/Contato.jsx';
import Transacao from './components/pages/Transacao.jsx';
import Login from './components/pages/Login.jsx';
import contractABI from "../../UspTokenContract/artifacts/contracts/USPToken.sol/USPToken.json";
import SignUp from './components/pages/SignUp.jsx';
import UserProfile from './components/pages/UserProfile.jsx';
import NewUserPage from './components/pages/NewUserPage.jsx';
import SearchResult from './components/pages/SearchResult.jsx';
import DeleteAccount from './components/pages/DeleteAccount.jsx';

const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_JSON_PROVIDER_URL); //URL do provedor utilizado no deploy do contrato (antes era "https://ethereum-sepolia.publicnode.com")
const { abi: ContractABI } = contractABI;
const contract = new ethers.Contract(import.meta.env.VITE_CONTRACT_ADDRESS, ContractABI, provider);//cria uma instância para interagir com o contrato

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home blockNumber={ import.meta.env.VITE_CONTRACT_BLOCK } provider={ provider } contract={ contract } />
      },
      {
        path: "/sobre",
        element: <Sobre />
      },
      {
        path: "/contato",
        element: <Contato />
      },
      {
        path: "/tx/:id",
        element: <Transacao />
      },
      {
        path: "/search/:key",
        element: <SearchResult />
      },
      {
        path: "/delete-account",
        element: <DeleteAccount />
      }
    ],    
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/signup",
    element: <SignUp />
  },
  {
    path: "/profile",
    element: <UserProfile contract={ contract } provider={ provider }/>
  },
  {
    path: "/new-user/:nusp",
    element: <NewUserPage />
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SearchProvider>
      <RouterProvider router={router} />
    </SearchProvider>
  </React.StrictMode>,
)
