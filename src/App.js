import { useState, useEffect, React } from 'react'
import { ethers } from "ethers"
import EpicNft from './utils/EpicNFT.json'

import './App.css'
import { MdAccountBalanceWallet } from 'react-icons/md'


const findMetamaskWallet = async () => {
  const { ethereum } = window

  if (!ethereum) {
    alert('Make sure that metamask is installed.')
    return null
  }

  const accounts = await ethereum.request({ method: 'eth_accounts' })
  const account = accounts[0]

  let chainId = await ethereum.request({ method: 'eth_chainId' })
  console.log("Connected to chain " + chainId)

  // String, hex code of the chainId of the Goerli test network
  const goerliChainId = "0x5"
  if (chainId !== goerliChainId) {
    alert("You are not connected to the Goerli Test Network!")
  }

  if (account.length > 0) {
    return account
  }
  else {
    console.log('No account found.')
    return null
  }
}

const App = () => {

  const [showIcon, setShowIcon] = useState(false)
  const [curentAccount, setCurentAccount] = useState()
  const [hash, setHash] = useState()
  const [isMinting, setIsMinting] = useState(false)
  const [errorMessage, setErrorMessage] = useState()
  const [successMessage, setSuccessMessage] = useState()

  const CONTRACT_ADDRESS = "0xd2061CaB2451d88bDe6d8bd5a3ce3656B91A5DeA"
  const CONTRACT_ABI = EpicNft.abi

  useEffect(() => {
    findMetamaskWallet()
      .then((account) => {
        if (account !== null) {
          setupEventListener()
          setCurentAccount(account)
        }
      })
    // eslint-disable-next-line
  }, [])

  const connectWallet = async () => {
    try {
      const { ethereum } = window

      if (!ethereum) {
        alert('Please install Metamask')
        return
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      const account = accounts[0]
      setCurentAccount(account)
      setupEventListener()
      window.location.reload(false)
    }
    catch (err) {
      console.log(err)
      return null
    }
  }

  const setupEventListener = async () => {
    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)

        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        })
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const mintNFT = async () => {
    try {
      const { ethereum } = window
      setErrorMessage()
      setHash()
      setSuccessMessage()
      if (ethereum) {
        setIsMinting(true)
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)

        let nftTxn = await connectedContract.makeAnEpicNFT()

        console.log("Mining...please wait.")
        await nftTxn.wait()
        setHash(nftTxn.hash)
        setSuccessMessage(`Mining successful. Hash: ${nftTxn.hash}`)
        setIsMinting(false)
        console.log(`Mined, see transaction: https://goerli.etherscan.io/tx/${nftTxn.hash}`)

      } else {
        setIsMinting(false)
        alert("Please connect to your Metamask wallet.")
      }
    } catch (error) {
      setIsMinting(false)
      console.log(error)
      setErrorMessage(error.message)
    }
  }

  return (
    <div className="bg-zinc-800 min-h-screen w-full justify-center flex items-center ...">

      <div className="top-2 right-2 absolute ...">
        {!curentAccount ?
          <button
            onClick={connectWallet}
            onMouseEnter={() => setShowIcon(true)}
            onMouseLeave={() => setShowIcon(false)}
            id='connect-btn'
            className="align-top border-solid h-11 text-slate-300 bg-yellow-700 w-64 rounded-md font-mono text-lg font-semibold">
            {showIcon === false ? 'Connect'
              :
              <MdAccountBalanceWallet
                id='MdAccountBalanceWallet'
                className='items-center inline-flex'
                size={30}
                color={'#fff'} />}
          </button>
          : []
        }
      </div>

      <div
        id={isMinting === false ? "spinning-btn" : "spinning-btn-faster"}
        className={!curentAccount && !successMessage ?
          "w-48 bg-gradient-to-r from-red-500 h-48 rounded-full justify-center flex items-center"
          : successMessage ? "w-48 bg-gradient-to-r from-green-500 h-48 rounded-full justify-center flex items-center"
            : "w-48 bg-gradient-to-r from-indigo-500 h-48 rounded-full justify-center flex items-center"}>
        <button
          onClick={mintNFT}
          id="mint-btn"
          className="bg-stone-900 rounded-full text-red-50 text-3xl w-44 h-44">
          Mint
        </button>
      </div>

      {errorMessage &&
        <div className="items-start inline-flex top-2 left-2 w-2/6 absolute ... uppercase font-mono text-red-500 text-lg antialiased font-semibold tracking-wide">
          {errorMessage}.
        </div>
      }
      {successMessage &&
        <a href={`https://goerli.etherscan.io/tx/${hash}`} target="_blank" rel="noreferrer">
          <div className="underline items-start inline-flex top-2 left-2 w-2/6 absolute ... uppercase font-mono text-green-500 text-lg antialiased font-semibold tracking-wide">
            {successMessage}.
          </div>
        </a>
      }

      <div className="align-bottom items-end inline-flex bottom-2 left-2 w-2/6 absolute ...">
        <div className="uppercase font-mono text-stone-500 text-3xl antialiased font-semibold tracking-wide">
          "Neph" made this website for  you to Mint An NFT...
        </div>
      </div>
    </div >
  )
}

export default App
