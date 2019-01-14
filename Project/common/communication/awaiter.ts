import { Response } from "./types";
import { EventEmitter } from "events";

export class RequestAwaiter<R extends Response> {
  private res: EventEmitter = new EventEmitter();
  private p: Promise<R>;

  constructor(responseGuard: (res: Response | Error) => res is R) {
    this.p = new Promise<R>((resolve, reject) => {
      this.res.on("response", response => {
        if (response instanceof Error || !responseGuard(response)) {
          reject(response);
          return;
        }
        resolve(response);
      });
    });
  }

  public resolve(response: R | Error) {
    this.res.emit("response", response);
  }

  public onResponse(callback: (res, err) => void) {
    this.p
      .then(res => callback(res, undefined))
      .catch(e => callback(undefined, e));
  }

  public toPromise() {
    return this.p;
  }
}
