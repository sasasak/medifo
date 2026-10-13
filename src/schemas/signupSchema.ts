import { z } from 'zod';

// 이메일 형식 검사용 정규식
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 비밀번호 정규식 (8자리 이상, 특수문자 하나 포함)
export const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

export const signupSchema = z
  .object({
    email: z
      .string()
      .min(1, '이메일을 입력해주세요.')
      .regex(emailRegex, '올바른 이메일 형식이 아닙니다.'),
    password: z
      .string()
      .min(1, '비밀번호를 입력해주세요.')
      .regex(
        passwordRegex,
        '비밀번호는 8자 이상, 특수문자를 1개 이상 포함해야 합니다.',
      ),
    confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요.'),
    nickname: z.string().min(1, '닉네임을 입력해주세요.'),
  })
  .refine((data) => !data.password || data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
  });

export type SignupInput = z.infer<typeof signupSchema>;
