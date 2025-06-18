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
	const [loading, setLoading] = useState(false);
	const [vehicleId, setVehicleId] = useState("");
	const [incidentData, setIncidentData] = useState("");
	const [serviceData, setServiceData] = useState("");


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

	// Get vehicle data by ID
	const handleGetVehicle = async () => {
		setLoading(true);
		try {
			const data = await contract.getVehicleData(vehicleId);
			setVehicleData(data);
		} catch (err) {
			alert("Error fetching vehicle: " + err.message);
			setVehicleData(null);
		}
		setLoading(false);
	};

	// Register a new vehicle
	const handleRegisterVehicle = async () => {
		setLoading(true);
		try {
			// Add more params if your contract requires them
			const tx = await contract.registerVehicle(vehicleId);
			await tx.wait();
			alert("Vehicle registered!");
		} catch (err) {
			alert("Error registering vehicle: " + err.message);
		}
		setLoading(false);
	};

	// Add an incident record
	const handleAddIncident = async () => {
		setLoading(true);
		try {
			// Convert comma-separated string to array and trim spaces
			const keysArray = incidentData.split(",").map(k => k.trim()).filter(k => k.length > 0);
			// Call the contract function with the array
			const tx = await contract.addIncidentRecord(vehicleId, keysArray);
			await tx.wait();
			alert("Incident record added!");
			setIncidentData("");
		} catch (err) {
			alert("Error adding incident: " + err.message);
		}
		setLoading(false);
	};

	// Add a service record
	const handleAddService = async () => {
		setLoading(true);
		try {
			// Convert comma-separated string to array and trim spaces
			const keysArray = serviceData.split(",").map(k => k.trim()).filter(k => k.length > 0);
			// Call the contract function with the array
			const tx = await contract.addServiceRecord(vehicleId, keysArray);
			await tx.wait();
			alert("Service record added!");
			setServiceData("");
		} catch (err) {
			alert("Error adding service: " + err.message);
		}
		setLoading(false);
	};

	return (
		<div>
			<h4> {"Get/Set Contract interaction"} </h4>
			<button onClick={connectWalletHandler}>{connButtonText}</button>
			<div>
				<h3>Wallet ID: {defaultAccount}</h3>
			</div>

			<input
				value={vehicleId}
				onChange={e => setVehicleId(e.target.value)}
				placeholder="Vehicle ID"
			/>
			<button onClick={handleGetVehicle} disabled={loading}>
				Get Vehicle Data
			</button>
			<button onClick={handleRegisterVehicle} disabled={loading}>
				Register Vehicle
			</button>
			<div style={{ marginTop: "1em" }}>
				<input
					value={serviceData}
					onChange={e => setServiceData(e.target.value)}
					placeholder='Service Data (e.g. key-1,key-2,key-3)'
				/>
				<button onClick={handleAddService} disabled={loading || !serviceData}>
					Add Service Record
				</button>
			</div>
			<div style={{ marginTop: "1em" }}>
				<input
					value={incidentData}
					onChange={e => setIncidentData(e.target.value)}
					placeholder='Incident Data (e.g. key-1,key-2,key-3)'
				/>
				<button onClick={handleAddIncident} disabled={loading || !incidentData}>
					Add Incident Record
				</button>
			</div>
			{loading && <p>Loading...</p>}
			{vehicleData && (
				<div>
					<h3>Vehicle Data:</h3>
					<pre>{JSON.stringify(vehicleData, null, 2)}</pre>
				</div>
			)}
		</div>
	);
}

export default AutoPassport;