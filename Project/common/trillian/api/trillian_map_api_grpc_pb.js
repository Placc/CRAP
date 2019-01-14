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
var trillian_map_api_pb = require("./trillian_map_api_pb.js");
var trillian_pb = require("./trillian_pb.js");

function serialize_trillian_GetMapLeavesByRevisionRequest(arg) {
  if (!(arg instanceof trillian_map_api_pb.GetMapLeavesByRevisionRequest)) {
    throw new Error(
      "Expected argument of type trillian.GetMapLeavesByRevisionRequest"
    );
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_GetMapLeavesByRevisionRequest(buffer_arg) {
  return trillian_map_api_pb.GetMapLeavesByRevisionRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_trillian_GetMapLeavesRequest(arg) {
  if (!(arg instanceof trillian_map_api_pb.GetMapLeavesRequest)) {
    throw new Error("Expected argument of type trillian.GetMapLeavesRequest");
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_GetMapLeavesRequest(buffer_arg) {
  return trillian_map_api_pb.GetMapLeavesRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_trillian_GetMapLeavesResponse(arg) {
  if (!(arg instanceof trillian_map_api_pb.GetMapLeavesResponse)) {
    throw new Error("Expected argument of type trillian.GetMapLeavesResponse");
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_GetMapLeavesResponse(buffer_arg) {
  return trillian_map_api_pb.GetMapLeavesResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_trillian_GetSignedMapRootByRevisionRequest(arg) {
  if (!(arg instanceof trillian_map_api_pb.GetSignedMapRootByRevisionRequest)) {
    throw new Error(
      "Expected argument of type trillian.GetSignedMapRootByRevisionRequest"
    );
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_GetSignedMapRootByRevisionRequest(buffer_arg) {
  return trillian_map_api_pb.GetSignedMapRootByRevisionRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_trillian_GetSignedMapRootRequest(arg) {
  if (!(arg instanceof trillian_map_api_pb.GetSignedMapRootRequest)) {
    throw new Error(
      "Expected argument of type trillian.GetSignedMapRootRequest"
    );
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_GetSignedMapRootRequest(buffer_arg) {
  return trillian_map_api_pb.GetSignedMapRootRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_trillian_GetSignedMapRootResponse(arg) {
  if (!(arg instanceof trillian_map_api_pb.GetSignedMapRootResponse)) {
    throw new Error(
      "Expected argument of type trillian.GetSignedMapRootResponse"
    );
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_GetSignedMapRootResponse(buffer_arg) {
  return trillian_map_api_pb.GetSignedMapRootResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_trillian_InitMapRequest(arg) {
  if (!(arg instanceof trillian_map_api_pb.InitMapRequest)) {
    throw new Error("Expected argument of type trillian.InitMapRequest");
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_InitMapRequest(buffer_arg) {
  return trillian_map_api_pb.InitMapRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_trillian_InitMapResponse(arg) {
  if (!(arg instanceof trillian_map_api_pb.InitMapResponse)) {
    throw new Error("Expected argument of type trillian.InitMapResponse");
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_InitMapResponse(buffer_arg) {
  return trillian_map_api_pb.InitMapResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_trillian_SetMapLeavesRequest(arg) {
  if (!(arg instanceof trillian_map_api_pb.SetMapLeavesRequest)) {
    throw new Error("Expected argument of type trillian.SetMapLeavesRequest");
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_SetMapLeavesRequest(buffer_arg) {
  return trillian_map_api_pb.SetMapLeavesRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_trillian_SetMapLeavesResponse(arg) {
  if (!(arg instanceof trillian_map_api_pb.SetMapLeavesResponse)) {
    throw new Error("Expected argument of type trillian.SetMapLeavesResponse");
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_SetMapLeavesResponse(buffer_arg) {
  return trillian_map_api_pb.SetMapLeavesResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

// TrillianMap defines a service which provides access to a Verifiable Map as
// defined in the Verifiable Data Structures paper.
var TrillianMapService = (exports.TrillianMapService = {
  // GetLeaves returns an inclusion proof for each index requested.
  // For indexes that do not exist, the inclusion proof will use nil for the empty leaf value.
  getLeaves: {
    path: "/trillian.TrillianMap/GetLeaves",
    requestStream: false,
    responseStream: false,
    requestType: trillian_map_api_pb.GetMapLeavesRequest,
    responseType: trillian_map_api_pb.GetMapLeavesResponse,
    requestSerialize: serialize_trillian_GetMapLeavesRequest,
    requestDeserialize: deserialize_trillian_GetMapLeavesRequest,
    responseSerialize: serialize_trillian_GetMapLeavesResponse,
    responseDeserialize: deserialize_trillian_GetMapLeavesResponse
  },
  getLeavesByRevision: {
    path: "/trillian.TrillianMap/GetLeavesByRevision",
    requestStream: false,
    responseStream: false,
    requestType: trillian_map_api_pb.GetMapLeavesByRevisionRequest,
    responseType: trillian_map_api_pb.GetMapLeavesResponse,
    requestSerialize: serialize_trillian_GetMapLeavesByRevisionRequest,
    requestDeserialize: deserialize_trillian_GetMapLeavesByRevisionRequest,
    responseSerialize: serialize_trillian_GetMapLeavesResponse,
    responseDeserialize: deserialize_trillian_GetMapLeavesResponse
  },
  // SetLeaves sets the values for the provided leaves, and returns the new map root if successful.
  // Note that if a SetLeaves request fails for a server-side reason (i.e. not an invalid request),
  // the API user is required to retry the request before performing a different SetLeaves request.
  setLeaves: {
    path: "/trillian.TrillianMap/SetLeaves",
    requestStream: false,
    responseStream: false,
    requestType: trillian_map_api_pb.SetMapLeavesRequest,
    responseType: trillian_map_api_pb.SetMapLeavesResponse,
    requestSerialize: serialize_trillian_SetMapLeavesRequest,
    requestDeserialize: deserialize_trillian_SetMapLeavesRequest,
    responseSerialize: serialize_trillian_SetMapLeavesResponse,
    responseDeserialize: deserialize_trillian_SetMapLeavesResponse
  },
  getSignedMapRoot: {
    path: "/trillian.TrillianMap/GetSignedMapRoot",
    requestStream: false,
    responseStream: false,
    requestType: trillian_map_api_pb.GetSignedMapRootRequest,
    responseType: trillian_map_api_pb.GetSignedMapRootResponse,
    requestSerialize: serialize_trillian_GetSignedMapRootRequest,
    requestDeserialize: deserialize_trillian_GetSignedMapRootRequest,
    responseSerialize: serialize_trillian_GetSignedMapRootResponse,
    responseDeserialize: deserialize_trillian_GetSignedMapRootResponse
  },
  getSignedMapRootByRevision: {
    path: "/trillian.TrillianMap/GetSignedMapRootByRevision",
    requestStream: false,
    responseStream: false,
    requestType: trillian_map_api_pb.GetSignedMapRootByRevisionRequest,
    responseType: trillian_map_api_pb.GetSignedMapRootResponse,
    requestSerialize: serialize_trillian_GetSignedMapRootByRevisionRequest,
    requestDeserialize: deserialize_trillian_GetSignedMapRootByRevisionRequest,
    responseSerialize: serialize_trillian_GetSignedMapRootResponse,
    responseDeserialize: deserialize_trillian_GetSignedMapRootResponse
  },
  initMap: {
    path: "/trillian.TrillianMap/InitMap",
    requestStream: false,
    responseStream: false,
    requestType: trillian_map_api_pb.InitMapRequest,
    responseType: trillian_map_api_pb.InitMapResponse,
    requestSerialize: serialize_trillian_InitMapRequest,
    requestDeserialize: deserialize_trillian_InitMapRequest,
    responseSerialize: serialize_trillian_InitMapResponse,
    responseDeserialize: deserialize_trillian_InitMapResponse
  }
});

exports.TrillianMapClient = grpc.makeGenericClientConstructor(
  TrillianMapService
);
