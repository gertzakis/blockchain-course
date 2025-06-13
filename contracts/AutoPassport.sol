// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AutoPassport {

    struct ServiceRecord {
        string serviceRecordID;
        string description;
        uint256 date;
    }

    struct IncidentRecord {
        string incidentRecordID;
        string description;
        uint256 date;
    }

    struct LegalDocument {
        string legalDocumentName;
        string description;
        uint256 date;
    }
    
    struct Vehicle {
        string vehicleId; // VIN or registration number
        ServiceRecord[] serviceRecords;  
        IncidentRecord[] incidentRecords;
        LegalDocument[] legalDocuments;

        bool exists;
    }

    mapping(string => Vehicle) private vehicles; // Map VIN => Vehicle

    event VehicleRegistered(string vehicleId);
    event ServiceRecordAdded(string vehicleId, ServiceRecord serviceRecord);
    event IncidentRecordAdded(string vehicleId, IncidentRecord incidentRecord);
    event LegalDocumentAdded(string vehicleId, LegalDocument legalDocument);

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

    function addServiceRecord(string memory vehicleId, ServiceRecord memory serviceRecord)
        public
        vehicleExists(vehicleId)
    {
        vehicles[vehicleId].serviceRecords.push(serviceRecord);
        emit ServiceRecordAdded(vehicleId, serviceRecord);
    }

    function addIncidentRecord(string memory vehicleId, IncidentRecord memory incidentRecord)
        public
        vehicleExists(vehicleId)
    {
        vehicles[vehicleId].incidentRecords.push(incidentRecord);
        emit IncidentRecordAdded(vehicleId, incidentRecord);
    }

    function addLegalDocument(string memory vehicleId, LegalDocument memory legalDocument)
        public
        vehicleExists(vehicleId)
    {
        vehicles[vehicleId].legalDocuments.push(legalDocument);
        emit LegalDocumentAdded(vehicleId, legalDocument);
    }

    // Get all records for a vehicle
    function getVehicleData(string memory vehicleId)
        public
        view
        vehicleExists(vehicleId)
        returns (
            ServiceRecord[] memory service,
            IncidentRecord[] memory incidents,
            LegalDocument[] memory documents
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
