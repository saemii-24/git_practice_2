#!/bin/bash

# 브랜치명 입력받기
read -p "🔍 가져올 브랜치명을 입력하세요: " BRANCH_NAME

# 입력 없으면 종료
if [ -z "$BRANCH_NAME" ]; then
  echo "❌ 브랜치명이 입력되지 않았습니다. 종료합니다."
  exit 1
fi

echo "📦 브랜치명: $BRANCH_NAME"

# 로컬 브랜치에 존재하는지 확인
if git show-ref --verify --quiet refs/heads/$BRANCH_NAME; then
  echo "✅ 이미 로컬에 존재하는 브랜치입니다. 해당 브랜치로 이동합니다."
  git checkout $BRANCH_NAME
else
  echo "🔄 로컬에 없는 브랜치입니다. 원격에서 가져옵니다..."
  git fetch origin $BRANCH_NAME

  # fetch 성공 여부 확인
  if [ $? -ne 0 ]; then
    echo "❌ 원격에 없는 브랜치입니다. 브랜치 이름을 확인해주세요."
    exit 1
  fi

  # 로컬 브랜치 생성 + 트래킹 설정
  git checkout -b $BRANCH_NAME origin/$BRANCH_NAME
  echo "✅ 로컬 브랜치 생성 및 체크아웃 완료: $BRANCH_NAME"
fi
