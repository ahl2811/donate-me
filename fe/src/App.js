import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle";
import { ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { abi, contractAddress } from "./constants";
import { Form } from "./Form";

function App() {
  const [ethereum, setEthereum] = useState();
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState(0);
  const [isOwner, setIsOwner] = useState(false);
  const [donatedAmount, setDonatedAmount] = useState(0);

  const [fetchLoading, setFetchLoading] = useState(false);
  const [donateLoading, setDonateLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  useEffect(() => {
    setEthereum(window.ethereum);
  }, []);

  //Listener
  useEffect(() => {
    if (!ethereum) return;
    ethereum.on("accountsChanged", (accounts) => {
      setAccount(accounts ? accounts[0] : "");
    });
  }, [ethereum]);

  // Connect MetaMask
  const getAccounts = useCallback(async () => {
    if (!ethereum) return;
    const accounts = await ethereum.request({
      method: "eth_accounts",
    });
    setAccount(accounts?.[0] || "");
  }, [ethereum]);

  useEffect(() => {
    getAccounts();
  }, [getAccounts]);

  const handleConnectMetaMask = async () => {
    if (!ethereum) return alert("Please install MetaMask");
    if (account) return;

    try {
      await ethereum.request({ method: "eth_requestAccounts" });
      await getAccounts();
    } catch (error) {
      console.log(error);
    }
  };

  // Handle Data info
  const checkOwner = useCallback(async () => {
    if (!ethereum) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    const ownerAddress = await contract.getOwner();

    setIsOwner(
      ethers.utils.getAddress(ownerAddress) === ethers.utils.getAddress(account)
    );
  }, [account, ethereum]);

  const getBalance = useCallback(async () => {
    if (!ethereum) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    try {
      const balance = await provider.getBalance(contractAddress);
      const ethValue = ethers.utils.formatEther(balance);
      setBalance(ethValue);
    } catch (error) {
      console.log(error);
    }
  }, [ethereum]);

  const getDonatedAmount = useCallback(async () => {
    if (!ethereum) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    const donatedAmount = await contract.getFundedAmount();
    setDonatedAmount(ethers.utils.formatEther(donatedAmount));
  }, [ethereum]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchLoading(true);
        await Promise.all([
          await getBalance(),
          await getDonatedAmount(),
          await checkOwner(),
        ]);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchData();
  }, [getDonatedAmount, getBalance, account, checkOwner]);

  const donate = async (ethAmount) => {
    if (!ethereum) return alert("Please install MetaMask");

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    try {
      setDonateLoading(true);
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });

      await listenForTransactionMine(transactionResponse, provider);
      await Promise.all([await getBalance(), await getDonatedAmount()]);
    } catch (error) {
      console.log(error);
    } finally {
      setDonateLoading(false);
    }
  };

  const withdraw = async () => {
    if (!ethereum) return alert("Please install MetaMask");

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      setWithdrawLoading(true);
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
      await getBalance();
    } catch (error) {
      console.log(error);
    } finally {
      setWithdrawLoading(false);
    }
  };

  return (
    <div className="h-100 w-100 d-flex flex-row align-items-center justify-content-center">
      {fetchLoading ? (
        <div class="spinner-border text-secondary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      ) : (
        <div>
          <p className="fs-1 text-center">
            Balance: <strong>{balance} ETH</strong>
          </p>
          <div className="d-flex justify-content-center gap-3">
            {account ? (
              <>
                {!isOwner && <Form loading={donateLoading} onSubmit={donate} />}
                {isOwner && (
                  <button
                    className="btn btn-danger"
                    onClick={withdraw}
                    disabled={withdrawLoading}
                  >
                    {withdrawLoading ? "Loading..." : "Withdraw"}
                  </button>
                )}
              </>
            ) : (
              <button
                id="connectButton"
                className="btn btn-primary"
                onClick={handleConnectMetaMask}
              >
                Connect MetaMask
              </button>
            )}
          </div>
          {account && (
            <div className="alert alert-warning mx-auto mt-4" role="alert">
              <h5 className="alert-heading">Your account:</h5>
              <div className="mb-2">{account}</div>
              <h6>
                Donated Amount:<strong> {donatedAmount} ETH</strong>
              </h6>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function listenForTransactionMine(transactionResponse, provider) {
  return new Promise((resolve) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmations. `
      );
      resolve();
    });
  });
}

export default App;
