// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Payment {
    mapping(address => uint) public patientPayments;
    mapping(address => uint) public insurancePayments;
    mapping(uint => address) public hospitalById; // Map hospital ID to address
    mapping(address => bool) public validHospitals;
    address public admin;

    // Transaction history structures
    struct Transaction {
        address from;
        address to;
        uint amount;
        uint256 timestamp;
        string transactionType; // "PATIENT" or "INSURANCE"
        uint256 claimId; // Added claim ID
    }

    // Patient transaction history
    mapping(address => Transaction[]) public patientTransactionHistory;

    // Insurance transaction history
    mapping(address => Transaction[]) public insuranceTransactionHistory;

    // Hospital received payments history
    mapping(address => Transaction[]) public hospitalReceivedHistory;

    event PatientTransfer(
        address indexed from,
        address indexed to,
        uint amount,
        uint256 timestamp,
        uint256 claimId
    );
    event InsuranceTransfer(
        address indexed from,
        address indexed to,
        uint amount,
        uint256 timestamp,
        uint256 claimId
    );
    event HospitalRegistered(uint indexed hospitalId, address indexed hospital);
    event HospitalUpdated(
        uint indexed hospitalId,
        address indexed oldAddress,
        address indexed newAddress
    );

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    // Register or update hospital by ID
    function registerHospital(
        uint hospitalId,
        address hospital
    ) external onlyAdmin {
        require(hospital != address(0), "Invalid hospital address");

        address oldAddress = hospitalById[hospitalId];

        if (oldAddress != address(0)) {
            // Update existing hospital
            validHospitals[oldAddress] = false; // Invalidate old address
            emit HospitalUpdated(hospitalId, oldAddress, hospital);
        } else {
            // New hospital registration
            emit HospitalRegistered(hospitalId, hospital);
        }

        hospitalById[hospitalId] = hospital;
        validHospitals[hospital] = true;
    }

    // Get hospital address by ID
    function getHospitalAddress(
        uint hospitalId
    ) external view returns (address) {
        return hospitalById[hospitalId];
    }

    function transferFromPatient(
        address from,
        address to,
        uint amount,
        uint256 claimId
    ) external payable {
        require(validHospitals[to], "Invalid hospital");
        require(msg.value == amount, "Incorrect amount");
        payable(to).transfer(amount);
        patientPayments[from] += amount;

        // Store transaction in patient history
        Transaction memory txn = Transaction({
            from: from,
            to: to,
            amount: amount,
            timestamp: block.timestamp,
            transactionType: "PATIENT",
            claimId: claimId
        });

        patientTransactionHistory[from].push(txn);
        hospitalReceivedHistory[to].push(txn);

        emit PatientTransfer(from, to, amount, block.timestamp, claimId);
    }

    function transferFromInsurance(
        address from,
        address to,
        uint amount,
        uint256 claimId
    ) external payable {
        require(validHospitals[to], "Invalid hospital");
        require(msg.value == amount, "Incorrect amount");
        payable(to).transfer(amount);
        insurancePayments[from] += amount;

        // Store transaction in insurance history
        Transaction memory txn = Transaction({
            from: from,
            to: to,
            amount: amount,
            timestamp: block.timestamp,
            transactionType: "INSURANCE",
            claimId: claimId
        });

        insuranceTransactionHistory[from].push(txn);
        hospitalReceivedHistory[to].push(txn);

        emit InsuranceTransfer(from, to, amount, block.timestamp, claimId);
    }

    // Get wallet balance
    function getWalletBalance(address wallet) external view returns (uint256) {
        return wallet.balance;
    }

    // Get patient payment total
    function getPatientPaymentTotal(
        address patient
    ) external view returns (uint256) {
        return patientPayments[patient];
    }

    // Get insurance payment total
    function getInsurancePaymentTotal(
        address insurance
    ) external view returns (uint256) {
        return insurancePayments[insurance];
    }

    // Get patient transaction history
    function getPatientTransactionHistory(
        address patient
    ) external view returns (Transaction[] memory) {
        return patientTransactionHistory[patient];
    }

    // Get insurance transaction history
    function getInsuranceTransactionHistory(
        address insurance
    ) external view returns (Transaction[] memory) {
        return insuranceTransactionHistory[insurance];
    }

    // Get hospital received payment history
    function getHospitalReceivedHistory(
        address hospital
    ) external view returns (Transaction[] memory) {
        return hospitalReceivedHistory[hospital];
    }

    // Get patient transaction count
    function getPatientTransactionCount(
        address patient
    ) external view returns (uint256) {
        return patientTransactionHistory[patient].length;
    }

    // Get insurance transaction count
    function getInsuranceTransactionCount(
        address insurance
    ) external view returns (uint256) {
        return insuranceTransactionHistory[insurance].length;
    }

    // Get hospital received transaction count
    function getHospitalReceivedCount(
        address hospital
    ) external view returns (uint256) {
        return hospitalReceivedHistory[hospital].length;
    }
}
