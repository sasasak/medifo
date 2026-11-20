import { AlertTriangle } from 'lucide-react';
import type { ReactNode } from 'react';
import type {
  ContraindicationInfo,
  ContraindicationPartner,
} from '../getContraindicationInfo';

interface ContraindicationAlertProps {
  info: ContraindicationInfo;
  // 약 설명서(e약은요)의 상호작용 값이 있어 아래 아코디언에 '상호작용' 항목이 보이는지
  hasInteractions: boolean;
}

// 짝 성분이 이 수를 넘으면 나머지는 접어 둔다 (데이터 기준 최대 38개)
const VISIBLE_PARTNER_COUNT = 5;
const TITLE_ID = 'dur-contraindication-title';
const TITLE = 'DUR 병용금기 성분 정보';
const EMPTY_REASON = '사유 정보 없음(DUR 원문 기준)';
// 이 카드가 보여주는 범위. 약 설명서의 상호작용과 다른 목록임을 알리려고 모든 상태에서 제목 바로 아래에 둔다
const SCOPE_NOTE =
  "식약처가 병용금기로 공식 지정한 성분 조합만 보여 줍니다. 약 설명서의 '상호작용'에는 이 목록에 없는 주의사항이 적혀 있을 수 있습니다";

// 카드 안 한글은 낱말 단위로 줄바꿈하고(break-keep), 칸보다 긴 성분명만 글자 단위로 나눠 넘치지 않게 한다(wrap-anywhere)
// 카드 안 글자는 대비 4.5 이상을 위해 text-muted(라이트 4.18) 대신 text-base를 쓰고 크기로 위계를 나눈다
// baseMonth를 넘기지 않으면(조회 실패) 출처 줄을 그리지 않는다
function Notices({ baseMonth }: { baseMonth?: string | null }) {
  return (
    <>
      <div className="text-text-base flex flex-col gap-1 text-sm">
        <p>
          이 정보는 식약처 공개 데이터를 참고용으로 보여주며 의사·약사의
          진단이나 처방을 대신하지 않습니다
        </p>
        <p>함께 복용 중인 약이 있다면 의사 또는 약사에게 확인해 보세요</p>
      </div>
      {baseMonth !== undefined && (
        <p className="text-text-base text-xs">
          식약처 의약품안전사용서비스(DUR) 공개 데이터
          {baseMonth && ` · ${baseMonth} 기준`}
        </p>
      )}
    </>
  );
}

function PartnerItem({ partner }: { partner: ContraindicationPartner }) {
  const reasons = partner.reasons.map((reason) => reason || EMPTY_REASON);
  return (
    <li>
      <span className="font-semibold">{partner.name}</span>
      {reasons.length === 1 ? (
        <>
          {' — '}
          {/* 사유는 원문 그대로 보여주고 원문의 줄바꿈도 유지한다 */}
          <span className="whitespace-pre-line">{reasons[0]}</span>
        </>
      ) : (
        <ul className="mt-1 list-disc pl-5">
          {reasons.map((reason, index) => (
            <li key={index} className="whitespace-pre-line">
              {reason}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function PartnerList({ partners }: { partners: ContraindicationPartner[] }) {
  const visible = partners.slice(0, VISIBLE_PARTNER_COUNT);
  const hidden = partners.slice(VISIBLE_PARTNER_COUNT);
  const listClass = 'text-text-base flex flex-col gap-2 text-sm';

  return (
    <div className="flex flex-col gap-2">
      <ul className={listClass}>
        {visible.map((partner) => (
          <PartnerItem key={partner.code} partner={partner} />
        ))}
      </ul>
      {hidden.length > 0 && (
        <details className="group">
          <summary className="text-text-base w-fit cursor-pointer rounded text-sm font-semibold">
            <span className="group-open:hidden">
              외 {hidden.length}개 더 보기
            </span>
            <span className="hidden group-open:inline">접기</span>
          </summary>
          <ul className={`${listClass} mt-2`}>
            {hidden.map((partner) => (
              <PartnerItem key={partner.code} partner={partner} />
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function NeutralCard({ children }: { children: ReactNode }) {
  return (
    <section
      aria-labelledby={TITLE_ID}
      className="bg-card border-border-light mt-4 flex flex-col gap-3 rounded-2xl border p-6 wrap-anywhere break-keep"
    >
      <h2 id={TITLE_ID} className="text-text-base font-bold">
        {TITLE}
      </h2>
      <p className="text-text-base text-sm">{SCOPE_NOTE}</p>
      {children}
    </section>
  );
}

export default function ContraindicationAlert({
  info,
  hasInteractions,
}: ContraindicationAlertProps) {
  // 조회 실패는 "조합 없음"과 구분한다 (목록에 없는 것처럼 읽히지 않게)
  if (info.status === 'error') {
    return (
      <NeutralCard>
        <p className="text-text-base text-sm">
          병용금기 성분 정보를 불러오지 못했습니다. 잠시 뒤 다시 확인해 주세요
        </p>
        <Notices />
      </NeutralCard>
    );
  }

  const withPartners = info.ingredients.filter(
    (ingredient) => ingredient.partners.length > 0,
  );

  if (withPartners.length === 0) {
    return (
      <NeutralCard>
        {/* 읽기 쉽도록 문장마다 줄을 나눈다 */}
        <div className="text-text-base flex flex-col gap-1 text-sm">
          <p>
            식약처 DUR 병용금기 지정 목록에서 이 약과 연결된 성분 조합이
            확인되지 않았습니다.
          </p>
          {/* 상호작용 항목이 없는 약은 화면에 없는 항목을 가리키지 않도록 이 문장을 뺀다 */}
          {hasInteractions && (
            <p>
              약 설명서의 &apos;상호작용&apos;에는 이 목록과 별개로 함께 복용할
              때 주의할 약이 적혀 있을 수 있습니다.
            </p>
          )}
          <p>목록에 없다는 것이 함께 복용해도 된다는 뜻은 아닙니다</p>
        </div>
        <Notices baseMonth={info.baseMonth} />
      </NeutralCard>
    );
  }

  return (
    // 다크 모드의 danger-border는 일반 카드 테두리와 같은 색이라 이 카드만 danger-200을 쓴다
    <section
      aria-labelledby={TITLE_ID}
      className="bg-card border-danger-border [.dark_&]:border-danger-200 mt-4 rounded-2xl border p-6 wrap-anywhere break-keep"
    >
      <div className="flex items-start gap-2">
        <AlertTriangle
          size={18}
          aria-hidden="true"
          className="text-danger-text mt-0.5 shrink-0"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <h2 id={TITLE_ID} className="text-danger-text font-bold">
            {TITLE}
          </h2>
          <p className="text-text-base text-sm">{SCOPE_NOTE}</p>
          {withPartners.map((ingredient) => (
            <div key={ingredient.code} className="flex flex-col gap-2">
              <p className="text-text-base text-sm">
                이 약의 성분({ingredient.name})은 식약처 DUR에서 아래 성분과
                병용금기로 지정되어 있습니다
              </p>
              <PartnerList partners={ingredient.partners} />
            </div>
          ))}
          <Notices baseMonth={info.baseMonth} />
        </div>
      </div>
    </section>
  );
}
