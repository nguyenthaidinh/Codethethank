import { useEffect, useRef } from "react";

export type GuideContent = {
  recap: string;
  steps: string[];
};

export function GameGuide({
  recap,
  steps,
  onClose,
}: GuideContent & { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);

  return (
    <dialog
      ref={dialog}
      className="game-guide"
      aria-labelledby="game-guide-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") event.stopPropagation();
      }}
    >
      <h2 id="game-guide-title">Tóm tắt câu chuyện</h2>
      <p>{recap}</p>
      <h3>Hướng dẫn chơi</h3>
      <ol>
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <details>
        <summary>Điều khiển chung</summary>
        <ul>
          <li>
            Chạm hoặc nhấp vào các điểm sáng để xem vật chứng. Trên bàn phím,
            dùng Tab để chọn nút và Enter để bấm.
          </li>
          <li>
            Chọn ×1, ×2 hoặc ×3 ở góc trên để đổi tốc độ cảnh và lời thoại. Game
            chờ bạn ở các bước cần thao tác.
          </li>
          <li>
            Dùng nút tạm dừng để nghỉ. Chọn «Tiếp tục» ở menu chính để trở lại
            tiến trình đã lưu.
          </li>
        </ul>
      </details>
      <button type="button" autoFocus onClick={onClose}>
        Tiếp tục chơi
      </button>
    </dialog>
  );
}
