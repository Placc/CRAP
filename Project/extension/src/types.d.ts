import { TabStatus } from "./client/types";
import { KeyPair } from "common/communication/types";

declare global {
  interface Window {
    tabStatus: TabStatus;
    tabUrl: string;
  }
}

export type FrameResource = {
  url: string;
  type: string;
  mimeType: string;
  lastModified: number;
  contentSize: number;
  failed: boolean;
  canceled: boolean;
};

export type Frame = {
  id: string;
  parentId: string;
  loaderId: string;
  name: string;
  url: string;
  securityOrigin: string;
  mimeType: string;
  unreachableUrl?: string;
};

export type FrameResourceTree = {
  frame: Frame;
  childFrames: FrameResourceTree[];
  resources: FrameResource[];
};
