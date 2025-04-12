import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export default function Presale() {
  const [currency, setCurrency] = useState('ETH');
  const [investment, setInvestment] = useState('');
  const [tokens, setTokens] = useState(0);
  const tokenPrice = 0.05;

  useEffect(() => {
    const calculateTokens = () => {
      const investmentValue = parseFloat(investment);
      if (!isNaN(investmentValue)) {
        setTokens((investmentValue / tokenPrice).toFixed(2));
      } else {
        setTokens(0);
      }
    };
    calculateTokens();
  }, [investment]);

  const handleProceed = async () => {
    if (currency === 'CARD') {
      alert('Credit Card payments coming soon!');
      return;
    }
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask');
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      alert(`Connected wallet: ${await signer.getAddress()}`);

      // Integration with your smart contract here
      alert(`Proceeding to buy ${tokens} xPhlo tokens using ${investment} ${currency}`);

    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Error connecting wallet. See console for details.');
    }
  };

  return (
    <div style={{maxWidth: '400px', margin: '0 auto', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', borderRadius: '8px'}}>
      <h2>xPhlo Presale Stage 1</h2>
      <p><strong>1 xPhlo = ${tokenPrice}</strong></p>
      <p><strong>Launch Price = $0.25</strong></p>

      <div style={{marginTop: '20px'}}>
        <label>Buy using:</label>
        <select
          style={{width: '100%', padding: '8px', marginTop: '5px'}}
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          <option value="ETH">ETH</option>
          <option value="USDC">USDC</option>
          <option value="USDT">USDT</option>
          <option value="CARD">Credit/Debit Card</option>
        </select>
      </div>

      <div style={{marginTop: '20px'}}>
        <input
          style={{width: '100%', padding: '8px'}}
          placeholder={`Enter ${currency} amount`}
          value={investment}
          onChange={(e) => setInvestment(e.target.value)}
        />
      </div>

      <div style={{marginTop: '15px', fontWeight: 'bold'}}>
        You will receive: {tokens} xPhlo
      </div>

      <button
        style={{marginTop: '20px', width: '100%', padding: '10px', background: '#4A90E2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
        onClick={handleProceed}
      >
        Proceed
      </button>
    </div>
  );
}
