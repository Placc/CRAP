// package: trillian
// file: trillian_map_api.proto

import * as grpc from "grpc";
import * as trillian_map_api_pb from "./trillian_map_api_pb";
import * as trillian_pb from "./trillian_pb";

interface ITrillianMapService
  extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
  getLeaves: ITrillianMapService_IGetLeaves;
  getLeavesByRevision: ITrillianMapService_IGetLeavesByRevision;
  setLeaves: ITrillianMapService_ISetLeaves;
  getSignedMapRoot: ITrillianMapService_IGetSignedMapRoot;
  getSignedMapRootByRevision: ITrillianMapService_IGetSignedMapRootByRevision;
  initMap: ITrillianMapService_IInitMap;
}

interface ITrillianMapService_IGetLeaves {
  path: string; // "/trillian.TrillianMap/GetLeaves"
  requestStream: boolean; // false
  responseStream: boolean; // false
  requestSerialize: grpc.serialize<trillian_map_api_pb.GetMapLeavesRequest>;
  requestDeserialize: grpc.deserialize<trillian_map_api_pb.GetMapLeavesRequest>;
  responseSerialize: grpc.serialize<trillian_map_api_pb.GetMapLeavesResponse>;
  responseDeserialize: grpc.deserialize<
    trillian_map_api_pb.GetMapLeavesResponse
  >;
}

interface ITrillianMapService_IGetLeavesByRevision {
  path: string; // "/trillian.TrillianMap/GetLeavesByRevision"
  requestStream: boolean; // false
  responseStream: boolean; // false
  requestSerialize: grpc.serialize<
    trillian_map_api_pb.GetMapLeavesByRevisionRequest
  >;
  requestDeserialize: grpc.deserialize<
    trillian_map_api_pb.GetMapLeavesByRevisionRequest
  >;
  responseSerialize: grpc.serialize<trillian_map_api_pb.GetMapLeavesResponse>;
  responseDeserialize: grpc.deserialize<
    trillian_map_api_pb.GetMapLeavesResponse
  >;
}

interface ITrillianMapService_ISetLeaves {
  path: string; // "/trillian.TrillianMap/SetLeaves"
  requestStream: boolean; // false
  responseStream: boolean; // false
  requestSerialize: grpc.serialize<trillian_map_api_pb.SetMapLeavesRequest>;
  requestDeserialize: grpc.deserialize<trillian_map_api_pb.SetMapLeavesRequest>;
  responseSerialize: grpc.serialize<trillian_map_api_pb.SetMapLeavesResponse>;
  responseDeserialize: grpc.deserialize<
    trillian_map_api_pb.SetMapLeavesResponse
  >;
}

interface ITrillianMapService_IGetSignedMapRoot {
  path: string; // "/trillian.TrillianMap/GetSignedMapRoot"
  requestStream: boolean; // false
  responseStream: boolean; // false
  requestSerialize: grpc.serialize<trillian_map_api_pb.GetSignedMapRootRequest>;
  requestDeserialize: grpc.deserialize<
    trillian_map_api_pb.GetSignedMapRootRequest
  >;
  responseSerialize: grpc.serialize<
    trillian_map_api_pb.GetSignedMapRootResponse
  >;
  responseDeserialize: grpc.deserialize<
    trillian_map_api_pb.GetSignedMapRootResponse
  >;
}

interface ITrillianMapService_IGetSignedMapRootByRevision {
  path: string; // "/trillian.TrillianMap/GetSignedMapRootByRevision"
  requestStream: boolean; // false
  responseStream: boolean; // false
  requestSerialize: grpc.serialize<
    trillian_map_api_pb.GetSignedMapRootByRevisionRequest
  >;
  requestDeserialize: grpc.deserialize<
    trillian_map_api_pb.GetSignedMapRootByRevisionRequest
  >;
  responseSerialize: grpc.serialize<
    trillian_map_api_pb.GetSignedMapRootResponse
  >;
  responseDeserialize: grpc.deserialize<
    trillian_map_api_pb.GetSignedMapRootResponse
  >;
}

interface ITrillianMapService_IInitMap {
  path: string; // "/trillian.TrillianMap/InitMap"
  requestStream: boolean; // false
  responseStream: boolean; // false
  requestSerialize: grpc.serialize<trillian_map_api_pb.InitMapRequest>;
  requestDeserialize: grpc.deserialize<trillian_map_api_pb.InitMapRequest>;
  responseSerialize: grpc.serialize<trillian_map_api_pb.InitMapResponse>;
  responseDeserialize: grpc.deserialize<trillian_map_api_pb.InitMapResponse>;
}

export const TrillianMapService: ITrillianMapService;
export interface ITrillianMapServer {
  getLeaves: grpc.handleUnaryCall<
    trillian_map_api_pb.GetMapLeavesRequest,
    trillian_map_api_pb.GetMapLeavesResponse
  >;
  getLeavesByRevision: grpc.handleUnaryCall<
    trillian_map_api_pb.GetMapLeavesByRevisionRequest,
    trillian_map_api_pb.GetMapLeavesResponse
  >;
  setLeaves: grpc.handleUnaryCall<
    trillian_map_api_pb.SetMapLeavesRequest,
    trillian_map_api_pb.SetMapLeavesResponse
  >;
  getSignedMapRoot: grpc.handleUnaryCall<
    trillian_map_api_pb.GetSignedMapRootRequest,
    trillian_map_api_pb.GetSignedMapRootResponse
  >;
  getSignedMapRootByRevision: grpc.handleUnaryCall<
    trillian_map_api_pb.GetSignedMapRootByRevisionRequest,
    trillian_map_api_pb.GetSignedMapRootResponse
  >;
  initMap: grpc.handleUnaryCall<
    trillian_map_api_pb.InitMapRequest,
    trillian_map_api_pb.InitMapResponse
  >;
}

export interface ITrillianMapClient {
  getLeaves(
    request: trillian_map_api_pb.GetMapLeavesRequest,
    callback: (
      error: Error | null,
      response: trillian_map_api_pb.GetMapLeavesResponse
    ) => void
  ): grpc.ClientUnaryCall;
  getLeaves(
    request: trillian_map_api_pb.GetMapLeavesRequest,
    metadata: grpc.Metadata,
    callback: (
      error: Error | null,
      response: trillian_map_api_pb.GetMapLeavesResponse
    ) => void
  ): grpc.ClientUnaryCall;
  getLeavesByRevision(
    request: trillian_map_api_pb.GetMapLeavesByRevisionRequest,
    callback: (
      error: Error | null,
      response: trillian_map_api_pb.GetMapLeavesResponse
    ) => void
  ): grpc.ClientUnaryCall;
  getLeavesByRevision(
    request: trillian_map_api_pb.GetMapLeavesByRevisionRequest,
    metadata: grpc.Metadata,
    callback: (
      error: Error | null,
      response: trillian_map_api_pb.GetMapLeavesResponse
    ) => void
  ): grpc.ClientUnaryCall;
  setLeaves(
    request: trillian_map_api_pb.SetMapLeavesRequest,
    callback: (
      error: Error | null,
      response: trillian_map_api_pb.SetMapLeavesResponse
    ) => void
  ): grpc.ClientUnaryCall;
  setLeaves(
    request: trillian_map_api_pb.SetMapLeavesRequest,
    metadata: grpc.Metadata,
    callback: (
      error: Error | null,
      response: trillian_map_api_pb.SetMapLeavesResponse
    ) => void
  ): grpc.ClientUnaryCall;
  getSignedMapRoot(
    request: trillian_map_api_pb.GetSignedMapRootRequest,
    callback: (
      error: Error | null,
      response: trillian_map_api_pb.GetSignedMapRootResponse
    ) => void
  ): grpc.ClientUnaryCall;
  getSignedMapRoot(
    request: trillian_map_api_pb.GetSignedMapRootRequest,
    metadata: grpc.Metadata,
    callback: (
      error: Error | null,
      response: trillian_map_api_pb.GetSignedMapRootResponse
    ) => void
  ): grpc.ClientUnaryCall;
  getSignedMapRootByRevision(
    request: trillian_map_api_pb.GetSignedMapRootByRevisionRequest,
    callback: (
      error: Error | null,
      response: trillian_map_api_pb.GetSignedMapRootResponse
    ) => void
  ): grpc.ClientUnaryCall;
  getSignedMapRootByRevision(
    request: trillian_map_api_pb.GetSignedMapRootByRevisionRequest,
    metadata: grpc.Metadata,
    callback: (
      error: Error | null,
      response: trillian_map_api_pb.GetSignedMapRootResponse
    ) => void
  ): grpc.ClientUnaryCall;
  initMap(
    request: trillian_map_api_pb.InitMapRequest,
    callback: (
      error: Error | null,
      response: trillian_map_api_pb.InitMapResponse
    ) => void
  ): grpc.ClientUnaryCall;
  initMap(
    request: trillian_map_api_pb.InitMapRequest,
    metadata: grpc.Metadata,
    callback: (
      error: Error | null,
      response: trillian_map_api_pb.InitMapResponse
    ) => void
  ): grpc.ClientUnaryCall;
}

export class TrillianMapClient extends grpc.Client
  implements ITrillianMapClient {
  constructor(
    address: string,
    credentials: grpc.ChannelCredentials,
    options?: object
  );
  public getLeaves(
    request: trillian_map_api_pb.GetMapLeavesRequest,
    callback: (
      error: Error | null,
      response: trillian_map_api_pb.GetMapLeavesResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public getLeaves(
    request: trillian_map_api_pb.GetMapLeavesRequest,
    metadata: grpc.Metadata,
    callback: (
      error: Error | null,
      response: trillian_map_api_pb.GetMapLeavesResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public getLeavesByRevision(
    request: trillian_map_api_pb.GetMapLeavesByRevisionRequest,
    callback: (
      error: Error | null,
      response: trillian_map_api_pb.GetMapLeavesResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public getLeavesByRevision(
    request: trillian_map_api_pb.GetMapLeavesByRevisionRequest,
    metadata: grpc.Metadata,
    callback: (
      error: Error | null,
      response: trillian_map_api_pb.GetMapLeavesResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public setLeaves(
    request: trillian_map_api_pb.SetMapLeavesRequest,
    callback: (
      error: Error | null,
      response: trillian_map_api_pb.SetMapLeavesResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public setLeaves(
    request: trillian_map_api_pb.SetMapLeavesRequest,
    metadata: grpc.Metadata,
    callback: (
      error: Error | null,
      response: trillian_map_api_pb.SetMapLeavesResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public getSignedMapRoot(
    request: trillian_map_api_pb.GetSignedMapRootRequest,
    callback: (
      error: Error | null,
      response: trillian_map_api_pb.GetSignedMapRootResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public getSignedMapRoot(
    request: trillian_map_api_pb.GetSignedMapRootRequest,
    metadata: grpc.Metadata,
    callback: (
      error: Error | null,
      response: trillian_map_api_pb.GetSignedMapRootResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public getSignedMapRootByRevision(
    request: trillian_map_api_pb.GetSignedMapRootByRevisionRequest,
    callback: (
      error: Error | null,
      response: trillian_map_api_pb.GetSignedMapRootResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public getSignedMapRootByRevision(
    request: trillian_map_api_pb.GetSignedMapRootByRevisionRequest,
    metadata: grpc.Metadata,
    callback: (
      error: Error | null,
      response: trillian_map_api_pb.GetSignedMapRootResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public initMap(
    request: trillian_map_api_pb.InitMapRequest,
    callback: (
      error: Error | null,
      response: trillian_map_api_pb.InitMapResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public initMap(
    request: trillian_map_api_pb.InitMapRequest,
    metadata: grpc.Metadata,
    callback: (
      error: Error | null,
      response: trillian_map_api_pb.InitMapResponse
    ) => void
  ): grpc.ClientUnaryCall;
}
