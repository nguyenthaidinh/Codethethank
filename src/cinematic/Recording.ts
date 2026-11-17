/** Captures the actual game canvas and its live master audio bus without GPU to CPU frame copies. */
export class Recording {
  private recorder: MediaRecorder;
  private chunks: Blob[] = [];
  private stream: MediaStream;
  constructor(canvas: HTMLCanvasElement, audio?: MediaStream) {
    this.stream = canvas.captureStream(24);
    if (audio)
      audio.getAudioTracks().forEach((t) => this.stream.addTrack(t.clone()));
    const mime = [
      "video/webm;codecs=vp8,opus",
      "video/webm;codecs=vp9,opus",
      "video/webm",
    ].find((m) => MediaRecorder.isTypeSupported(m));
    this.recorder = new MediaRecorder(this.stream, {
      mimeType: mime,
      videoBitsPerSecond: 2_500_000,
    });
    this.recorder.ondataavailable = (e) => {
      if (e.data.size) this.chunks.push(e.data);
    };
    this.recorder.start(1000);
  }
  async stop() {
    return new Promise<Blob>((resolve) => {
      this.recorder.onstop = () => {
        this.stream.getTracks().forEach((t) => t.stop());
        resolve(new Blob(this.chunks, { type: this.recorder.mimeType }));
      };
      this.recorder.stop();
    });
  }
}
