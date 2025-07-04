#!/bin/bash

# === 설정 ===
TARGET_BRANCH=${1:-main}   # 인자로 브랜치 안 넘기면 기본은 main
# 이 브랜치는 이동할 브랜치임
# ${number} 사용자가 쉘스크립트 실행하면서 입력한 순서대로 해당 값에 들어감
# 만약 기본값 설정하고 싶을 때는 하이픈 써서 작성하면 됨

# === 현재 브랜치 저장 ===
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD) # 지금 내가 작업중인 branch $()형태로, 명령어 실행 결과를 넣으란 의미임
# 변수 선언할 때 = 양 옆으로 공백 없어야됨. 공백 있으면 에러남 

echo "🔄 현재 브랜치: $CURRENT_BRANCH" #echo = 문자열을 출력하라
echo "📍 병합 대상 브랜치: $TARGET_BRANCH"

# === 변경사항 있는지 확인 ===
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "1️⃣  변경사항 stash 저장 중..."
  git stash push -m "auto-stash before merging $TARGET_BRANCH"
  STASHED=1
else
  echo "✅ 변경사항 없음 (stash 생략)"
  STASHED=0
fi

# === 병합 대상 브랜치로 이동 ===
echo "2️⃣  $TARGET_BRANCH 브랜치로 이동"
git checkout "$TARGET_BRANCH"

echo "3️⃣  최신 내용 pull"
git pull origin "$TARGET_BRANCH"  # ← rebase ❌, 그냥 병합

echo "4️⃣  원래 브랜치로 복귀: $CURRENT_BRANCH"
git checkout "$CURRENT_BRANCH"

# === 병합 ===
echo "5️⃣  최신 $TARGET_BRANCH 내용과 병합"
git merge "$TARGET_BRANCH"

# === 충돌 여부 확인 ===
if [ $? -ne 0 ]; then #ne = not equal 0은 성공 1이상은 실패 #$?는 명령어 종료 상태 코드
  echo "❌ 병합 중 충돌 발생! 수동 해결 필요"
  exit 1 #스크립트 실행 멈추고 실패했음 표시 (js return과 비슷함)
fi

# === stash 복원 ===
if [ "$STASHED" -eq 1 ]; then
  echo "6️⃣ stash 복원하시겠습니까? (y/n)"
  read -r REPLY #사용자 입력 대기 사용자의 응답이 REPLY에 저장
  if [[ "$REPLY" =~ ^[Yy]$ ]]; then
    echo "✅ stash 복원 중..."
    git stash pop
  else
    echo "❗ stash는 그대로 남아있습니다. 필요 시 'git stash list' 확인"
  fi
fi

echo "🎉 브랜치 최신화 완료!"
