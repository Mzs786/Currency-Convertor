import { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [sourceCurrency, setSourceCurrency] = useState('');
  const [targetCurrency, setTargetCurrency] = useState('');
  const [amount, setAmount] = useState('');
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const [rates, setRates] = useState({});
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [loading, setLoading] = useState(true);
  const [conversionHistory, setConversionHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const API_KEY = import.meta.env.VITE_EXCHANGE_API_KEY;
  const API_BASE = 'https://v6.exchangerate-api.com/v6';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [codesRes, ratesRes] = await Promise.all([
          fetch(`${API_BASE}/${API_KEY}/codes`),
          fetch(`${API_BASE}/${API_KEY}/latest/USD`)
        ]);

        const [codesData, ratesData] = await Promise.all([
          codesRes.json(),
          ratesRes.json()
        ]);

        if (codesData.result === 'success') {
          setCurrencies(codesData.supported_codes);
        }

        if (ratesData.result === 'success') {
          setBaseCurrency(ratesData.base_code);
          setRates(ratesData.conversion_rates);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [API_KEY]);

  const handleExchange = () => {
    setConvertedAmount(null);

    if (!sourceCurrency || !targetCurrency || !amount) {
      setConvertedAmount(<span className="error-text">Please fill all fields</span>);
      return;
    }

    if (sourceCurrency === targetCurrency) {
      setConvertedAmount(<span className="warning-text">Same currencies selected</span>);
      return;
    }

    const sourceRate = rates[sourceCurrency];
    const targetRate = rates[targetCurrency];

    if (!sourceRate || !targetRate) {
      setConvertedAmount(<span className="error-text">Invalid currency pair</span>);
      return;
    }

    const convertedValue = (amount * (targetRate / sourceRate)).toFixed(2);
    setConvertedAmount(convertedValue);
    
    setConversionHistory(prev => [...prev.slice(-2), {
      source: sourceCurrency,
      target: targetCurrency,
      amount,
      result: convertedValue,
      timestamp: new Date().toISOString()
    }]);
  };

  const CurrencySelect = ({ label, value, onChange }) => (
    <div className="input-group">
      <label className="input-label">{label}</label>
      <select
        className="currency-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" disabled>Select {label.toLowerCase()}</option>
        {currencies.map(([code, name]) => (
          <option key={code} value={code}>
            {code} - {name}
          </option>
        ))}
      </select>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <div className="loading-text">Fetching live rates...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="main-grid">
        <div className="converter-panel">
          <div className="panel-header">
            <h2 className="panel-title">Currency Converter</h2>
          </div>
          
          <div className="converter-content">
            <CurrencySelect 
              label="Source Currency"
              value={sourceCurrency}
              onChange={setSourceCurrency}
            />

            <CurrencySelect 
              label="Target Currency"
              value={targetCurrency}
              onChange={setTargetCurrency}
            />

            <div className="input-group">
              <label className="input-label">Amount</label>
              <input
                type="number"
                className="amount-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                placeholder="Enter amount..."
              />
            </div>

            <button
              className="convert-button"
              onClick={handleExchange}
            >
              Convert Now
            </button>

            <div className="result-box">
              <span className="result-label">Converted Amount</span>
              <span className="result-value">
                {convertedAmount || '--'}
              </span>
            </div>

            {conversionHistory.length > 0 && (
              <div className="history-panel">
                <h3 className="history-title">Recent Conversions</h3>
                <div className="history-list">
                  {conversionHistory.map((entry, index) => (
                    <div key={index} className="history-item">
                      <div className="history-content">
                        <span className="history-amount">{entry.amount}</span> {entry.source}
                        <span className="history-arrow">→</span>
                        <span className="history-amount">{entry.result}</span> {entry.target}
                      </div>
                      <div className="history-time">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="rates-panel">
          <div className="panel-header">
            <h2 className="panel-title">Current Rates (Base: {baseCurrency})</h2>
          </div>
          
          <div className="search-container">
            <input
              type="text"
              placeholder="Search currencies..."
              className="search-input"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="rates-table-container">
            <table className="rates-table">
              <thead>
                <tr>
                  <th className="table-header">Currency</th>
                  <th className="table-header text-right">Rate</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(rates)
                  .filter(([currency]) => 
                    currency.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(([currency, rate], index) => (
                    <tr key={currency} className={`table-row ${index % 2 === 0 ? 'even-row' : ''}`}>
                      <td className="currency-cell">
                        <div className="currency-info">
                          <img 
                            src={`https://flagcdn.com/20x15/${currency.toLowerCase().slice(0,2)}.png`}
                            className="currency-flag"
                            alt=""
                          />
                          <span className="currency-code">{currency}</span>
                        </div>
                      </td>
                      <td className="rate-cell">{rate.toFixed(4)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;