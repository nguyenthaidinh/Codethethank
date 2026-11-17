/** Built-in narrative only. Ambient stage directions and private letters are not voiced. */
export function speechText(caption: string | null | undefined): string {
  if (!caption) return "";
  let text = caption.normalize("NFC").trim();
  if (/^\[[\s\S]*\]$/.test(text)) return "";
  text = text
    .replace(/\[[^\]]*\]/g, "")
    .replace(/^(?:AION|An|Cô Vân|Nhà nghiên cứu)\s*:\s*/i, "");
  text = text
    .replace(/AN\s*[—–-]\s*FOUNDER OF AION/gi, "An, nhà sáng lập Ai-on")
    .replace(/FINAL JUDGMENT/gi, "phán quyết cuối cùng")
    .replace(/NEXT SUPPORT STEP/gi, "bước hỗ trợ tiếp theo")
    .replace(/NOT RECOMMENDED/gi, "không được đề xuất")
    .replace(/\bAION\b/g, "Ai-on")
    .replace(/\bAI\b/g, "trí tuệ nhân tạo")
    .replace(/\bCNTT\b/g, "công nghệ thông tin")
    .replace(/17:05/g, "mười bảy giờ không năm phút")
    .replace(/2046/g, "hai nghìn không trăm bốn mươi sáu")
    .replace(/2026/g, "hai nghìn không trăm hai mươi sáu")
    .replace(/2035/g, "hai nghìn không trăm ba mươi lăm")
    .replace(/2029/g, "hai nghìn không trăm hai mươi chín")
    .replace(/2045/g, "hai nghìn không trăm bốn mươi lăm")
    .replace(/[“”«»]/g, "")
    .replace(/[→↔]/g, ", chuyển thành, ")
    .replace(/\s+/g, " ")
    .trim();
  return text;
}
export function speechKey(text: string): string {
  let value = 2166136261;
  for (const character of text) {
    value ^= character.codePointAt(0)!;
    value = Math.imul(value, 16777619);
  }
  return (value >>> 0).toString(16).padStart(8, "0");
}
