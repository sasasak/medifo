import { z } from 'zod';
import { START_DATE_RANGE_MESSAGE } from '@/utils/intakeLogs/editableRange';

export const REPEAT_TYPES = ['daily', 'once'] as const;

interface MedicineRegisterSchemaOptions {
  minStartDate: string;
  // 수정 시 기존 시작일: 선택 범위보다 오래됐어도 그대로 유지하면 통과
  keepStartDate?: string;
}

export const createMedicineRegisterSchema = ({
  minStartDate,
  keepStartDate,
}: MedicineRegisterSchemaOptions) =>
  z.object({
    repeatType: z.enum(REPEAT_TYPES, { message: '복용 주기를 선택해주세요.' }),
    startDate: z
      .string()
      .min(1, '시작 날짜를 선택해주세요.')
      .regex(/^\d{4}-\d{2}-\d{2}$/, '올바른 날짜 형식이 아닙니다.')
      .refine(
        (value) => value >= minStartDate || value === keepStartDate,
        START_DATE_RANGE_MESSAGE,
      ),
    times: z
      .array(z.string().min(1, '복용 시간을 설정해주세요.'))
      .min(1, '복용 시간을 추가해주세요.'),
  });

export type MedicineRegisterInput = z.infer<
  ReturnType<typeof createMedicineRegisterSchema>
>;
export type RepeatType = (typeof REPEAT_TYPES)[number];
