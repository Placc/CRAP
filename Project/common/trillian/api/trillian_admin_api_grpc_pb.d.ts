// package: trillian
// file: trillian_admin_api.proto

import * as grpc from "grpc";
import * as trillian_admin_api_pb from "./trillian_admin_api_pb";
import * as trillian_pb from "./trillian_pb";
import * as crypto_keyspb_keyspb_pb from "../crypto/keyspb/keyspb_pb";
import * as google_protobuf_field_mask_pb from "google-protobuf/google/protobuf/field_mask_pb";

interface ITrillianAdminService
  extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
  listTrees: ITrillianAdminService_IListTrees;
  getTree: ITrillianAdminService_IGetTree;
  createTree: ITrillianAdminService_ICreateTree;
  updateTree: ITrillianAdminService_IUpdateTree;
  deleteTree: ITrillianAdminService_IDeleteTree;
  undeleteTree: ITrillianAdminService_IUndeleteTree;
}

interface ITrillianAdminService_IListTrees {
  path: string; // "/trillian.TrillianAdmin/ListTrees"
  requestStream: boolean; // false
  responseStream: boolean; // false
  requestSerialize: grpc.serialize<trillian_admin_api_pb.ListTreesRequest>;
  requestDeserialize: grpc.deserialize<trillian_admin_api_pb.ListTreesRequest>;
  responseSerialize: grpc.serialize<trillian_admin_api_pb.ListTreesResponse>;
  responseDeserialize: grpc.deserialize<
    trillian_admin_api_pb.ListTreesResponse
  >;
}

interface ITrillianAdminService_IGetTree {
  path: string; // "/trillian.TrillianAdmin/GetTree"
  requestStream: boolean; // false
  responseStream: boolean; // false
  requestSerialize: grpc.serialize<trillian_admin_api_pb.GetTreeRequest>;
  requestDeserialize: grpc.deserialize<trillian_admin_api_pb.GetTreeRequest>;
  responseSerialize: grpc.serialize<trillian_pb.Tree>;
  responseDeserialize: grpc.deserialize<trillian_pb.Tree>;
}

interface ITrillianAdminService_ICreateTree {
  path: string; // "/trillian.TrillianAdmin/CreateTree"
  requestStream: boolean; // false
  responseStream: boolean; // false
  requestSerialize: grpc.serialize<trillian_admin_api_pb.CreateTreeRequest>;
  requestDeserialize: grpc.deserialize<trillian_admin_api_pb.CreateTreeRequest>;
  responseSerialize: grpc.serialize<trillian_pb.Tree>;
  responseDeserialize: grpc.deserialize<trillian_pb.Tree>;
}

interface ITrillianAdminService_IUpdateTree {
  path: string; // "/trillian.TrillianAdmin/UpdateTree"
  requestStream: boolean; // false
  responseStream: boolean; // false
  requestSerialize: grpc.serialize<trillian_admin_api_pb.UpdateTreeRequest>;
  requestDeserialize: grpc.deserialize<trillian_admin_api_pb.UpdateTreeRequest>;
  responseSerialize: grpc.serialize<trillian_pb.Tree>;
  responseDeserialize: grpc.deserialize<trillian_pb.Tree>;
}

interface ITrillianAdminService_IDeleteTree {
  path: string; // "/trillian.TrillianAdmin/DeleteTree"
  requestStream: boolean; // false
  responseStream: boolean; // false
  requestSerialize: grpc.serialize<trillian_admin_api_pb.DeleteTreeRequest>;
  requestDeserialize: grpc.deserialize<trillian_admin_api_pb.DeleteTreeRequest>;
  responseSerialize: grpc.serialize<trillian_pb.Tree>;
  responseDeserialize: grpc.deserialize<trillian_pb.Tree>;
}

interface ITrillianAdminService_IUndeleteTree {
  path: string; // "/trillian.TrillianAdmin/UndeleteTree"
  requestStream: boolean; // false
  responseStream: boolean; // false
  requestSerialize: grpc.serialize<trillian_admin_api_pb.UndeleteTreeRequest>;
  requestDeserialize: grpc.deserialize<
    trillian_admin_api_pb.UndeleteTreeRequest
  >;
  responseSerialize: grpc.serialize<trillian_pb.Tree>;
  responseDeserialize: grpc.deserialize<trillian_pb.Tree>;
}

export const TrillianAdminService: ITrillianAdminService;
export interface ITrillianAdminServer {
  listTrees: grpc.handleUnaryCall<
    trillian_admin_api_pb.ListTreesRequest,
    trillian_admin_api_pb.ListTreesResponse
  >;
  getTree: grpc.handleUnaryCall<
    trillian_admin_api_pb.GetTreeRequest,
    trillian_pb.Tree
  >;
  createTree: grpc.handleUnaryCall<
    trillian_admin_api_pb.CreateTreeRequest,
    trillian_pb.Tree
  >;
  updateTree: grpc.handleUnaryCall<
    trillian_admin_api_pb.UpdateTreeRequest,
    trillian_pb.Tree
  >;
  deleteTree: grpc.handleUnaryCall<
    trillian_admin_api_pb.DeleteTreeRequest,
    trillian_pb.Tree
  >;
  undeleteTree: grpc.handleUnaryCall<
    trillian_admin_api_pb.UndeleteTreeRequest,
    trillian_pb.Tree
  >;
}

export interface ITrillianAdminClient {
  listTrees(
    request: trillian_admin_api_pb.ListTreesRequest,
    callback: (
      error: Error | null,
      response: trillian_admin_api_pb.ListTreesResponse
    ) => void
  ): grpc.ClientUnaryCall;
  listTrees(
    request: trillian_admin_api_pb.ListTreesRequest,
    metadata: grpc.Metadata,
    callback: (
      error: Error | null,
      response: trillian_admin_api_pb.ListTreesResponse
    ) => void
  ): grpc.ClientUnaryCall;
  getTree(
    request: trillian_admin_api_pb.GetTreeRequest,
    callback: (error: Error | null, response: trillian_pb.Tree) => void
  ): grpc.ClientUnaryCall;
  getTree(
    request: trillian_admin_api_pb.GetTreeRequest,
    metadata: grpc.Metadata,
    callback: (error: Error | null, response: trillian_pb.Tree) => void
  ): grpc.ClientUnaryCall;
  createTree(
    request: trillian_admin_api_pb.CreateTreeRequest,
    callback: (error: Error | null, response: trillian_pb.Tree) => void
  ): grpc.ClientUnaryCall;
  createTree(
    request: trillian_admin_api_pb.CreateTreeRequest,
    metadata: grpc.Metadata,
    callback: (error: Error | null, response: trillian_pb.Tree) => void
  ): grpc.ClientUnaryCall;
  updateTree(
    request: trillian_admin_api_pb.UpdateTreeRequest,
    callback: (error: Error | null, response: trillian_pb.Tree) => void
  ): grpc.ClientUnaryCall;
  updateTree(
    request: trillian_admin_api_pb.UpdateTreeRequest,
    metadata: grpc.Metadata,
    callback: (error: Error | null, response: trillian_pb.Tree) => void
  ): grpc.ClientUnaryCall;
  deleteTree(
    request: trillian_admin_api_pb.DeleteTreeRequest,
    callback: (error: Error | null, response: trillian_pb.Tree) => void
  ): grpc.ClientUnaryCall;
  deleteTree(
    request: trillian_admin_api_pb.DeleteTreeRequest,
    metadata: grpc.Metadata,
    callback: (error: Error | null, response: trillian_pb.Tree) => void
  ): grpc.ClientUnaryCall;
  undeleteTree(
    request: trillian_admin_api_pb.UndeleteTreeRequest,
    callback: (error: Error | null, response: trillian_pb.Tree) => void
  ): grpc.ClientUnaryCall;
  undeleteTree(
    request: trillian_admin_api_pb.UndeleteTreeRequest,
    metadata: grpc.Metadata,
    callback: (error: Error | null, response: trillian_pb.Tree) => void
  ): grpc.ClientUnaryCall;
}

export class TrillianAdminClient extends grpc.Client
  implements ITrillianAdminClient {
  constructor(
    address: string,
    credentials: grpc.ChannelCredentials,
    options?: object
  );
  public listTrees(
    request: trillian_admin_api_pb.ListTreesRequest,
    callback: (
      error: Error | null,
      response: trillian_admin_api_pb.ListTreesResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public listTrees(
    request: trillian_admin_api_pb.ListTreesRequest,
    metadata: grpc.Metadata,
    callback: (
      error: Error | null,
      response: trillian_admin_api_pb.ListTreesResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public getTree(
    request: trillian_admin_api_pb.GetTreeRequest,
    callback: (error: Error | null, response: trillian_pb.Tree) => void
  ): grpc.ClientUnaryCall;
  public getTree(
    request: trillian_admin_api_pb.GetTreeRequest,
    metadata: grpc.Metadata,
    callback: (error: Error | null, response: trillian_pb.Tree) => void
  ): grpc.ClientUnaryCall;
  public createTree(
    request: trillian_admin_api_pb.CreateTreeRequest,
    callback: (error: Error | null, response: trillian_pb.Tree) => void
  ): grpc.ClientUnaryCall;
  public createTree(
    request: trillian_admin_api_pb.CreateTreeRequest,
    metadata: grpc.Metadata,
    callback: (error: Error | null, response: trillian_pb.Tree) => void
  ): grpc.ClientUnaryCall;
  public updateTree(
    request: trillian_admin_api_pb.UpdateTreeRequest,
    callback: (error: Error | null, response: trillian_pb.Tree) => void
  ): grpc.ClientUnaryCall;
  public updateTree(
    request: trillian_admin_api_pb.UpdateTreeRequest,
    metadata: grpc.Metadata,
    callback: (error: Error | null, response: trillian_pb.Tree) => void
  ): grpc.ClientUnaryCall;
  public deleteTree(
    request: trillian_admin_api_pb.DeleteTreeRequest,
    callback: (error: Error | null, response: trillian_pb.Tree) => void
  ): grpc.ClientUnaryCall;
  public deleteTree(
    request: trillian_admin_api_pb.DeleteTreeRequest,
    metadata: grpc.Metadata,
    callback: (error: Error | null, response: trillian_pb.Tree) => void
  ): grpc.ClientUnaryCall;
  public undeleteTree(
    request: trillian_admin_api_pb.UndeleteTreeRequest,
    callback: (error: Error | null, response: trillian_pb.Tree) => void
  ): grpc.ClientUnaryCall;
  public undeleteTree(
    request: trillian_admin_api_pb.UndeleteTreeRequest,
    metadata: grpc.Metadata,
    callback: (error: Error | null, response: trillian_pb.Tree) => void
  ): grpc.ClientUnaryCall;
}
