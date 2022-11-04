import React, { useState, useEffect } from 'react';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import { ethers } from "ethers";
import myEpicNft from './utils/MyEpicNFT.json';

// Constants
const TWITTER_HANDLE = 'xavierfqr_dev';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = "0x79eaC70D789614d6d2EA921084985547B18308CC";


const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const [NFTs, setNFTs] = useState([]);

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    
    if (!ethereum) return;

    const accounts = await ethereum.request({method: 'eth_accounts'})
    if (accounts.length === 0) return;
    
    setCurrentAccount(accounts[0]);
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
    } catch(error) {
      console.log(error);
    }
  }

  const fetchCollection = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        const nftTransaction = await connectedContract.fetchCollection();
        console.log(nftTransaction);
        setNFTs(nftTransaction);
        }
    } catch (error) {
      console.log("error fecthing collection")
    }
  }


  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
        const nftTransaction = await connectedContract.makeAnEpicNFT();
        setIsMinting(true);
        console.log("Mining...please wait.")
        await nftTransaction.wait();
        setIsMinting(false);
        console.log(`Mined, see transaction: https://mumbai.polygonscan.com/tx/${nftTransaction.hash}`);
        fetchCollection();
      }
    } catch (error) {
      console.log(error);
    }
  }
  
  const renderNotConnectedContainer = () => (
    <button className="cta-button connect-wallet-button" onClick={connectWallet}>
      Connect to Wallet
    </button>
  );

  useEffect(() => {
    checkIfWalletIsConnected();
    fetchCollection();
  }, [])

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">One piece NFT Collection</p>
          <p className="sub-text">Mint to discover fancy situations between one piece characters !
          </p>
          {currentAccount === "" ? renderNotConnectedContainer() : (
            <button onClick={askContractToMintNft} className="cta-button connect-wallet-button"> {isMinting ? "Minting..." : "Mint One Piece NFT"}</button>
          )}
        </div>
        <div className="collection-container">
          {NFTs?.map((nft, index) => {
          return (
            <img key={index} height="200px" width="200px" style={{margin: "5px"}} src={`data:image/svg+xml;utf8,${nft}`} />
          )
        })}
        </div>
        
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`@${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;