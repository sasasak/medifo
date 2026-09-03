'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

type UpdateProfileState = { error: string; success: boolean };

export const updateProfileAction = async (
  _: UpdateProfileState,
  formData: FormData,
): Promise<UpdateProfileState> => {
  const nickname = formData.get('nickname') as string;

  if (!nickname || nickname.trim().length === 0) {
    return { error: '닉네임을 입력해주세요.', success: false };
  }

  if (nickname.length > 20) {
    return { error: '닉네임은 20자 이하로 입력해주세요.', success: false };
  }

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
    .update({ nickname: nickname.trim() })
    .eq('id', user.id);

  if (error) {
    return { error: '닉네임 변경에 실패했습니다. 다시 시도해주세요.', success: false };
  }

  revalidatePath('/mypage');
  return { error: '', success: true };
};
