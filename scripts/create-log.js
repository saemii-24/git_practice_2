import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, "0");
const dd = String(today.getDate()).padStart(2, "0");
const filename = `${yyyy}-${mm}-${dd}.md`;

const folderPath = path.join(__dirname, "..", "docs", "daily-log");
const filePath = path.join(folderPath, filename);

const template = `# 🗓️ ${yyyy}-${mm}-${dd} 커밋 로그

---

## 📌 오늘의 주요 작업
- 작업한 내용을 정리한다!

---

## 🔧 커밋 내역
\`\`\`bash
git commit -m "✨ 기능: 사용자 로그인 구현"
git commit -m "♻️ 리팩토링: 반복 코드 함수화"
\`\`\`

---

## 📝 고민 & 메모
- 작업 과정에서의 고민과 메모 기록하기!

---

`;

if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath, { recursive: true });
}

if (fs.existsSync(filePath)) {
  console.log("이미 오늘의 로그가 존재합니다:", filePath);
} else {
  fs.writeFileSync(filePath, template);
  console.log("오늘의 로그 파일이 생성되었습니다:", filePath);
}
