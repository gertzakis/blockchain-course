// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AutoPassportChain {
    
    struct Vehicle {
        string vehicleId; // VIN or registration number
        string[] serviceRecords; // Array of IPFS hashes
        string[] incidentRecords; // Array of IPFS hashes
        string[] legalDocuments; // Array of IPFS hashes
        bool exists;
    }

    mapping(string => Vehicle) private vehicles; // Map VIN => Vehicle

    event VehicleRegistered(string vehicleId);
    event ServiceRecordAdded(string vehicleId, string serviceRecordID);
    event IncidentRecordAdded(string vehicleId, string IncidentRecordID);
    event LegalDocumentAdded(string vehicleId, string LegalDocument);

    modifier vehicleExists(string memory vehicleId) {
        require(vehicles[vehicleId].exists, "Vehicle not registered");
        _;
    }

    // Register vehicle (only once)
    function registerVehicle(string memory vehicleId) public {
        require(!vehicles[vehicleId].exists, "Vehicle already registered");

        vehicles[vehicleId].vehicleId = vehicleId;
        vehicles[vehicleId].exists = true;

        emit VehicleRegistered(vehicleId);
    }

    function addServiceRecord(string memory vehicleId, string memory serviceRecordID)
        public
        vehicleExists(vehicleId)
    {
        vehicles[vehicleId].serviceRecords.push(serviceRecordID);
        emit ServiceRecordAdded(vehicleId, serviceRecordID);
    }

    function addIncidentRecord(string memory vehicleId, string memory IncidentRecordID)
        public
        vehicleExists(vehicleId)
    {
        vehicles[vehicleId].incidentRecords.push(IncidentRecordID);
        emit IncidentRecordAdded(vehicleId, IncidentRecordID);
    }

    function addLegalDocument(string memory vehicleId, string memory LegalDocument)
        public
        vehicleExists(vehicleId)
    {
        vehicles[vehicleId].legalDocuments.push(LegalDocument);
        emit LegalDocumentAdded(vehicleId, LegalDocument);
    }

    // Get all records for a vehicle
    function getVehicleData(string memory vehicleId)
        public
        view
        vehicleExists(vehicleId)
        returns (
            string[] memory service,
            string[] memory incidents,
            string[] memory documents
        )
    {
        Vehicle storage v = vehicles[vehicleId];
        return (
            v.serviceRecords,
            v.incidentRecords,
            v.legalDocuments
        );
    }
}
