/**
 * 정부 부서 정보 및 매핑 유틸리티
 */

// 중소벤처기업부 API 관련 상수
export const FULL_URL_1421000 =
  "https://apis.data.go.kr/1421000/mssBizService_v2/getbizList_v2";

// 부서 키에 따른 부서명 매핑
export const DEPARTMENT_MAP: Record<string, string> = {
  "1421000": "중기부",
};

// 부서 키에 따른 전체 부서명 매핑
export const DEPARTMENT_FULL_NAMES: Record<string, string> = {
  "1421000": "중소벤처기업부",
};

// 부서명에 따른 부서 키 매핑 (역방향)
export const DEPARTMENT_KEYS: Record<string, string> = {
  중기부: "1421000",
};

// 부서별 API 엔드포인트 매핑
export const DEPARTMENT_API_ENDPOINTS: Record<string, string> = {
  "1421000": FULL_URL_1421000,
};

/**
 * 부서 키로 부서명을 가져오는 함수
 */
export function getDepartmentName(departmentKey: string): string {
  return DEPARTMENT_MAP[departmentKey] || "중기부";
}

/**
 * 부서 키로 전체 부서명을 가져오는 함수
 */
export function getDepartmentFullName(departmentKey: string): string {
  return DEPARTMENT_FULL_NAMES[departmentKey] || "중소벤처기업부";
}

/**
 * itemId에서 부서 정보를 추출하는 함수
 */
export function getDepartmentFromItemId(itemId: string): string {
  // itemId가 "departmentKey_originalId" 형태인 경우
  if (itemId.includes("_")) {
    const parts = itemId.split("_");
    const departmentKey = parts[0];

    // 부서 키가 유효한지 확인
    if (departmentKey) {
      return getDepartmentName(departmentKey);
    }
  }

  // itemId에 부서 정보가 없는 경우 기본값
  return "중기부";
}

/**
 * departmentKey에서 부서 정보를 추출하는 함수 (새로운 방식)
 */
export function getDepartmentFromKey(departmentKey: string): string {
  return getDepartmentName(departmentKey);
}

/**
 * 사용 가능한 모든 부서 정보를 반환하는 함수
 */
export function getAllDepartments() {
  return Object.entries(DEPARTMENT_MAP).map(([key, name]) => ({
    key: key,
    name: name,
    fullName: DEPARTMENT_FULL_NAMES[key],
  }));
}

/**
 * 부서 키가 유효한지 확인하는 함수
 */
export function isValidDepartmentKey(departmentKey: string): boolean {
  return departmentKey in DEPARTMENT_MAP;
}

/**
 * 부서 키로 API 엔드포인트를 가져오는 함수
 */
export function getDepartmentApiEndpoint(departmentKey: string): string {
  return (
    DEPARTMENT_API_ENDPOINTS[departmentKey] || "/mssBizService_v2/getbizList_v2"
  );
}
