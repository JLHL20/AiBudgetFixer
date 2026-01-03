import logo from './logo.svg';
import './App.css';

function ReceiptCard( {total} ) {

  function handleClick() {
    console.log('Analyze button clicked!');
  }
  
  return (
    <div className="receipt-card">
      <h3>Walmart Receipt</h3>
      <p>Total: ${total.toFixed(2)}</p>
      <p> Tax amount: ${(total * 0.07).toFixed(2)}</p>
      <button onClick={handleClick}>Analyze</button>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <h1>Hello World</h1>
      <ReceiptCard total={120.00} />
    </div>
  );
}

export default App;
