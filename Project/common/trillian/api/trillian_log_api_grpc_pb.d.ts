// package: trillian
// file: trillian_log_api.proto

import * as grpc from "grpc";
import * as trillian_log_api_pb from "./trillian_log_api_pb";
import * as google_protobuf_timestamp_pb from "google-protobuf/google/protobuf/timestamp_pb";
import * as google_rpc_status_pb from "../rpc/status_pb";
import * as trillian_pb from "./trillian_pb";

interface ITrillianLogService
  extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
  queueLeaf: ITrillianLogService_IQueueLeaf;
  addSequencedLeaf: ITrillianLogService_IAddSequencedLeaf;
  getInclusionProof: ITrillianLogService_IGetInclusionProof;
  getInclusionProofByHash: ITrillianLogService_IGetInclusionProofByHash;
  getConsistencyProof: ITrillianLogService_IGetConsistencyProof;
  getLatestSignedLogRoot: ITrillianLogService_IGetLatestSignedLogRoot;
  getSequencedLeafCount: ITrillianLogService_IGetSequencedLeafCount;
  getEntryAndProof: ITrillianLogService_IGetEntryAndProof;
  initLog: ITrillianLogService_IInitLog;
  queueLeaves: ITrillianLogService_IQueueLeaves;
  addSequencedLeaves: ITrillianLogService_IAddSequencedLeaves;
  getLeavesByIndex: ITrillianLogService_IGetLeavesByIndex;
  getLeavesByRange: ITrillianLogService_IGetLeavesByRange;
  getLeavesByHash: ITrillianLogService_IGetLeavesByHash;
}

interface ITrillianLogService_IQueueLeaf {
  path: string; // "/trillian.TrillianLog/QueueLeaf"
  requestStream: boolean; // false
  responseStream: boolean; // false
  requestSerialize: grpc.serialize<trillian_log_api_pb.QueueLeafRequest>;
  requestDeserialize: grpc.deserialize<trillian_log_api_pb.QueueLeafRequest>;
  responseSerialize: grpc.serialize<trillian_log_api_pb.QueueLeafResponse>;
  responseDeserialize: grpc.deserialize<trillian_log_api_pb.QueueLeafResponse>;
}

interface ITrillianLogService_IAddSequencedLeaf {
  path: string; // "/trillian.TrillianLog/AddSequencedLeaf"
  requestStream: boolean; // false
  responseStream: boolean; // false
  requestSerialize: grpc.serialize<trillian_log_api_pb.AddSequencedLeafRequest>;
  requestDeserialize: grpc.deserialize<
    trillian_log_api_pb.AddSequencedLeafRequest
  >;
  responseSerialize: grpc.serialize<
    trillian_log_api_pb.AddSequencedLeafResponse
  >;
  responseDeserialize: grpc.deserialize<
    trillian_log_api_pb.AddSequencedLeafResponse
  >;
}

interface ITrillianLogService_IGetInclusionProof {
  path: string; // "/trillian.TrillianLog/GetInclusionProof"
  requestStream: boolean; // false
  responseStream: boolean; // false
  requestSerialize: grpc.serialize<
    trillian_log_api_pb.GetInclusionProofRequest
  >;
  requestDeserialize: grpc.deserialize<
    trillian_log_api_pb.GetInclusionProofRequest
  >;
  responseSerialize: grpc.serialize<
    trillian_log_api_pb.GetInclusionProofResponse
  >;
  responseDeserialize: grpc.deserialize<
    trillian_log_api_pb.GetInclusionProofResponse
  >;
}

interface ITrillianLogService_IGetInclusionProofByHash {
  path: string; // "/trillian.TrillianLog/GetInclusionProofByHash"
  requestStream: boolean; // false
  responseStream: boolean; // false
  requestSerialize: grpc.serialize<
    trillian_log_api_pb.GetInclusionProofByHashRequest
  >;
  requestDeserialize: grpc.deserialize<
    trillian_log_api_pb.GetInclusionProofByHashRequest
  >;
  responseSerialize: grpc.serialize<
    trillian_log_api_pb.GetInclusionProofByHashResponse
  >;
  responseDeserialize: grpc.deserialize<
    trillian_log_api_pb.GetInclusionProofByHashResponse
  >;
}

interface ITrillianLogService_IGetConsistencyProof {
  path: string; // "/trillian.TrillianLog/GetConsistencyProof"
  requestStream: boolean; // false
  responseStream: boolean; // false
  requestSerialize: grpc.serialize<
    trillian_log_api_pb.GetConsistencyProofRequest
  >;
  requestDeserialize: grpc.deserialize<
    trillian_log_api_pb.GetConsistencyProofRequest
  >;
  responseSerialize: grpc.serialize<
    trillian_log_api_pb.GetConsistencyProofResponse
  >;
  responseDeserialize: grpc.deserialize<
    trillian_log_api_pb.GetConsistencyProofResponse
  >;
}

interface ITrillianLogService_IGetLatestSignedLogRoot {
  path: string; // "/trillian.TrillianLog/GetLatestSignedLogRoot"
  requestStream: boolean; // false
  responseStream: boolean; // false
  requestSerialize: grpc.serialize<
    trillian_log_api_pb.GetLatestSignedLogRootRequest
  >;
  requestDeserialize: grpc.deserialize<
    trillian_log_api_pb.GetLatestSignedLogRootRequest
  >;
  responseSerialize: grpc.serialize<
    trillian_log_api_pb.GetLatestSignedLogRootResponse
  >;
  responseDeserialize: grpc.deserialize<
    trillian_log_api_pb.GetLatestSignedLogRootResponse
  >;
}

interface ITrillianLogService_IGetSequencedLeafCount {
  path: string; // "/trillian.TrillianLog/GetSequencedLeafCount"
  requestStream: boolean; // false
  responseStream: boolean; // false
  requestSerialize: grpc.serialize<
    trillian_log_api_pb.GetSequencedLeafCountRequest
  >;
  requestDeserialize: grpc.deserialize<
    trillian_log_api_pb.GetSequencedLeafCountRequest
  >;
  responseSerialize: grpc.serialize<
    trillian_log_api_pb.GetSequencedLeafCountResponse
  >;
  responseDeserialize: grpc.deserialize<
    trillian_log_api_pb.GetSequencedLeafCountResponse
  >;
}

interface ITrillianLogService_IGetEntryAndProof {
  path: string; // "/trillian.TrillianLog/GetEntryAndProof"
  requestStream: boolean; // false
  responseStream: boolean; // false
  requestSerialize: grpc.serialize<trillian_log_api_pb.GetEntryAndProofRequest>;
  requestDeserialize: grpc.deserialize<
    trillian_log_api_pb.GetEntryAndProofRequest
  >;
  responseSerialize: grpc.serialize<
    trillian_log_api_pb.GetEntryAndProofResponse
  >;
  responseDeserialize: grpc.deserialize<
    trillian_log_api_pb.GetEntryAndProofResponse
  >;
}

interface ITrillianLogService_IInitLog {
  path: string; // "/trillian.TrillianLog/InitLog"
  requestStream: boolean; // false
  responseStream: boolean; // false
  requestSerialize: grpc.serialize<trillian_log_api_pb.InitLogRequest>;
  requestDeserialize: grpc.deserialize<trillian_log_api_pb.InitLogRequest>;
  responseSerialize: grpc.serialize<trillian_log_api_pb.InitLogResponse>;
  responseDeserialize: grpc.deserialize<trillian_log_api_pb.InitLogResponse>;
}

interface ITrillianLogService_IQueueLeaves {
  path: string; // "/trillian.TrillianLog/QueueLeaves"
  requestStream: boolean; // false
  responseStream: boolean; // false
  requestSerialize: grpc.serialize<trillian_log_api_pb.QueueLeavesRequest>;
  requestDeserialize: grpc.deserialize<trillian_log_api_pb.QueueLeavesRequest>;
  responseSerialize: grpc.serialize<trillian_log_api_pb.QueueLeavesResponse>;
  responseDeserialize: grpc.deserialize<
    trillian_log_api_pb.QueueLeavesResponse
  >;
}

interface ITrillianLogService_IAddSequencedLeaves {
  path: string; // "/trillian.TrillianLog/AddSequencedLeaves"
  requestStream: boolean; // false
  responseStream: boolean; // false
  requestSerialize: grpc.serialize<
    trillian_log_api_pb.AddSequencedLeavesRequest
  >;
  requestDeserialize: grpc.deserialize<
    trillian_log_api_pb.AddSequencedLeavesRequest
  >;
  responseSerialize: grpc.serialize<
    trillian_log_api_pb.AddSequencedLeavesResponse
  >;
  responseDeserialize: grpc.deserialize<
    trillian_log_api_pb.AddSequencedLeavesResponse
  >;
}

interface ITrillianLogService_IGetLeavesByIndex {
  path: string; // "/trillian.TrillianLog/GetLeavesByIndex"
  requestStream: boolean; // false
  responseStream: boolean; // false
  requestSerialize: grpc.serialize<trillian_log_api_pb.GetLeavesByIndexRequest>;
  requestDeserialize: grpc.deserialize<
    trillian_log_api_pb.GetLeavesByIndexRequest
  >;
  responseSerialize: grpc.serialize<
    trillian_log_api_pb.GetLeavesByIndexResponse
  >;
  responseDeserialize: grpc.deserialize<
    trillian_log_api_pb.GetLeavesByIndexResponse
  >;
}

interface ITrillianLogService_IGetLeavesByRange {
  path: string; // "/trillian.TrillianLog/GetLeavesByRange"
  requestStream: boolean; // false
  responseStream: boolean; // false
  requestSerialize: grpc.serialize<trillian_log_api_pb.GetLeavesByRangeRequest>;
  requestDeserialize: grpc.deserialize<
    trillian_log_api_pb.GetLeavesByRangeRequest
  >;
  responseSerialize: grpc.serialize<
    trillian_log_api_pb.GetLeavesByRangeResponse
  >;
  responseDeserialize: grpc.deserialize<
    trillian_log_api_pb.GetLeavesByRangeResponse
  >;
}

interface ITrillianLogService_IGetLeavesByHash {
  path: string; // "/trillian.TrillianLog/GetLeavesByHash"
  requestStream: boolean; // false
  responseStream: boolean; // false
  requestSerialize: grpc.serialize<trillian_log_api_pb.GetLeavesByHashRequest>;
  requestDeserialize: grpc.deserialize<
    trillian_log_api_pb.GetLeavesByHashRequest
  >;
  responseSerialize: grpc.serialize<
    trillian_log_api_pb.GetLeavesByHashResponse
  >;
  responseDeserialize: grpc.deserialize<
    trillian_log_api_pb.GetLeavesByHashResponse
  >;
}

export const TrillianLogService: ITrillianLogService;
export interface ITrillianLogServer {
  queueLeaf: grpc.handleUnaryCall<
    trillian_log_api_pb.QueueLeafRequest,
    trillian_log_api_pb.QueueLeafResponse
  >;
  addSequencedLeaf: grpc.handleUnaryCall<
    trillian_log_api_pb.AddSequencedLeafRequest,
    trillian_log_api_pb.AddSequencedLeafResponse
  >;
  getInclusionProof: grpc.handleUnaryCall<
    trillian_log_api_pb.GetInclusionProofRequest,
    trillian_log_api_pb.GetInclusionProofResponse
  >;
  getInclusionProofByHash: grpc.handleUnaryCall<
    trillian_log_api_pb.GetInclusionProofByHashRequest,
    trillian_log_api_pb.GetInclusionProofByHashResponse
  >;
  getConsistencyProof: grpc.handleUnaryCall<
    trillian_log_api_pb.GetConsistencyProofRequest,
    trillian_log_api_pb.GetConsistencyProofResponse
  >;
  getLatestSignedLogRoot: grpc.handleUnaryCall<
    trillian_log_api_pb.GetLatestSignedLogRootRequest,
    trillian_log_api_pb.GetLatestSignedLogRootResponse
  >;
  getSequencedLeafCount: grpc.handleUnaryCall<
    trillian_log_api_pb.GetSequencedLeafCountRequest,
    trillian_log_api_pb.GetSequencedLeafCountResponse
  >;
  getEntryAndProof: grpc.handleUnaryCall<
    trillian_log_api_pb.GetEntryAndProofRequest,
    trillian_log_api_pb.GetEntryAndProofResponse
  >;
  initLog: grpc.handleUnaryCall<
    trillian_log_api_pb.InitLogRequest,
    trillian_log_api_pb.InitLogResponse
  >;
  queueLeaves: grpc.handleUnaryCall<
    trillian_log_api_pb.QueueLeavesRequest,
    trillian_log_api_pb.QueueLeavesResponse
  >;
  addSequencedLeaves: grpc.handleUnaryCall<
    trillian_log_api_pb.AddSequencedLeavesRequest,
    trillian_log_api_pb.AddSequencedLeavesResponse
  >;
  getLeavesByIndex: grpc.handleUnaryCall<
    trillian_log_api_pb.GetLeavesByIndexRequest,
    trillian_log_api_pb.GetLeavesByIndexResponse
  >;
  getLeavesByRange: grpc.handleUnaryCall<
    trillian_log_api_pb.GetLeavesByRangeRequest,
    trillian_log_api_pb.GetLeavesByRangeResponse
  >;
  getLeavesByHash: grpc.handleUnaryCall<
    trillian_log_api_pb.GetLeavesByHashRequest,
    trillian_log_api_pb.GetLeavesByHashResponse
  >;
}

export interface ITrillianLogClient {
  queueLeaf(
    request: trillian_log_api_pb.QueueLeafRequest,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.QueueLeafResponse
    ) => void
  ): grpc.ClientUnaryCall;
  queueLeaf(
    request: trillian_log_api_pb.QueueLeafRequest,
    metadata: grpc.Metadata,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.QueueLeafResponse
    ) => void
  ): grpc.ClientUnaryCall;
  addSequencedLeaf(
    request: trillian_log_api_pb.AddSequencedLeafRequest,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.AddSequencedLeafResponse
    ) => void
  ): grpc.ClientUnaryCall;
  addSequencedLeaf(
    request: trillian_log_api_pb.AddSequencedLeafRequest,
    metadata: grpc.Metadata,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.AddSequencedLeafResponse
    ) => void
  ): grpc.ClientUnaryCall;
  getInclusionProof(
    request: trillian_log_api_pb.GetInclusionProofRequest,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.GetInclusionProofResponse
    ) => void
  ): grpc.ClientUnaryCall;
  getInclusionProof(
    request: trillian_log_api_pb.GetInclusionProofRequest,
    metadata: grpc.Metadata,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.GetInclusionProofResponse
    ) => void
  ): grpc.ClientUnaryCall;
  getInclusionProofByHash(
    request: trillian_log_api_pb.GetInclusionProofByHashRequest,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.GetInclusionProofByHashResponse
    ) => void
  ): grpc.ClientUnaryCall;
  getInclusionProofByHash(
    request: trillian_log_api_pb.GetInclusionProofByHashRequest,
    metadata: grpc.Metadata,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.GetInclusionProofByHashResponse
    ) => void
  ): grpc.ClientUnaryCall;
  getConsistencyProof(
    request: trillian_log_api_pb.GetConsistencyProofRequest,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.GetConsistencyProofResponse
    ) => void
  ): grpc.ClientUnaryCall;
  getConsistencyProof(
    request: trillian_log_api_pb.GetConsistencyProofRequest,
    metadata: grpc.Metadata,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.GetConsistencyProofResponse
    ) => void
  ): grpc.ClientUnaryCall;
  getLatestSignedLogRoot(
    request: trillian_log_api_pb.GetLatestSignedLogRootRequest,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.GetLatestSignedLogRootResponse
    ) => void
  ): grpc.ClientUnaryCall;
  getLatestSignedLogRoot(
    request: trillian_log_api_pb.GetLatestSignedLogRootRequest,
    metadata: grpc.Metadata,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.GetLatestSignedLogRootResponse
    ) => void
  ): grpc.ClientUnaryCall;
  getSequencedLeafCount(
    request: trillian_log_api_pb.GetSequencedLeafCountRequest,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.GetSequencedLeafCountResponse
    ) => void
  ): grpc.ClientUnaryCall;
  getSequencedLeafCount(
    request: trillian_log_api_pb.GetSequencedLeafCountRequest,
    metadata: grpc.Metadata,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.GetSequencedLeafCountResponse
    ) => void
  ): grpc.ClientUnaryCall;
  getEntryAndProof(
    request: trillian_log_api_pb.GetEntryAndProofRequest,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.GetEntryAndProofResponse
    ) => void
  ): grpc.ClientUnaryCall;
  getEntryAndProof(
    request: trillian_log_api_pb.GetEntryAndProofRequest,
    metadata: grpc.Metadata,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.GetEntryAndProofResponse
    ) => void
  ): grpc.ClientUnaryCall;
  initLog(
    request: trillian_log_api_pb.InitLogRequest,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.InitLogResponse
    ) => void
  ): grpc.ClientUnaryCall;
  initLog(
    request: trillian_log_api_pb.InitLogRequest,
    metadata: grpc.Metadata,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.InitLogResponse
    ) => void
  ): grpc.ClientUnaryCall;
  queueLeaves(
    request: trillian_log_api_pb.QueueLeavesRequest,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.QueueLeavesResponse
    ) => void
  ): grpc.ClientUnaryCall;
  queueLeaves(
    request: trillian_log_api_pb.QueueLeavesRequest,
    metadata: grpc.Metadata,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.QueueLeavesResponse
    ) => void
  ): grpc.ClientUnaryCall;
  addSequencedLeaves(
    request: trillian_log_api_pb.AddSequencedLeavesRequest,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.AddSequencedLeavesResponse
    ) => void
  ): grpc.ClientUnaryCall;
  addSequencedLeaves(
    request: trillian_log_api_pb.AddSequencedLeavesRequest,
    metadata: grpc.Metadata,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.AddSequencedLeavesResponse
    ) => void
  ): grpc.ClientUnaryCall;
  getLeavesByIndex(
    request: trillian_log_api_pb.GetLeavesByIndexRequest,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.GetLeavesByIndexResponse
    ) => void
  ): grpc.ClientUnaryCall;
  getLeavesByIndex(
    request: trillian_log_api_pb.GetLeavesByIndexRequest,
    metadata: grpc.Metadata,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.GetLeavesByIndexResponse
    ) => void
  ): grpc.ClientUnaryCall;
  getLeavesByRange(
    request: trillian_log_api_pb.GetLeavesByRangeRequest,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.GetLeavesByRangeResponse
    ) => void
  ): grpc.ClientUnaryCall;
  getLeavesByRange(
    request: trillian_log_api_pb.GetLeavesByRangeRequest,
    metadata: grpc.Metadata,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.GetLeavesByRangeResponse
    ) => void
  ): grpc.ClientUnaryCall;
  getLeavesByHash(
    request: trillian_log_api_pb.GetLeavesByHashRequest,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.GetLeavesByHashResponse
    ) => void
  ): grpc.ClientUnaryCall;
  getLeavesByHash(
    request: trillian_log_api_pb.GetLeavesByHashRequest,
    metadata: grpc.Metadata,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.GetLeavesByHashResponse
    ) => void
  ): grpc.ClientUnaryCall;
}

export class TrillianLogClient extends grpc.Client
  implements ITrillianLogClient {
  constructor(
    address: string,
    credentials: grpc.ChannelCredentials,
    options?: object
  );
  public queueLeaf(
    request: trillian_log_api_pb.QueueLeafRequest,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.QueueLeafResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public queueLeaf(
    request: trillian_log_api_pb.QueueLeafRequest,
    metadata: grpc.Metadata,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.QueueLeafResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public addSequencedLeaf(
    request: trillian_log_api_pb.AddSequencedLeafRequest,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.AddSequencedLeafResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public addSequencedLeaf(
    request: trillian_log_api_pb.AddSequencedLeafRequest,
    metadata: grpc.Metadata,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.AddSequencedLeafResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public getInclusionProof(
    request: trillian_log_api_pb.GetInclusionProofRequest,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.GetInclusionProofResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public getInclusionProof(
    request: trillian_log_api_pb.GetInclusionProofRequest,
    metadata: grpc.Metadata,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.GetInclusionProofResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public getInclusionProofByHash(
    request: trillian_log_api_pb.GetInclusionProofByHashRequest,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.GetInclusionProofByHashResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public getInclusionProofByHash(
    request: trillian_log_api_pb.GetInclusionProofByHashRequest,
    metadata: grpc.Metadata,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.GetInclusionProofByHashResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public getConsistencyProof(
    request: trillian_log_api_pb.GetConsistencyProofRequest,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.GetConsistencyProofResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public getConsistencyProof(
    request: trillian_log_api_pb.GetConsistencyProofRequest,
    metadata: grpc.Metadata,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.GetConsistencyProofResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public getLatestSignedLogRoot(
    request: trillian_log_api_pb.GetLatestSignedLogRootRequest,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.GetLatestSignedLogRootResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public getLatestSignedLogRoot(
    request: trillian_log_api_pb.GetLatestSignedLogRootRequest,
    metadata: grpc.Metadata,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.GetLatestSignedLogRootResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public getSequencedLeafCount(
    request: trillian_log_api_pb.GetSequencedLeafCountRequest,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.GetSequencedLeafCountResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public getSequencedLeafCount(
    request: trillian_log_api_pb.GetSequencedLeafCountRequest,
    metadata: grpc.Metadata,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.GetSequencedLeafCountResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public getEntryAndProof(
    request: trillian_log_api_pb.GetEntryAndProofRequest,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.GetEntryAndProofResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public getEntryAndProof(
    request: trillian_log_api_pb.GetEntryAndProofRequest,
    metadata: grpc.Metadata,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.GetEntryAndProofResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public initLog(
    request: trillian_log_api_pb.InitLogRequest,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.InitLogResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public initLog(
    request: trillian_log_api_pb.InitLogRequest,
    metadata: grpc.Metadata,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.InitLogResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public queueLeaves(
    request: trillian_log_api_pb.QueueLeavesRequest,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.QueueLeavesResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public queueLeaves(
    request: trillian_log_api_pb.QueueLeavesRequest,
    metadata: grpc.Metadata,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.QueueLeavesResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public addSequencedLeaves(
    request: trillian_log_api_pb.AddSequencedLeavesRequest,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.AddSequencedLeavesResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public addSequencedLeaves(
    request: trillian_log_api_pb.AddSequencedLeavesRequest,
    metadata: grpc.Metadata,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.AddSequencedLeavesResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public getLeavesByIndex(
    request: trillian_log_api_pb.GetLeavesByIndexRequest,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.GetLeavesByIndexResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public getLeavesByIndex(
    request: trillian_log_api_pb.GetLeavesByIndexRequest,
    metadata: grpc.Metadata,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.GetLeavesByIndexResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public getLeavesByRange(
    request: trillian_log_api_pb.GetLeavesByRangeRequest,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.GetLeavesByRangeResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public getLeavesByRange(
    request: trillian_log_api_pb.GetLeavesByRangeRequest,
    metadata: grpc.Metadata,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.GetLeavesByRangeResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public getLeavesByHash(
    request: trillian_log_api_pb.GetLeavesByHashRequest,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.GetLeavesByHashResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public getLeavesByHash(
    request: trillian_log_api_pb.GetLeavesByHashRequest,
    metadata: grpc.Metadata,
    callback: (
      error: Error | null,
      response: trillian_log_api_pb.GetLeavesByHashResponse
    ) => void
  ): grpc.ClientUnaryCall;
}
