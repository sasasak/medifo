'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { profileSchema } from '@/schemas/profileSchema';
import { toFieldErrors } from '@/schemas/zodErrors';

type UpdateProfileState = { error: string; success: boolean };

export const updateProfileAction = async (
  _: UpdateProfileState,
  formData: FormData,
): Promise<UpdateProfileState> => {
  const parsed = profileSchema.safeParse({
    nickname: (formData.get('nickname') as string) ?? '',
  });

  if (!parsed.success) {
    const fieldErrors = toFieldErrors(parsed.error);
    return {
      error: fieldErrors.nickname ?? '입력값을 확인해주세요.',
      success: false,
    };
  }

  const { nickname } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: '로그인 정보를 확인할 수 없습니다. 다시 로그인해주세요.',
      success: false,
    };
  }

  const { error } = await supabase
    .from('users')
    .update({ nickname })
    .eq('id', user.id);

  if (error) {
    return {
      error: '닉네임 변경에 실패했습니다. 다시 시도해주세요.',
      success: false,
    };
  }

  revalidatePath('/mypage');
  return { error: '', success: true };
};
