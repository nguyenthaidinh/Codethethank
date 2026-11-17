import { expect, type Page } from "@playwright/test";
/** Exercise real controls; never inject a completed experiment into the save. */
export async function solveLab2035(page: Page, touch = false) {
  const click = async (name: string) => {
    const b = page.getByRole("button", { name, exact: true });
    if (touch) await b.tap();
    else await b.click();
  };
  await click("Dữ liệu học tập");
  await click("Chạy thử nghiệm");
  await expect(page.getByRole("article", { name: "Kết quả A" })).toContainText(
    "NOT RECOMMENDED",
    { timeout: 12000 },
  );
  await click("Nhật ký dùng máy");
  await click("Chạy thử nghiệm");
  await expect(page.getByRole("article", { name: "Kết quả B" })).toContainText(
    "REVIEW REQUIRED",
    { timeout: 12000 },
  );
  await click("Đánh dấu dữ liệu bị bỏ sót ↗");
  await click("Tiếp: sửa logic");
  await click("Bỏ qua thử thách code");
}
