/**
 * 단계 제목은 그 단계를 시작할 때 추가한다.
 * 여기 없는 단계 번호를 쓴 글은 velite 빌드에서 막힌다.
 */
export const WHY_SERIES = {
  id: 'why-frontend',
  title: '프론트엔드 톺아보기',
  /** 화면에는 보이지 않고, 검색 결과·공유 미리보기 설명(meta description)으로만 쓴다 */
  description: '쓸 줄 아는 기술을, 왜 쓰는지 설명할 수 있는 기술로.',
  href: '/blog/series/why-frontend',
  stages: {
    0: '웹은 어떻게 동작하나',
  } as Record<number, string>,
};

export function getStageTitle(stage: number) {
  return WHY_SERIES.stages[stage];
}

export function isSeriesStage(stage: number) {
  return stage in WHY_SERIES.stages;
}

/** seriesOrder 규칙: 0~799 필수, 800~ 선택, 900 실험, 999 회고 */
export function formatSeriesNumber(stage: number, order: number) {
  if (order === 999) return `${stage}-회고`;
  if (order === 900) return `${stage}-실험`;
  if (order >= 800) return `${stage}-선택${order - 799}`;
  return `${stage}-${order}`;
}

/** 제목 앞의 "[Why 0-0] " 접두어를 뗀다. 목차에서는 번호를 따로 보여 준다. */
export function stripSeriesPrefix(title: string) {
  return title.replace(/^\[Why [^\]]+\]\s*/, '');
}
