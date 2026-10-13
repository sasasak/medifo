import PharmacyClient from './PharmacyClient';

// 약국 찾기
export default function Pharmacy() {
  return (
    <section>
      <h1 className="text-2xl font-bold">주변 약국</h1>
      <div className="mt-6">
        <PharmacyClient />
      </div>
    </section>
  );
}
