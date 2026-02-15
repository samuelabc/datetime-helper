export interface RequestHandle {
  requestId: number;
}

export class AiRequestController {
  private latestRequestId = 0;

  begin(): RequestHandle {
    this.latestRequestId += 1;
    return { requestId: this.latestRequestId };
  }

  isLatest(handle: RequestHandle): boolean {
    return handle.requestId === this.latestRequestId;
  }
}
