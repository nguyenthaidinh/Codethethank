import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
const root = 'docs/opening-readability-proof';
const read = (p) => JSON.parse(readFileSync(p, 'utf8').replace(/^\uFEFF/, ''));
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
const execution = read(root + '/qa-execution.json'), e2e = read(root + '/e2e-results.json'), menu = read(root + '/menu-results.json');
if (!execution.finished || !execution.buildUnchanged || execution.build !== sha('dist/index.html') || execution.runs.some((r) => r.exitCode !== 0)) throw Error('QA not complete on this production build');
if (e2e.stats.expected !== 16 || menu.stats.expected !== 11 || [e2e, menu].some((r) => r.stats.unexpected || r.stats.flaky || r.stats.skipped)) throw Error('Incomplete E2E');
const before = read(root + '/before-hashes.json'), changed = [], retired = [];
for (const [path, hash] of Object.entries(before)) {
  if (existsSync(path)) { if (sha(path) !== hash) changed.push(path); }
  else {
    const archived = 'docs/voice-school-proof/retired-dialogue/' + path.split('/').at(-1);
    if (!path.startsWith('public/voice/vi/') || !existsSync(archived) || sha(archived) !== hash) throw Error('Unexpected missing file: ' + path);
    retired.push(path);
  }
}
for (const path of ['src/art/NarrativeActors.ts', 'src/art/NarrativePalette.ts', 'src/cinematic/motifs.ts', 'src/verdict/state.ts', 'src/stayed/state.ts', 'src/ripple/state.ts', 'src/finale/state.ts', 'src/future/FutureWorld.ts', 'src/future/GrandArchitecture.ts', 'public/school/tay-nguyen-university-logo.png']) if (changed.includes(path)) throw Error('Protected file changed: ' + path);
const manifest = read(root + '/voice-manifest.json'), record = read(root + '/runtime/recording.json');
if (manifest.lines.length !== 7 || readdirSync('public/voice/vi').filter((p) => p.endsWith('.mp3')).length !== 7 || retired.length !== 99) throw Error('Voice asset scope mismatch');
if (record.final.voice.started !== 0 || record.errors.length) throw Error('Past recording must be voice-free');
const probe = spawnSync('ffprobe.exe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', root + '/runtime/voice-scene.mp4'], { encoding: 'utf8' });
if (probe.status) throw Error('Video probe failed');
const media = JSON.parse(probe.stdout); if (!media.streams.some((s) => s.codec_type === 'audio')) throw Error('Ambient audio track missing');
const policy = read(root + '/runtime/opening-voice-policy.json');
const old = read('docs/voice-school-proof/verification.json');
const file = readdirSync('dist/assets').find((p) => /^CinematicGame-.*\.js$/.test(p));
const result = { date: '2026-11-17', buildSHA256: execution.build, typecheck: 'PASS', lint: 'PASS', unit: 41, e2e: e2e.stats, menu: menu.stats, changed, retiredUnchanged: retired.length, protectedStoryCastLogoUnchanged: true, voice: { clips: manifest.lines.length, bytes: manifest.lines.reduce((n, l) => n + l.bytes, 0), openingRequests: policy.requests.length, afterOpening: policy.state.voice }, bundle: { before: old.bundleDiff[0].after, after: statSync('dist/assets/' + file).size }, video: { seconds: Number(media.format.duration), bytes: Number(media.format.size), sha256: sha(root + '/runtime/voice-scene.mp4'), voicesInPast: record.final.voice.started }, limitations: ['Physical phones/Safari and human playtest unverified.', 'Existing character assets retained; visual approval remains with Product Owner.'] };
writeFileSync(root + '/verification.json', JSON.stringify(result, null, 2));
const prepend = (file, text) => {
  const tag = 'OPENING_REFINEMENT';
  const previous = readFileSync(file, 'utf8').replace(new RegExp(`<!-- ${tag}:START -->[\\s\\S]*?<!-- ${tag}:END -->\\s*`, 'g'), '');
  writeFileSync(file, `<!-- ${tag}:START -->\n${text}\n<!-- ${tag}:END -->\n\n` + previous);
};
const seconds = result.video.seconds.toFixed(1);
prepend('docs/OPENING_AND_CLASSROOM_REFINEMENT.md', `# Đã kiểm chứng bản chỉnh sửa\n\n**41 unit + 27 E2E PASS**: 16 gameplay/voice/camera/IME/fallback/typography + 11 menu; zero skipped/flaky/unexpected. Typecheck, lint và production build PASS. Menu → Credits chạy lại trên build mới; không dùng kết quả cũ.\n\nLời dẫn thực sự phát ở opening; từ câu AION cuối opening, điều tra, lớp học và mọi cuộc trò chuyện đều không phát giọng. Test quan sát request MP3 và audio state; cả desktop/touch có subtitles và đầu nhân vật nằm trong khung, phía trên vùng đọc.\n\n[Chơi game](http://127.0.0.1:4173/) · [So sánh trước/sau](http://127.0.0.1:5173/docs/opening-readability-proof/review.html) · [Video runtime ${seconds}s](opening-readability-proof/runtime/voice-scene.mp4) · [Kết quả/hash build](opening-readability-proof/verification.json). Video phòng học có mưa/ghế nhưng **0 câu đọc**, thu trực tiếp từ audio bus.\n\nBảy MP3 còn ${result.voice.bytes.toLocaleString('en-US')} byte; giảm ${(old.voice.bytes - result.voice.bytes).toLocaleString('en-US')} byte asset tiếng nói. 99 file cũ được chuyển nguyên hash vào lịch sử, không còn trong production. CinematicGame JS ${result.bundle.before.toLocaleString('en-US')} → ${result.bundle.after.toLocaleString('en-US')} byte; cảnh báo chunk >500 kB của Vite còn tồn tại. PNG logo gốc, tạo hình, motif và reducers cốt truyện giữ nguyên hash.\n\nLệnh cụ thể và timestamp trong [qa-execution.json](opening-readability-proof/qa-execution.json). Đã chạy thêm \`node scripts/record-opening-refinement.mjs\` để ghi hình và \`node scripts/finalize-opening-refinement.mjs\` để đối chiếu hash/media. Không đo hiệu năng/duyệt art trên thiết bị thật; Safari/iOS và playtest người dùng chưa kiểm chứng. Không deploy/push hoặc mở Gate 3.`);
prepend('docs/qa-report.md', `# Chỉ dẫn mở đầu + lớp học đọc phụ đề\n\n17/11/2026: **41 unit + 27 E2E PASS**, typecheck/lint/build PASS. Bảy câu narrator, không có giọng ở AION/2026/conversation. Logo tròn và góc thoại/UI đã kiểm tra runtime desktop/mobile emulation. [Báo cáo hiện tại](OPENING_AND_CLASSROOM_REFINEMENT.md), [review](opening-readability-proof/review.html). Các báo cáo 106 clip dưới đây là lịch sử.`);
prepend('docs/GAME_PRODUCTION_STATUS.md', `# Phạm vi hiện tại — lời dẫn mở đầu, logo và camera lớp học\n\nĐã giới hạn voice vào 7 câu narrator; AION và các nhân vật chỉ phụ đề. Sửa ô trắng quanh logo bằng hình tròn, chỉnh góc cận/hai người và vùng đọc trên desktop/mobile. **41 unit + 27 E2E PASS**, build/typecheck/lint PASS, menu → Credits đã chạy lại. [Nguồn/kết quả](OPENING_AND_CLASSROOM_REFINEMENT.md), [ảnh/video runtime](opening-readability-proof/review.html). Chưa có art approval/điện thoại thật/Safari; Gate 3 vẫn đóng, không deploy/push.`);
prepend('docs/VOICE_AND_SCHOOL_REPORT.md', `> **Đã được điều chỉnh theo yêu cầu tiếp theo:** production chỉ giữ 7 câu của người dẫn mở đầu, không đọc hội thoại. [Báo cáo hiện tại](OPENING_AND_CLASSROOM_REFINEMENT.md). Nội dung 106 clip bên dưới là lịch sử.`);
console.log(JSON.stringify(result, null, 2));
