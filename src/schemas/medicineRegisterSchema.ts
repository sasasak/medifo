import { z } from 'zod';

export const REPEAT_TYPES = ['daily', 'once'] as const;

export const medicineRegisterSchema = z.object({
  repeatType: z.enum(REPEAT_TYPES, { message: '복용 주기를 선택해주세요.' }),
  startDate: z
    .string()
    .min(1, '시작 날짜를 선택해주세요.')
    .regex(/^\d{4}-\d{2}-\d{2}$/, '올바른 날짜 형식이 아닙니다.'),
  times: z
    .array(z.string().min(1, '복용 시간을 설정해주세요.'))
    .min(1, '복용 시간을 추가해주세요.'),
});

export type MedicineRegisterInput = z.infer<typeof medicineRegisterSchema>;
export type RepeatType = (typeof REPEAT_TYPES)[number];
