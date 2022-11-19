import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import Spin from './Spin';
import { encode as base64_encode } from 'base-64';
require('dotenv').config()
import './App.css';

let code = process.env.REACT_APP_INFURA_PROJECT_ID + ':' + process.env.REACT_APP_INFURA_PROJECT_SECRET;
let Block = require('ipfs-api');
let encrypted = base64_encode(code);
const block = new Block({
  host: 'ipfs.infura.io', 
  port: 5001, 
  protocol: 'https', 
  headers: {
    Authorization: 'Basic ' + encrypted
  }
});

function App() {
  const [file, setFile] = useState();
  const [key, setKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  
  const toBuf = async (reader) => {
    const buf = await Buffer.from(reader.result);
    setFile(buf);
  };
  const handleCapture = (e) => {
    e.stopPropagation()
    e.preventDefault()
    let input = new window.FileReader()
    input.readAsArrayBuffer(e.target.files[0])
    input.onloadend = () => toBuf(input)
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    let Id
    const buf = file
    await block.add(buf)
      .then((response) => {
        Id = response[0].key
        setKey(Id);
      })
    setLoaded(Id?true:false)
    setIsLoading(false);
  }
  if (isLoading) {
    return (
      <Spin />
    )
  }
  return (
    <div>
      <h1>Add files to IPSC BlockChain</h1>
      <h5> Select file to add to IPFS BLOCKCHAIN</h5>
      <Form onSubmit={handleSubmit}>
        <input type="file" onChange={handleCapture} required />
        <Button type="submit">Add</Button>
      </Form>
      {
      loaded &&
        <div>
          <p>*******************************************************************************************************</p>
          <h1>IPFS key: {key}</h1>
          <p>Non clickabe Link: https://ipfs.io/ipfs/{key}</p>
          <a href={"https://ipfs.io/ipfs/" + key}>click here to view</a>
        </div> 
      }
    </div>
  );
}

export default App;
