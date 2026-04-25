// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract EHRAccessControl is AccessControl {
    bytes32 public constant BACKEND_ROLE = keccak256("BACKEND_ROLE");

    enum AccessStatus {
        NONE,
        REQUESTED,
        GRANTED,
        DENIED,
        REVOKED
    }

    struct AccessGrant {
        AccessStatus status;
        uint256 timestamp;
        string ipfsCID;
        bytes32 dataHash;
    }

    // UPDATED: Enhanced access log with patient and doctor IDs
    struct AccessLog {
        uint256 patientId;
        uint256 doctorId;
        AccessStatus status;
        uint256 timestamp;
        string ipfsCID;
        bytes32 dataHash;
    }

    // accessGrants is public which creates a getter function automatically
    mapping(uint256 patientId => mapping(uint256 doctorId => AccessGrant))
        public accessGrants;

    // UPDATED: Global access history array
    AccessLog[] private globalAccessHistory;

    event AccessRequested(
        uint256 indexed patientId,
        uint256 indexed doctorId,
        uint256 timestamp
    );
    event AccessGranted(
        uint256 indexed patientId,
        uint256 indexed doctorId,
        string ipfsCID,
        bytes32 dataHash,
        uint256 timestamp
    );
    event AccessDenied(
        uint256 indexed patientId,
        uint256 indexed doctorId,
        uint256 timestamp
    );
    event AccessRevoked(
        uint256 indexed patientId,
        uint256 indexed doctorId,
        uint256 timestamp
    );

    constructor(address backendAddress) {
        require(backendAddress != address(0), "Invalid backend address");

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(BACKEND_ROLE, backendAddress);
    }

    modifier onlyBackend() {
        require(
            hasRole(BACKEND_ROLE, msg.sender),
            "Unauthorized: BACKEND_ROLE required"
        );
        _;
    }

    // UPDATED: Allow re-requesting after DENIED status
    function requestAccess(
        uint256 patientId,
        uint256 doctorId
    ) external onlyBackend {
        AccessStatus currentStatus = accessGrants[patientId][doctorId].status;

        require(
            currentStatus == AccessStatus.NONE ||
                currentStatus == AccessStatus.DENIED,
            "Invalid status for request"
        );

        accessGrants[patientId][doctorId] = AccessGrant({
            status: AccessStatus.REQUESTED,
            timestamp: block.timestamp,
            ipfsCID: "",
            dataHash: bytes32(0)
        });

        // Log the request
        _addAccessLog(
            patientId,
            doctorId,
            AccessStatus.REQUESTED,
            "",
            bytes32(0)
        );

        emit AccessRequested(patientId, doctorId, block.timestamp);
    }

    // UPDATED: Allow re-granting from REVOKED status
    function grantAccess(
        uint256 patientId,
        uint256 doctorId,
        string calldata ipfsCID,
        bytes32 dataHash
    ) external onlyBackend {
        AccessStatus currentStatus = accessGrants[patientId][doctorId].status;

        require(
            currentStatus == AccessStatus.REQUESTED ||
                currentStatus == AccessStatus.REVOKED,
            "Invalid status transition"
        );

        accessGrants[patientId][doctorId] = AccessGrant({
            status: AccessStatus.GRANTED,
            timestamp: block.timestamp,
            ipfsCID: ipfsCID,
            dataHash: dataHash
        });

        // Log the grant
        _addAccessLog(
            patientId,
            doctorId,
            AccessStatus.GRANTED,
            ipfsCID,
            dataHash
        );

        emit AccessGranted(
            patientId,
            doctorId,
            ipfsCID,
            dataHash,
            block.timestamp
        );
    }

    function denyAccess(
        uint256 patientId,
        uint256 doctorId
    ) external onlyBackend {
        require(
            accessGrants[patientId][doctorId].status == AccessStatus.REQUESTED,
            "Invalid status transition"
        );

        accessGrants[patientId][doctorId].status = AccessStatus.DENIED;
        accessGrants[patientId][doctorId].timestamp = block.timestamp;

        // Log the denial
        _addAccessLog(patientId, doctorId, AccessStatus.DENIED, "", bytes32(0));

        emit AccessDenied(patientId, doctorId, block.timestamp);
    }

    function revokeAccess(
        uint256 patientId,
        uint256 doctorId
    ) external onlyBackend {
        require(
            accessGrants[patientId][doctorId].status == AccessStatus.GRANTED,
            "Invalid status transition"
        );

        accessGrants[patientId][doctorId].status = AccessStatus.REVOKED;
        accessGrants[patientId][doctorId].timestamp = block.timestamp;

        // Log the revocation
        _addAccessLog(
            patientId,
            doctorId,
            AccessStatus.REVOKED,
            accessGrants[patientId][doctorId].ipfsCID,
            accessGrants[patientId][doctorId].dataHash
        );

        emit AccessRevoked(patientId, doctorId, block.timestamp);
    }

    // Get complete global access history
    function getAccessHistory()
        external
        view
        onlyBackend
        returns (AccessLog[] memory)
    {
        return globalAccessHistory;
    }

    // NEW: Get total count of access logs
    function getAccessHistoryCount()
        external
        view
        onlyBackend
        returns (uint256)
    {
        return globalAccessHistory.length;
    }

    // NEW: Get paginated access history
    function getAccessHistoryPaginated(
        uint256 offset,
        uint256 limit
    ) external view onlyBackend returns (AccessLog[] memory) {
        uint256 total = globalAccessHistory.length;

        if (offset >= total) {
            return new AccessLog[](0);
        }

        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }

        uint256 size = end - offset;
        AccessLog[] memory result = new AccessLog[](size);

        for (uint256 i = 0; i < size; i++) {
            result[i] = globalAccessHistory[offset + i];
        }

        return result;
    }

    // PRIVATE: Helper function to log access changes to global history
    function _addAccessLog(
        uint256 patientId,
        uint256 doctorId,
        AccessStatus status,
        string memory ipfsCID,
        bytes32 dataHash
    ) private {
        globalAccessHistory.push(
            AccessLog({
                patientId: patientId,
                doctorId: doctorId,
                status: status,
                timestamp: block.timestamp,
                ipfsCID: ipfsCID,
                dataHash: dataHash
            })
        );
    }
}
