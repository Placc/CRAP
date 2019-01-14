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
var trillian_admin_api_pb = require("./trillian_admin_api_pb.js");
var trillian_pb = require("./trillian_pb.js");
var crypto_keyspb_keyspb_pb = require("../crypto/keyspb/keyspb_pb.js");
var google_protobuf_field_mask_pb = require("google-protobuf/google/protobuf/field_mask_pb");

function serialize_trillian_CreateTreeRequest(arg) {
  if (!(arg instanceof trillian_admin_api_pb.CreateTreeRequest)) {
    throw new Error("Expected argument of type trillian.CreateTreeRequest");
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_CreateTreeRequest(buffer_arg) {
  return trillian_admin_api_pb.CreateTreeRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_trillian_DeleteTreeRequest(arg) {
  if (!(arg instanceof trillian_admin_api_pb.DeleteTreeRequest)) {
    throw new Error("Expected argument of type trillian.DeleteTreeRequest");
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_DeleteTreeRequest(buffer_arg) {
  return trillian_admin_api_pb.DeleteTreeRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_trillian_GetTreeRequest(arg) {
  if (!(arg instanceof trillian_admin_api_pb.GetTreeRequest)) {
    throw new Error("Expected argument of type trillian.GetTreeRequest");
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_GetTreeRequest(buffer_arg) {
  return trillian_admin_api_pb.GetTreeRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_trillian_ListTreesRequest(arg) {
  if (!(arg instanceof trillian_admin_api_pb.ListTreesRequest)) {
    throw new Error("Expected argument of type trillian.ListTreesRequest");
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_ListTreesRequest(buffer_arg) {
  return trillian_admin_api_pb.ListTreesRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_trillian_ListTreesResponse(arg) {
  if (!(arg instanceof trillian_admin_api_pb.ListTreesResponse)) {
    throw new Error("Expected argument of type trillian.ListTreesResponse");
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_ListTreesResponse(buffer_arg) {
  return trillian_admin_api_pb.ListTreesResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_trillian_Tree(arg) {
  if (!(arg instanceof trillian_pb.Tree)) {
    throw new Error("Expected argument of type trillian.Tree");
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_Tree(buffer_arg) {
  return trillian_pb.Tree.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_trillian_UndeleteTreeRequest(arg) {
  if (!(arg instanceof trillian_admin_api_pb.UndeleteTreeRequest)) {
    throw new Error("Expected argument of type trillian.UndeleteTreeRequest");
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_UndeleteTreeRequest(buffer_arg) {
  return trillian_admin_api_pb.UndeleteTreeRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_trillian_UpdateTreeRequest(arg) {
  if (!(arg instanceof trillian_admin_api_pb.UpdateTreeRequest)) {
    throw new Error("Expected argument of type trillian.UpdateTreeRequest");
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_trillian_UpdateTreeRequest(buffer_arg) {
  return trillian_admin_api_pb.UpdateTreeRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

// Trillian Administrative interface.
// Allows creation and management of Trillian trees (both log and map trees).
var TrillianAdminService = (exports.TrillianAdminService = {
  // Lists all trees the requester has access to.
  listTrees: {
    path: "/trillian.TrillianAdmin/ListTrees",
    requestStream: false,
    responseStream: false,
    requestType: trillian_admin_api_pb.ListTreesRequest,
    responseType: trillian_admin_api_pb.ListTreesResponse,
    requestSerialize: serialize_trillian_ListTreesRequest,
    requestDeserialize: deserialize_trillian_ListTreesRequest,
    responseSerialize: serialize_trillian_ListTreesResponse,
    responseDeserialize: deserialize_trillian_ListTreesResponse
  },
  // Retrieves a tree by ID.
  getTree: {
    path: "/trillian.TrillianAdmin/GetTree",
    requestStream: false,
    responseStream: false,
    requestType: trillian_admin_api_pb.GetTreeRequest,
    responseType: trillian_pb.Tree,
    requestSerialize: serialize_trillian_GetTreeRequest,
    requestDeserialize: deserialize_trillian_GetTreeRequest,
    responseSerialize: serialize_trillian_Tree,
    responseDeserialize: deserialize_trillian_Tree
  },
  // Creates a new tree.
  // System-generated fields are not required and will be ignored if present,
  // e.g.: tree_id, create_time and update_time.
  // Returns the created tree, with all system-generated fields assigned.
  createTree: {
    path: "/trillian.TrillianAdmin/CreateTree",
    requestStream: false,
    responseStream: false,
    requestType: trillian_admin_api_pb.CreateTreeRequest,
    responseType: trillian_pb.Tree,
    requestSerialize: serialize_trillian_CreateTreeRequest,
    requestDeserialize: deserialize_trillian_CreateTreeRequest,
    responseSerialize: serialize_trillian_Tree,
    responseDeserialize: deserialize_trillian_Tree
  },
  // Updates a tree.
  // See Tree for details. Readonly fields cannot be updated.
  updateTree: {
    path: "/trillian.TrillianAdmin/UpdateTree",
    requestStream: false,
    responseStream: false,
    requestType: trillian_admin_api_pb.UpdateTreeRequest,
    responseType: trillian_pb.Tree,
    requestSerialize: serialize_trillian_UpdateTreeRequest,
    requestDeserialize: deserialize_trillian_UpdateTreeRequest,
    responseSerialize: serialize_trillian_Tree,
    responseDeserialize: deserialize_trillian_Tree
  },
  // Soft-deletes a tree.
  // A soft-deleted tree may be undeleted for a certain period, after which
  // it'll be permanently deleted.
  deleteTree: {
    path: "/trillian.TrillianAdmin/DeleteTree",
    requestStream: false,
    responseStream: false,
    requestType: trillian_admin_api_pb.DeleteTreeRequest,
    responseType: trillian_pb.Tree,
    requestSerialize: serialize_trillian_DeleteTreeRequest,
    requestDeserialize: deserialize_trillian_DeleteTreeRequest,
    responseSerialize: serialize_trillian_Tree,
    responseDeserialize: deserialize_trillian_Tree
  },
  // Undeletes a soft-deleted a tree.
  // A soft-deleted tree may be undeleted for a certain period, after which
  // it'll be permanently deleted.
  undeleteTree: {
    path: "/trillian.TrillianAdmin/UndeleteTree",
    requestStream: false,
    responseStream: false,
    requestType: trillian_admin_api_pb.UndeleteTreeRequest,
    responseType: trillian_pb.Tree,
    requestSerialize: serialize_trillian_UndeleteTreeRequest,
    requestDeserialize: deserialize_trillian_UndeleteTreeRequest,
    responseSerialize: serialize_trillian_Tree,
    responseDeserialize: deserialize_trillian_Tree
  }
});

exports.TrillianAdminClient = grpc.makeGenericClientConstructor(
  TrillianAdminService
);
