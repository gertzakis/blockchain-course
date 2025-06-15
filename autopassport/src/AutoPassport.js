// https://docs.metamask.io/guide/ethereum-provider.html#using-the-provider

import React, { useState } from 'react'
import { ethers } from 'ethers'
import AutoPassport_abi from './contracts/AutoPassport_abi.json'

const AutoPassport = () => {

	// deploy simple storage contract and paste deployed contract address here. This value is local ganache chain
	let contractAddress = '0x8D3B9A99D9dffd533FC78C15443056cc912e0b34';

	const [errorMessage, setErrorMessage] = useState(null);
	const [defaultAccount, setDefaultAccount] = useState(null);
	const [connButtonText, setConnButtonText] = useState('Connect Wallet');

	const [vehicleData, setVehicleData] = useState(null);

	const [provider, setProvider] = useState(null);
	const [signer, setSigner] = useState(null);
	const [contract, setContract] = useState(null);

	const connectWalletHandler = () => {
		if (window.ethereum && window.ethereum.isMetaMask) {

			window.ethereum.request({ method: 'eth_requestAccounts' })
				.then(result => {
					accountChangedHandler(result[0]);
					setConnButtonText('Wallet Connected');
				})
				.catch(error => {
					setErrorMessage(error.message);

				});

		} else {
			console.log('Need to install MetaMask');
			setErrorMessage('Please install MetaMask browser extension to interact');
		}
	}

	// update account, will cause component re-render
	const accountChangedHandler = (newAccount) => {
		setDefaultAccount(newAccount);
		updateEthers();
	}

	const chainChangedHandler = () => {
		// reload the page to avoid any errors with chain change mid use of application
		window.location.reload();
	}


	// listen for account changes
	window.ethereum.on('accountsChanged', accountChangedHandler);

	window.ethereum.on('chainChanged', chainChangedHandler);

	const updateEthers = () => {
		let tempProvider = new ethers.providers.Web3Provider(window.ethereum);
		setProvider(tempProvider);

		let tempSigner = tempProvider.getSigner();
		setSigner(tempSigner);

		let tempContract = new ethers.Contract(contractAddress, AutoPassport_abi, tempSigner);
		setContract(tempContract);
	}

	const setHandler = (event) => {
		event.preventDefault();
		console.log('sending ' + event.target.vin.value + ' to the contract');
		contract.getVehicleData(event.target.vin.value);
	}

	const getHandler = (event) => {
		event.preventDefault();
		console.log('sending ' + event.target.vin.value + ' to the contract');
		let tempVehicleData = contract.getVehicleData(event.target.vin.value);
		setVehicleData(tempVehicleData);
		console.log('Vehicle Data: ' + tempVehicleData.toString());
	}

	return (
		<div>
			<h4> {"Get/Set Contract interaction"} </h4>
			<button onClick={connectWalletHandler}>{connButtonText}</button>
			<div>
				<h3>Wallet ID: {defaultAccount}</h3>
			</div>
			<form onSubmit={getHandler}>
				<input id="vin" type="text" />
				<button type={"submit"}> Get Vehicle data</button>
			</form>
			<div>
				<h3>Vehicle Data: {JSON.stringify(vehicleData)}</h3>
			</div>
			{/* <div>
				<button onClick={getVehicleData} style={{ marginTop: '5em' }}> Get Current Contract Value </button>
			</div>
			{currentContractVal}
			{errorMessage} */}
		</div>
	);
}

export default AutoPassport;