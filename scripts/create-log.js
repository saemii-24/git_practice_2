import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

// __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 날짜
const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, "0");
const dd = String(today.getDate()).padStart(2, "0");
const filename = `${yyyy}-${mm}-${dd}.md`;

// 경로
const folderPath = path.join(__dirname, "..", "docs", "daily-log");
const filePath = path.join(folderPath, filename);

// 커밋 메시지
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
      const match = msg.match(
        /^(\p{Emoji_Presentation}|\p{Emoji}\ufe0f?)\s(.+)$/u
      );
      if (match) {
        const [, prefix, content] = match;
        if (!grouped[prefix]) grouped[prefix] = [];
        grouped[prefix].push(content.trim());
      } else {
        // 매칭 안 되는 것들은 "기타"로 처리
        if (!grouped["기타"]) grouped["기타"] = [];
        grouped["기타"].push(msg.trim());
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

// groupedSummary (prefix별 분류)
function generateGroupedSummary(grouped) {
  let summary = "";
  Object.entries(grouped).forEach(([prefix, items]) => {
    const title =
      {
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
        "🧹": "chore",
      }[prefix] || "기타";

    summary += `\n### ${prefix} ${title}\n`;
    summary += items.map((item) => `- ${item}`).join("\n") + "\n";
  });

  return summary.trim();
}

// 템플릿
function generateTemplate(fullList, groupedSummary) {
  return `# 🌟 ${yyyy}-${mm}-${dd} 커밋 내역

### 📌 주요 작업 내용
- 

### 🔧 커밋 내역
\`\`\`bash
${fullList}
\`\`\`

---

${groupedSummary}

### 💬 고민 & 메모
- 
`;
}

// 📂 이미 만들어진 로그 업데이트
const { fullList, grouped } = getTodayCommits();
const groupedSummary = generateGroupedSummary(grouped);
const template = generateTemplate(fullList, groupedSummary);

if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath, { recursive: true });
}

if (fs.existsSync(filePath)) {
  const existing = fs.readFileSync(filePath, "utf-8");

  // 🔧 커밋 내역 ~ 💬 고민 & 메모 이전까지 대체 (업데이트 함)
  const updated = existing.replace(
    /### 🔧 커밋 내역[\s\S]*?(?=### 💬 고민 & 메모)/,
    `### 🔧 커밋 내역\n\`\`\`bash\n${fullList}\n\`\`\`\n\n---\n\n${groupedSummary}\n\n`
  );

  fs.writeFileSync(filePath, updated);
  console.log("♻️ 기존 로그 파일을 업데이트했습니다:", filePath);
} else {
  fs.writeFileSync(filePath, template);
  console.log("✅ 오늘의 로그 파일이 생성되었습니다:", filePath);
}
