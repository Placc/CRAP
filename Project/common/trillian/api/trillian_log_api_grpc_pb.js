// GENERATED CODE -- DO NOT EDIT!

// Original file comments:
// Copyright 2016 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
"use strict";
var grpc = require("grpc");
var trillian_log_api_pb = require("./trillian_log_api_pb.js");
var google_protobuf_timestamp_pb = require("google-protobuf/google/protobuf/timestamp_pb");
var google_rpc_status_pb = require("../rpc/status_pb.js");
var trillian_pb = require("./trillian_pb.js");

function serialize_trillian_AddSequencedLeafRequest(arg) {
  if (!(arg instanceof trillian_log_api_pb.AddSequencedLeafRequest)) {
    throw new Error(
      "Expected argument of type trillian.AddSequencedLeafRequest"
    );
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_AddSequencedLeafRequest(buffer_arg) {
  return trillian_log_api_pb.AddSequencedLeafRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_trillian_AddSequencedLeafResponse(arg) {
  if (!(arg instanceof trillian_log_api_pb.AddSequencedLeafResponse)) {
    throw new Error(
      "Expected argument of type trillian.AddSequencedLeafResponse"
    );
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_AddSequencedLeafResponse(buffer_arg) {
  return trillian_log_api_pb.AddSequencedLeafResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_trillian_AddSequencedLeavesRequest(arg) {
  if (!(arg instanceof trillian_log_api_pb.AddSequencedLeavesRequest)) {
    throw new Error(
      "Expected argument of type trillian.AddSequencedLeavesRequest"
    );
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_AddSequencedLeavesRequest(buffer_arg) {
  return trillian_log_api_pb.AddSequencedLeavesRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_trillian_AddSequencedLeavesResponse(arg) {
  if (!(arg instanceof trillian_log_api_pb.AddSequencedLeavesResponse)) {
    throw new Error(
      "Expected argument of type trillian.AddSequencedLeavesResponse"
    );
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_AddSequencedLeavesResponse(buffer_arg) {
  return trillian_log_api_pb.AddSequencedLeavesResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_trillian_GetConsistencyProofRequest(arg) {
  if (!(arg instanceof trillian_log_api_pb.GetConsistencyProofRequest)) {
    throw new Error(
      "Expected argument of type trillian.GetConsistencyProofRequest"
    );
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_GetConsistencyProofRequest(buffer_arg) {
  return trillian_log_api_pb.GetConsistencyProofRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_trillian_GetConsistencyProofResponse(arg) {
  if (!(arg instanceof trillian_log_api_pb.GetConsistencyProofResponse)) {
    throw new Error(
      "Expected argument of type trillian.GetConsistencyProofResponse"
    );
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_GetConsistencyProofResponse(buffer_arg) {
  return trillian_log_api_pb.GetConsistencyProofResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_trillian_GetEntryAndProofRequest(arg) {
  if (!(arg instanceof trillian_log_api_pb.GetEntryAndProofRequest)) {
    throw new Error(
      "Expected argument of type trillian.GetEntryAndProofRequest"
    );
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_GetEntryAndProofRequest(buffer_arg) {
  return trillian_log_api_pb.GetEntryAndProofRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_trillian_GetEntryAndProofResponse(arg) {
  if (!(arg instanceof trillian_log_api_pb.GetEntryAndProofResponse)) {
    throw new Error(
      "Expected argument of type trillian.GetEntryAndProofResponse"
    );
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_GetEntryAndProofResponse(buffer_arg) {
  return trillian_log_api_pb.GetEntryAndProofResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_trillian_GetInclusionProofByHashRequest(arg) {
  if (!(arg instanceof trillian_log_api_pb.GetInclusionProofByHashRequest)) {
    throw new Error(
      "Expected argument of type trillian.GetInclusionProofByHashRequest"
    );
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_GetInclusionProofByHashRequest(buffer_arg) {
  return trillian_log_api_pb.GetInclusionProofByHashRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_trillian_GetInclusionProofByHashResponse(arg) {
  if (!(arg instanceof trillian_log_api_pb.GetInclusionProofByHashResponse)) {
    throw new Error(
      "Expected argument of type trillian.GetInclusionProofByHashResponse"
    );
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_GetInclusionProofByHashResponse(buffer_arg) {
  return trillian_log_api_pb.GetInclusionProofByHashResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_trillian_GetInclusionProofRequest(arg) {
  if (!(arg instanceof trillian_log_api_pb.GetInclusionProofRequest)) {
    throw new Error(
      "Expected argument of type trillian.GetInclusionProofRequest"
    );
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_GetInclusionProofRequest(buffer_arg) {
  return trillian_log_api_pb.GetInclusionProofRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_trillian_GetInclusionProofResponse(arg) {
  if (!(arg instanceof trillian_log_api_pb.GetInclusionProofResponse)) {
    throw new Error(
      "Expected argument of type trillian.GetInclusionProofResponse"
    );
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_GetInclusionProofResponse(buffer_arg) {
  return trillian_log_api_pb.GetInclusionProofResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_trillian_GetLatestSignedLogRootRequest(arg) {
  if (!(arg instanceof trillian_log_api_pb.GetLatestSignedLogRootRequest)) {
    throw new Error(
      "Expected argument of type trillian.GetLatestSignedLogRootRequest"
    );
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_GetLatestSignedLogRootRequest(buffer_arg) {
  return trillian_log_api_pb.GetLatestSignedLogRootRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_trillian_GetLatestSignedLogRootResponse(arg) {
  if (!(arg instanceof trillian_log_api_pb.GetLatestSignedLogRootResponse)) {
    throw new Error(
      "Expected argument of type trillian.GetLatestSignedLogRootResponse"
    );
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_GetLatestSignedLogRootResponse(buffer_arg) {
  return trillian_log_api_pb.GetLatestSignedLogRootResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_trillian_GetLeavesByHashRequest(arg) {
  if (!(arg instanceof trillian_log_api_pb.GetLeavesByHashRequest)) {
    throw new Error(
      "Expected argument of type trillian.GetLeavesByHashRequest"
    );
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_GetLeavesByHashRequest(buffer_arg) {
  return trillian_log_api_pb.GetLeavesByHashRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_trillian_GetLeavesByHashResponse(arg) {
  if (!(arg instanceof trillian_log_api_pb.GetLeavesByHashResponse)) {
    throw new Error(
      "Expected argument of type trillian.GetLeavesByHashResponse"
    );
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_GetLeavesByHashResponse(buffer_arg) {
  return trillian_log_api_pb.GetLeavesByHashResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_trillian_GetLeavesByIndexRequest(arg) {
  if (!(arg instanceof trillian_log_api_pb.GetLeavesByIndexRequest)) {
    throw new Error(
      "Expected argument of type trillian.GetLeavesByIndexRequest"
    );
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_GetLeavesByIndexRequest(buffer_arg) {
  return trillian_log_api_pb.GetLeavesByIndexRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_trillian_GetLeavesByIndexResponse(arg) {
  if (!(arg instanceof trillian_log_api_pb.GetLeavesByIndexResponse)) {
    throw new Error(
      "Expected argument of type trillian.GetLeavesByIndexResponse"
    );
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_GetLeavesByIndexResponse(buffer_arg) {
  return trillian_log_api_pb.GetLeavesByIndexResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_trillian_GetLeavesByRangeRequest(arg) {
  if (!(arg instanceof trillian_log_api_pb.GetLeavesByRangeRequest)) {
    throw new Error(
      "Expected argument of type trillian.GetLeavesByRangeRequest"
    );
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_GetLeavesByRangeRequest(buffer_arg) {
  return trillian_log_api_pb.GetLeavesByRangeRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_trillian_GetLeavesByRangeResponse(arg) {
  if (!(arg instanceof trillian_log_api_pb.GetLeavesByRangeResponse)) {
    throw new Error(
      "Expected argument of type trillian.GetLeavesByRangeResponse"
    );
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_GetLeavesByRangeResponse(buffer_arg) {
  return trillian_log_api_pb.GetLeavesByRangeResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_trillian_GetSequencedLeafCountRequest(arg) {
  if (!(arg instanceof trillian_log_api_pb.GetSequencedLeafCountRequest)) {
    throw new Error(
      "Expected argument of type trillian.GetSequencedLeafCountRequest"
    );
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_GetSequencedLeafCountRequest(buffer_arg) {
  return trillian_log_api_pb.GetSequencedLeafCountRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_trillian_GetSequencedLeafCountResponse(arg) {
  if (!(arg instanceof trillian_log_api_pb.GetSequencedLeafCountResponse)) {
    throw new Error(
      "Expected argument of type trillian.GetSequencedLeafCountResponse"
    );
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_GetSequencedLeafCountResponse(buffer_arg) {
  return trillian_log_api_pb.GetSequencedLeafCountResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_trillian_InitLogRequest(arg) {
  if (!(arg instanceof trillian_log_api_pb.InitLogRequest)) {
    throw new Error("Expected argument of type trillian.InitLogRequest");
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_InitLogRequest(buffer_arg) {
  return trillian_log_api_pb.InitLogRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_trillian_InitLogResponse(arg) {
  if (!(arg instanceof trillian_log_api_pb.InitLogResponse)) {
    throw new Error("Expected argument of type trillian.InitLogResponse");
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_InitLogResponse(buffer_arg) {
  return trillian_log_api_pb.InitLogResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_trillian_QueueLeafRequest(arg) {
  if (!(arg instanceof trillian_log_api_pb.QueueLeafRequest)) {
    throw new Error("Expected argument of type trillian.QueueLeafRequest");
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_QueueLeafRequest(buffer_arg) {
  return trillian_log_api_pb.QueueLeafRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_trillian_QueueLeafResponse(arg) {
  if (!(arg instanceof trillian_log_api_pb.QueueLeafResponse)) {
    throw new Error("Expected argument of type trillian.QueueLeafResponse");
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_QueueLeafResponse(buffer_arg) {
  return trillian_log_api_pb.QueueLeafResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_trillian_QueueLeavesRequest(arg) {
  if (!(arg instanceof trillian_log_api_pb.QueueLeavesRequest)) {
    throw new Error("Expected argument of type trillian.QueueLeavesRequest");
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_QueueLeavesRequest(buffer_arg) {
  return trillian_log_api_pb.QueueLeavesRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_trillian_QueueLeavesResponse(arg) {
  if (!(arg instanceof trillian_log_api_pb.QueueLeavesResponse)) {
    throw new Error("Expected argument of type trillian.QueueLeavesResponse");
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_QueueLeavesResponse(buffer_arg) {
  return trillian_log_api_pb.QueueLeavesResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

// Provides access to a Verifiable Log data structure as defined in the
// [Verifiable Data Structures](docs/VerifiableDataStructures.pdf) paper.
//
// The API supports adding new entries to be integrated into the log's tree. It
// does not provide arbitrary tree modifications. Additionally, it has read
// operations such as obtaining tree leaves, inclusion/consistency proofs etc.
var TrillianLogService = (exports.TrillianLogService = {
  // Adds a single leaf to the queue.
  queueLeaf: {
    path: "/trillian.TrillianLog/QueueLeaf",
    requestStream: false,
    responseStream: false,
    requestType: trillian_log_api_pb.QueueLeafRequest,
    responseType: trillian_log_api_pb.QueueLeafResponse,
    requestSerialize: serialize_trillian_QueueLeafRequest,
    requestDeserialize: deserialize_trillian_QueueLeafRequest,
    responseSerialize: serialize_trillian_QueueLeafResponse,
    responseDeserialize: deserialize_trillian_QueueLeafResponse
  },
  // Adds a single leaf with an assigned sequence number.
  // Warning: This RPC is under development, don't use it.
  addSequencedLeaf: {
    path: "/trillian.TrillianLog/AddSequencedLeaf",
    requestStream: false,
    responseStream: false,
    requestType: trillian_log_api_pb.AddSequencedLeafRequest,
    responseType: trillian_log_api_pb.AddSequencedLeafResponse,
    requestSerialize: serialize_trillian_AddSequencedLeafRequest,
    requestDeserialize: deserialize_trillian_AddSequencedLeafRequest,
    responseSerialize: serialize_trillian_AddSequencedLeafResponse,
    responseDeserialize: deserialize_trillian_AddSequencedLeafResponse
  },
  //
  // No direct equivalent at the storage level.
  //
  //
  // Returns inclusion proof for a leaf with a given index in a given tree.
  getInclusionProof: {
    path: "/trillian.TrillianLog/GetInclusionProof",
    requestStream: false,
    responseStream: false,
    requestType: trillian_log_api_pb.GetInclusionProofRequest,
    responseType: trillian_log_api_pb.GetInclusionProofResponse,
    requestSerialize: serialize_trillian_GetInclusionProofRequest,
    requestDeserialize: deserialize_trillian_GetInclusionProofRequest,
    responseSerialize: serialize_trillian_GetInclusionProofResponse,
    responseDeserialize: deserialize_trillian_GetInclusionProofResponse
  },
  // Returns inclusion proof for a leaf with a given identity hash in a given
  // tree.
  getInclusionProofByHash: {
    path: "/trillian.TrillianLog/GetInclusionProofByHash",
    requestStream: false,
    responseStream: false,
    requestType: trillian_log_api_pb.GetInclusionProofByHashRequest,
    responseType: trillian_log_api_pb.GetInclusionProofByHashResponse,
    requestSerialize: serialize_trillian_GetInclusionProofByHashRequest,
    requestDeserialize: deserialize_trillian_GetInclusionProofByHashRequest,
    responseSerialize: serialize_trillian_GetInclusionProofByHashResponse,
    responseDeserialize: deserialize_trillian_GetInclusionProofByHashResponse
  },
  // Returns consistency proof between two versions of a given tree.
  getConsistencyProof: {
    path: "/trillian.TrillianLog/GetConsistencyProof",
    requestStream: false,
    responseStream: false,
    requestType: trillian_log_api_pb.GetConsistencyProofRequest,
    responseType: trillian_log_api_pb.GetConsistencyProofResponse,
    requestSerialize: serialize_trillian_GetConsistencyProofRequest,
    requestDeserialize: deserialize_trillian_GetConsistencyProofRequest,
    responseSerialize: serialize_trillian_GetConsistencyProofResponse,
    responseDeserialize: deserialize_trillian_GetConsistencyProofResponse
  },
  // Returns the latest signed log root for a given tree. Corresponds to the
  // ReadOnlyLogTreeTX.LatestSignedLogRoot storage interface.
  getLatestSignedLogRoot: {
    path: "/trillian.TrillianLog/GetLatestSignedLogRoot",
    requestStream: false,
    responseStream: false,
    requestType: trillian_log_api_pb.GetLatestSignedLogRootRequest,
    responseType: trillian_log_api_pb.GetLatestSignedLogRootResponse,
    requestSerialize: serialize_trillian_GetLatestSignedLogRootRequest,
    requestDeserialize: deserialize_trillian_GetLatestSignedLogRootRequest,
    responseSerialize: serialize_trillian_GetLatestSignedLogRootResponse,
    responseDeserialize: deserialize_trillian_GetLatestSignedLogRootResponse
  },
  // Returns the total number of leaves that have been integrated into the
  // given tree. Corresponds to the ReadOnlyLogTreeTX.GetSequencedLeafCount
  // storage interface.
  // DO NOT USE - FOR DEBUGGING/TEST ONLY
  getSequencedLeafCount: {
    path: "/trillian.TrillianLog/GetSequencedLeafCount",
    requestStream: false,
    responseStream: false,
    requestType: trillian_log_api_pb.GetSequencedLeafCountRequest,
    responseType: trillian_log_api_pb.GetSequencedLeafCountResponse,
    requestSerialize: serialize_trillian_GetSequencedLeafCountRequest,
    requestDeserialize: deserialize_trillian_GetSequencedLeafCountRequest,
    responseSerialize: serialize_trillian_GetSequencedLeafCountResponse,
    responseDeserialize: deserialize_trillian_GetSequencedLeafCountResponse
  },
  // Returns log entry and the corresponding inclusion proof for a given leaf
  // index in a given tree. If the requested tree is unavailable but the leaf is in scope
  // for the current tree, return a proof in that tree instead.
  getEntryAndProof: {
    path: "/trillian.TrillianLog/GetEntryAndProof",
    requestStream: false,
    responseStream: false,
    requestType: trillian_log_api_pb.GetEntryAndProofRequest,
    responseType: trillian_log_api_pb.GetEntryAndProofResponse,
    requestSerialize: serialize_trillian_GetEntryAndProofRequest,
    requestDeserialize: deserialize_trillian_GetEntryAndProofRequest,
    responseSerialize: serialize_trillian_GetEntryAndProofResponse,
    responseDeserialize: deserialize_trillian_GetEntryAndProofResponse
  },
  //
  // Initialisation APIs.
  //
  //
  initLog: {
    path: "/trillian.TrillianLog/InitLog",
    requestStream: false,
    responseStream: false,
    requestType: trillian_log_api_pb.InitLogRequest,
    responseType: trillian_log_api_pb.InitLogResponse,
    requestSerialize: serialize_trillian_InitLogRequest,
    requestDeserialize: deserialize_trillian_InitLogRequest,
    responseSerialize: serialize_trillian_InitLogResponse,
    responseDeserialize: deserialize_trillian_InitLogResponse
  },
  //
  // Batch APIs. Correspond to `storage.ReadOnlyLogTreeTX` batch queries.
  //
  //
  // Adds a batch of leaves to the queue.
  queueLeaves: {
    path: "/trillian.TrillianLog/QueueLeaves",
    requestStream: false,
    responseStream: false,
    requestType: trillian_log_api_pb.QueueLeavesRequest,
    responseType: trillian_log_api_pb.QueueLeavesResponse,
    requestSerialize: serialize_trillian_QueueLeavesRequest,
    requestDeserialize: deserialize_trillian_QueueLeavesRequest,
    responseSerialize: serialize_trillian_QueueLeavesResponse,
    responseDeserialize: deserialize_trillian_QueueLeavesResponse
  },
  // Stores leaves from the provided batch and associates them with the log
  // positions according to the `LeafIndex` field. The indices must be
  // contiguous.
  //
  // Warning: This RPC is under development, don't use it.
  addSequencedLeaves: {
    path: "/trillian.TrillianLog/AddSequencedLeaves",
    requestStream: false,
    responseStream: false,
    requestType: trillian_log_api_pb.AddSequencedLeavesRequest,
    responseType: trillian_log_api_pb.AddSequencedLeavesResponse,
    requestSerialize: serialize_trillian_AddSequencedLeavesRequest,
    requestDeserialize: deserialize_trillian_AddSequencedLeavesRequest,
    responseSerialize: serialize_trillian_AddSequencedLeavesResponse,
    responseDeserialize: deserialize_trillian_AddSequencedLeavesResponse
  },
  // Returns a batch of leaves located in the provided positions.
  getLeavesByIndex: {
    path: "/trillian.TrillianLog/GetLeavesByIndex",
    requestStream: false,
    responseStream: false,
    requestType: trillian_log_api_pb.GetLeavesByIndexRequest,
    responseType: trillian_log_api_pb.GetLeavesByIndexResponse,
    requestSerialize: serialize_trillian_GetLeavesByIndexRequest,
    requestDeserialize: deserialize_trillian_GetLeavesByIndexRequest,
    responseSerialize: serialize_trillian_GetLeavesByIndexResponse,
    responseDeserialize: deserialize_trillian_GetLeavesByIndexResponse
  },
  // Returns a batch of leaves in a sequential range.
  getLeavesByRange: {
    path: "/trillian.TrillianLog/GetLeavesByRange",
    requestStream: false,
    responseStream: false,
    requestType: trillian_log_api_pb.GetLeavesByRangeRequest,
    responseType: trillian_log_api_pb.GetLeavesByRangeResponse,
    requestSerialize: serialize_trillian_GetLeavesByRangeRequest,
    requestDeserialize: deserialize_trillian_GetLeavesByRangeRequest,
    responseSerialize: serialize_trillian_GetLeavesByRangeResponse,
    responseDeserialize: deserialize_trillian_GetLeavesByRangeResponse
  },
  // Returns a batch of leaves by their `merkle_leaf_hash` values.
  getLeavesByHash: {
    path: "/trillian.TrillianLog/GetLeavesByHash",
    requestStream: false,
    responseStream: false,
    requestType: trillian_log_api_pb.GetLeavesByHashRequest,
    responseType: trillian_log_api_pb.GetLeavesByHashResponse,
    requestSerialize: serialize_trillian_GetLeavesByHashRequest,
    requestDeserialize: deserialize_trillian_GetLeavesByHashRequest,
    responseSerialize: serialize_trillian_GetLeavesByHashResponse,
    responseDeserialize: deserialize_trillian_GetLeavesByHashResponse
  }
});

exports.TrillianLogClient = grpc.makeGenericClientConstructor(
  TrillianLogService
);
