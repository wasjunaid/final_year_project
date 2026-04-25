// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
//import "hardhat/console.sol"; for debugging
import "@openzeppelin/contracts/access/AccessControl.sol";

contract EHRProof is AccessControl {
    bytes32 public constant BACKEND_ROLE = keccak256("BACKEND_ROLE");

    struct Proof {
        address submitter;
        string patientId;
        string cid; // IPFS CID
        bytes32 dataHash; // SHA-256 hash of canonical JSON (not the CID)
        uint256 timestamp;
    }

    mapping(bytes32 => Proof) public proofs; // proofId => Proof
    mapping(string => bytes32) public patientProofIds; // patientId => proofId

    event ProofRecorded(
        bytes32 indexed proofId,
        string indexed patientId,
        string cid,
        bytes32 dataHash,
        address indexed submitter,
        uint256 timestamp
    );

    constructor(address backendSigner) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        if (backendSigner != address(0)) {
            _grantRole(BACKEND_ROLE, backendSigner);
        }
    }

    function computeProofId(
        string memory patientId,
        string memory cid,
        bytes32 dataHash
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(patientId, "|", cid, "|", dataHash));
    }

    function recordPatientProof(
        string calldata patientId,
        string calldata cid,
        bytes32 dataHash
    ) external onlyRole(BACKEND_ROLE) returns (bytes32 proofId) {
        proofId = computeProofId(patientId, cid, dataHash);
        require(proofs[proofId].timestamp == 0, "Proof exists");

        proofs[proofId] = Proof({
            submitter: msg.sender,
            patientId: patientId,
            cid: cid,
            dataHash: dataHash,
            timestamp: block.timestamp
        });

        patientProofIds[patientId] = proofId;

        emit ProofRecorded(
            proofId,
            patientId,
            cid,
            dataHash,
            msg.sender,
            block.timestamp
        );
    }

    function getProof(
        string calldata patientId
    )
        external
        view
        returns (
            bool exists,
            string memory cid,
            bytes32 dataHash,
            uint256 timestamp,
            address submitter
        )
    {
        bytes32 proofId = patientProofIds[patientId];

        if (proofId == bytes32(0)) {
            return (false, "", bytes32(0), 0, address(0));
        }

        Proof memory proof = proofs[proofId];

        if (proof.timestamp == 0) {
            return (false, "", bytes32(0), 0, address(0));
        }

        return (
            true,
            proof.cid,
            proof.dataHash,
            proof.timestamp,
            proof.submitter
        );
    }
}
