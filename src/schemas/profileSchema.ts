import { z } from 'zod';

export const profileSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(1, '닉네임을 입력해주세요.')
    .max(20, '닉네임은 20자 이하로 입력해주세요.'),
});

export type ProfileInput = z.infer<typeof profileSchema>;
