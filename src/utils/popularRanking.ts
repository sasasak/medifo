// 검색 페이지 "많이 찾는 약"과 홈 "많이 복용하는 약 주의사항" 집계 기준
// (DB 함수 get_popular_search_terms / get_popular_medicines의 p_min_users로 넘김)

// 집계에 포함할 최소 사용자 수. 이보다 적은 사용자가 검색·등록한 항목은
// 다른 사용자에게 보이지 않게 한다 (한 사람의 검색 기록이 그대로 노출되는 것 방지).
// 시연/테스트 때 1로 낮추면 집계 결과가 대체 목록보다 앞에 온다.
// 캐시 키에 이 값이 포함되므로 값을 바꾸면 캐시를 기다리지 않고 바로 반영된다.
export const MIN_USERS = 3;

// 집계 결과 캐시 시간(초). 모든 사용자에게 같은 결과라 요청마다 다시 계산하지 않는다.
export const POPULAR_REVALIDATE_SECONDS = 60 * 60;
