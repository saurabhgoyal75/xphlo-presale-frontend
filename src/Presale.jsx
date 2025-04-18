import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import XPhloABI from './XPhloABI.json'; // ABI generated after compiling Solidity

export default function Presale() {
  const [currency, setCurrency] = useState('ETH');
  const [investment, setInvestment] = useState('');
  const [tokens, setTokens] = useState(0);
  const tokenPrice = 0.05;

  const contractAddress = "0xC63DaaAC8F02E5F7Aeb33650d1eD6eFB85CB0cc8";

  const ethUsdPrice = 1700; // must match your contract ETH price exactly

  useEffect(() => {
    const calculateTokens = () => {
      const investmentValue = parseFloat(investment);
      if (!isNaN(investmentValue)) {
        if (currency === 'ETH') {
          setTokens((investmentValue * 1700 / tokenPrice).toFixed(2)); // for ETH, multiply by ETH price in USD
        } else if (currency === 'USDC' || currency === 'USDT') {
          setTokens((investmentValue / tokenPrice).toFixed(2)); // USDC/USDT = 1:1 USD
        } else {
          setTokens(0);
        }
      } else {
        setTokens(0);
      }
    };
    calculateTokens();
  }, [investment, currency]);
  
  

  const handleProceed = async () => {
    if (currency === 'CARD') {
      alert('Currently only crypto payments are enabled.');
      return;
    }
    
    if (!window.ethereum) {
      alert('Please install MetaMask.');
      return;
    }
  
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
  
      const contract = new ethers.Contract(contractAddress, XPhloABI, signer);
  
      if (currency === 'ETH') {
        const tx = await contract.buyWithETH({ value: ethers.parseEther(investment) });
        await tx.wait();
        alert(`Purchased ${tokens} xPhlo successfully with ETH! Tx Hash: ${tx.hash}`);
      } else if (currency === 'USDC' || currency === 'USDT') {
        const stablecoinAddress = currency === 'USDC' 
          ? '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' 
          : '0xdAC17F958D2ee523a2206206994597C13D831ec7';
  
        const stablecoinABI = [
          'function approve(address spender, uint256 amount) external returns (bool)',
          'function allowance(address owner, address spender) external view returns (uint256)',
          'function decimals() external view returns (uint8)',
          'function balanceOf(address owner) external view returns (uint256)'
        ];
  
        const stablecoinContract = new ethers.Contract(stablecoinAddress, stablecoinABI, signer);
        const decimals = await stablecoinContract.decimals();
        const amountToSend = ethers.parseUnits(investment, decimals);
  
        // Check user's balance
        const balance = await stablecoinContract.balanceOf(userAddress);
        if (balance < amountToSend) {
          alert(`Insufficient ${currency} balance.`);
          return;
        }
  
        // Check allowance
        const allowance = await stablecoinContract.allowance(userAddress, contractAddress);
        if (allowance < amountToSend) {
          const approveTx = await stablecoinContract.approve(contractAddress, amountToSend);
          await approveTx.wait();
        }
  
        const buyTx = await contract.buyWithStablecoin(stablecoinAddress, amountToSend);
        await buyTx.wait();
  
        alert(`Purchased ${tokens} xPhlo successfully with ${currency}! Tx Hash: ${buyTx.hash}`);
      }
  
    } catch (error) {
      console.error('Transaction Error:', error);
      alert(`Transaction failed: ${error.reason || error.message}`);
    }
  };
  
  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
      <h2>xPhlo Presale Stage 1</h2>
      <p><strong>1 xPhlo = ${tokenPrice}</strong></p>
      <p><strong>Launch Price = $0.25</strong></p>

      <div style={{ marginTop: '20px' }}>
        <label>Buy using:</label>
        <select
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          <option value="ETH">ETH</option>
          <option value="USDC">USDC</option>
          <option value="USDT">USDT</option>
          <option value="CARD">Credit/Debit Card</option>
        </select>
      </div>

      <div style={{ marginTop: '20px' }}>
        <input
          style={{ width: '100%', padding: '8px' }}
          placeholder={`Enter ${currency} amount`}
          value={investment}
          onChange={(e) => setInvestment(e.target.value)}
        />
      </div>

      <div style={{ marginTop: '15px', fontWeight: 'bold' }}>
        You will receive: {tokens} xPhlo
      </div>

      <button
        style={{ marginTop: '20px', width: '100%', padding: '10px', background: '#4A90E2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        onClick={handleProceed}
      >
        Proceed
      </button>
    </div>
  );
}
