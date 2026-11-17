<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>AION · Những điều còn sáng</title><link rel="stylesheet" href="/wall-assets/wall.css"><script type="module" src="/wall-assets/wall.js"></script></head>
<body class="projection" data-endpoint="{{ $preview ? route('admin.stage.snapshot') : '/api/v1/wall/snapshot' }}" data-preview="{{ $preview ? 'true' : 'false' }}">
<canvas id="sky" aria-hidden="true"></canvas>
<link rel="stylesheet" href="/wall-assets/tribute.css">
<section id="tribute" class="tribute" hidden aria-live="polite"><span class="tribute-group"></span><h2 class="tribute-name"></h2><p class="tribute-copy"></p><span class="tribute-count"></span></section>
<button id="tribute-audio" class="tribute-audio" aria-pressed="false" hidden>Bật âm thanh · M</button>
<div class="horizon" aria-hidden="true"></div><div id="wishes" aria-hidden="true"></div>
<header class="wall-heading"><span class="eyebrow">THE UNWRITTEN LESSON</span><h1>Những điều <em>còn sáng.</em></h1><p>Một lời tri ân. Một ánh sáng ở lại.</p></header>
<main class="dedication" id="dedication" hidden><div class="message-marker">LỜI TRI ÂN ĐANG TỎA SÁNG</div><p id="recipient"></p><blockquote id="message"></blockquote><footer><span id="sender"></span><span id="page-number"></span></footer></main>
<div class="wall-signature">AION <span>✦</span> HUMAN WARMTH</div>
<div id="blackout" class="blackout"></div>
<div id="pair-hint" class="pair-hint" hidden><span class="eyebrow">AION · LIVE WALL</span><h2>Sẵn sàng nhận ánh sáng</h2><p>Mở liên kết ghép màn hình từ bảng điều khiển sân khấu.</p></div>
<button id="fullscreen" class="screen-start" hidden>Vào toàn màn hình · F</button>
</body></html>
