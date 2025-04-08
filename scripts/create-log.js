import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

// __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 날짜 포맷
const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, "0");
const dd = String(today.getDate()).padStart(2, "0");
const filename = `${yyyy}-${mm}-${dd}.md`;

// 경로 설정
const folderPath = path.join(__dirname, "..", "docs", "daily-log");
const filePath = path.join(folderPath, filename);

// prefix
const prefixMap = {
  "✨": "feat",
  "♻️": "refactor",
  "🐛": "fix",
  "📝": "docs",
  "🚀": "deploy",
  "🔥": "remove",
  "🔧": "config",
  "✅": "test",
  "🎨": "style",
  "🔀": "merge",
  "feat:": "feat",
  "fix:": "fix",
  "refactor:": "refactor",
  "docs:": "docs",
  "test:": "test",
  "style:": "style",
  "chore:": "chore",
  "config:": "config",
};

// 이모지 선택택
const reverseEmojiMap = {
  feat: "✨",
  refactor: "♻️",
  fix: "🐛",
  docs: "📝",
  deploy: "🚀",
  remove: "🔥",
  config: "🔧",
  test: "✅",
  style: "🎨",
  merge: "🔀",
  chore: "🧹",
};

// 커밋메세지 가져와서 h3 만들기
function getTodayCommits() {
  const since = `${yyyy}-${mm}-${dd}T00:00:00`;
  const until = `${yyyy}-${mm}-${dd}T23:59:59`;

  try {
    const raw = execSync(
      `git log --since="${since}" --until="${until}" --pretty=format:"%s"`,
      { encoding: "utf-8" }
    ).trim();

    if (!raw) return { fullList: "- (오늘 커밋 없음)", grouped: {} };

    const messages = raw.split("\n");
    const fullList = messages.map((msg) => `git commit -m "${msg}"`).join("\n");

    const grouped = {};
    messages.forEach((msg) => {
      const match = msg.match(/^([^\s:]+[:]?|[^\s]+)\s(.+)/);
      if (match) {
        let [_, rawPrefix, content] = match;
        const normalizedPrefix = prefixMap[rawPrefix] || "기타";

        if (!grouped[normalizedPrefix]) grouped[normalizedPrefix] = [];
        grouped[normalizedPrefix].push(content.trim());
      }
    });

    return { fullList, grouped };
  } catch (e) {
    return {
      fullList: "- (커밋 내역을 가져오는 데 실패했습니다)",
      grouped: {},
    };
  }
}

// 📝 템플릿
const { fullList, grouped } = getTodayCommits();

let groupedSummary = "";
Object.entries(grouped).forEach(([normalizedPrefix, items]) => {
  const emoji = reverseEmojiMap[normalizedPrefix] || "📦";
  groupedSummary += `\n### ${emoji} ${normalizedPrefix}\n`;
  groupedSummary += items.map((item) => `- ${item}`).join("\n") + "\n";
});

const template = `# 🌟 ${yyyy}-${mm}-${dd} 커밋 로그

## 📌 주요 작업 내용
- 

## 🔧 커밋 내역
\`\`\`bash
${fullList}
\`\`\`

${groupedSummary.trim()}

## 💬 고민 & 메모
- 
`;

// 📂 디렉토리 및 파일 생성
if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath, { recursive: true });
}

if (fs.existsSync(filePath)) {
  console.log("⚠️ 이미 오늘의 로그가 존재합니다:", filePath);
} else {
  fs.writeFileSync(filePath, template);
  console.log("✅ 오늘의 로그 파일이 생성되었습니다:", filePath);
}
