export interface RequestHandle {
  requestId: number;
  signal: AbortSignal;
}

export class AiRequestController {
  private latestRequestId = 0;
  private activeController: AbortController | null = null;

  begin(): RequestHandle {
    this.activeController?.abort();
    this.activeController = new AbortController();
    this.latestRequestId += 1;
    return { requestId: this.latestRequestId, signal: this.activeController.signal };
  }

  isLatest(handle: RequestHandle): boolean {
    return handle.requestId === this.latestRequestId;
  }

  cancelActive(): void {
    this.activeController?.abort();
  }
}
