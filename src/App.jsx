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
const CONTRACT_ADDRESS = "0x18643fd855850f7Db0cc6C3F0ff27c451D004FD5";


const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const [NFTs, setNFTs] = useState([]);

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    
    if (!ethereum) return;

    const accounts = await ethereum.request({method: 'eth_accounts'})
    if (accounts.length === 0) return;
    console.log(accounts);
    setCurrentAccount(accounts[0]);
    setupEventListener();
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
      setupEventListener();
      fetchCollection();
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
        console.log("nft transac : ", nftTransaction);
        setNFTs(nftTransaction);
        }
    } catch (error) {
      console.log("error fecthing collection")
    }
  }

  const setupEventListener = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        connectedContract.on("NewEpicNFTMinted", (from, svg, tokenId) => {
          setNFTs(nfts => [...nfts, { svg: svg, id: tokenId }]);
          console.log("nft event triggered");
        });
      }
      else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
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
        await nftTransaction.wait();
        setIsMinting(false);
        console.log(`Mined, see transaction: https://mumbai.polygonscan.com/tx/${nftTransaction.hash}`);
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

  useEffect(async () => {
    checkIfWalletIsConnected();
    let chainId = await ethereum.request({ method: 'eth_chainId' });
    console.log("Connected to chain " + chainId);

    const mumbaiChainId = "0x13881"; 
    if (chainId !== mumbaiChainId) {
	    alert("You are not connected to the Mumbai Test Network!");
    }
    fetchCollection();
  }, [])

  console.log("nfts => ", NFTs)

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">One piece NFT Collection</p>
          <p className="sub-text">Mint to discover fancy situations between one piece characters !
          </p>
          {currentAccount === "" ? renderNotConnectedContainer() : (
            <button disabled={isMinting} onClick={askContractToMintNft} className="cta-button connect-wallet-button"> {isMinting ? "Minting..." : `Mint One Piece NFT   (${NFTs.length} / 20)`}</button>
          )}
        </div>
        <div className="collection-container">
          {NFTs?.map((nft, index) => {
          return (
            <img key={index} height="200px" width="200px" onClick={() => window.open(`https://testnets.opensea.io/assets/mumbai/0x474B37e58e66bbD20B43d37025c33Ab92e9a47f0/${nft.id}`, '_blank', 'noopener,noreferrer')} style={{margin: "5px", cursor: "pointer"}} src={`data:image/svg+xml;utf8,${nft.svg}`} />
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