"use client";

export function DownloadInvitation({ id, svg }: { id: string; svg: string }) {
  function download() {
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 1720;
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((png) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(png!);
        a.download = `love-feast-invitation-${id}.png`;
        a.click();
      }, "image/png");
    };
    img.src = url;
  }
  return (
    <button type="button" onClick={download} className="btn">
      Download invitation (PNG)
    </button>
  );
}
