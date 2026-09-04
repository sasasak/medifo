import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/**
 * 서버 렌더링 시 false, 클라이언트에서 마운트된 이후 true를 반환.
 * next-themes처럼 서버/클라이언트 렌더 결과가 다를 수밖에 없는 값(theme 등)을
 * 하이드레이션 완료 전까지 숨길 때 사용.
 */
export function useHasMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
