import {
  Certificate,
  ARPKICert,
  ApplicationCertificate,
  Resource
} from "common/certs/types";
import { GetResponse } from "common/communication/requests/Get";
import { verify } from "common/crypto/rsa";
import {
  verifyMultiSignature,
  verifyNonceSignature
} from "common/certs/verification";
import { ILS, CA } from "common/participants/types";
import { MapLeafInclusion, MapRootV1 } from "common/trillian/types";
import { BuildJSONMapLeafForEntry } from "common/trillian/util";
import { VerifyMapLeafInclusion } from "common/trillian/verification/mapVerifier";
import { head, keyBy, isEqual, isEmpty } from "lodash";
import { ResourceResolver } from "./types";
import { bufferEqual } from "common/trillian/util";
import dataUriToBuffer from "data-uri-to-buffer";
import MimeTypes from "mime-types";
import { getHash } from "common/util/funs";
import { isValidURL } from "common/certs/validators";

export const verifySignatures = <C extends Certificate>(
  response: GetResponse<C>,
  cas: CA[],
  ils: ILS
) => {
  const { nonceSignature, ...rawResponse } = response;
  if (!verifyNonceSignature(rawResponse, nonceSignature, cas, ils)) {
    throw new Error("Invalid nonce signature!");
  }

  if (
    !verifyMultiSignature(
      JSON.parse(response.root),
      response.rootSignature,
      cas,
      ils
    )
  ) {
    throw new Error("Invalid root signature!");
  }
  if (
    !verify(JSON.parse(response.proof), response.proofSignature, ils.publicKey)
  ) {
    throw new Error("Invalid proof signature!");
  }
};

export const verifyProof = async <C extends Certificate>(
  treeId: string,
  root: MapRootV1,
  proof: MapLeafInclusion,
  url: string,
  cert: ARPKICert<C> | undefined
) => {
  await VerifyMapLeafInclusion(treeId, root, proof);

  if (!proof.leaf) {
    throw new Error("Invalid proof: Leaf missing!");
  }

  const mapLeaf = BuildJSONMapLeafForEntry(url, cert);

  if (!bufferEqual(proof.leaf.index, mapLeaf.index)) {
    throw new Error("Invalid proof: Wrong index!");
  }
  if (!bufferEqual(proof.leaf.leafValue, mapLeaf.leafValue)) {
    throw new Error("Invalid proof: Wrong certificate!");
  }

  if (isEmpty(proof.leaf.leafHash)) {
    throw new Error("Invalid proof: Hash empty!");
  }
};

const isDataURL = (url: string) => {
  return url.startsWith("data:");
};

const mapUrlResource = (
  resource: Resource,
  appCertificate: ApplicationCertificate
) => {
  const htmlExtension = /\.(htm|html|shtml|xhtml|phtml)$/gim;
  const htmlResources = appCertificate.resources.filter(certResource =>
    htmlExtension.test(certResource.resourceUrl)
  );

  //Check if the given resource is a virtual sub-url; if so, return the root HTML
  if (
    isEmpty(resource.contentHash) &&
    resource.resourceUrl.startsWith(appCertificate.applicationUrl)
  ) {
    if (htmlResources.length > 1) {
      throw new Error(
        "Not a Single-Page-Application, cannot resolve current HTML origin!"
      );
    }

    return head(htmlResources);
  }

  return htmlResources.find(certResource =>
    isEqual(certResource.contentHash, resource.contentHash)
  );
};

const mapDataUrl = (resource: Resource, certResources: Resource[]) => {
  const dataBuffer = dataUriToBuffer(resource.resourceUrl);
  const dataHash = getHash(dataBuffer.toString("base64"));
  const extensions = MimeTypes.extensions[dataBuffer["type"]];
  return certResources
    .filter(certResource =>
      extensions.some(extension => certResource.resourceUrl.endsWith(extension))
    )
    .find(certResource => isEqual(certResource.contentHash, dataHash));
};

export const verifyTabResources = async (
  tabId: number,
  appCertificate: ARPKICert<ApplicationCertificate>,
  resolveResources: ResourceResolver
) => {
  const urlMappings = new Map<string, string>();

  const resources = await resolveResources(tabId);
  const certResources = keyBy(appCertificate.resources, "resourceUrl");

  for (const resource of resources) {
    let certResource: Resource | undefined =
      certResources[resource.resourceUrl];

    if (
      certResource &&
      !isEqual(resource.contentHash, certResource.contentHash)
    ) {
      throw new Error(
        `Invalid certificate resource hash for resource ${
          resource.resourceUrl
        }!`
      );
    } else if (!certResource && isValidURL(resource.resourceUrl)) {
      certResource = mapUrlResource(resource, appCertificate);
    } else if (!certResource && isDataURL(resource.resourceUrl)) {
      certResource = mapDataUrl(resource, appCertificate.resources);

      //Ignore unresolved data urls for now, just warn in info
      urlMappings.set(
        resource.resourceUrl,
        certResource
          ? certResource.resourceUrl
          : "[Could not find corresponding certificate resource for data url]"
      );

      continue;
    }

    if (!certResource) {
      throw new Error(
        `Resource ${
          resource.resourceUrl
        } not included in certificate resources!`
      );
    }

    urlMappings.set(resource.resourceUrl, certResource.resourceUrl);
  }

  return [...urlMappings.entries()].map(([k, v]) => [k, v]);
};
