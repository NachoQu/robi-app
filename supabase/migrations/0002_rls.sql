alter table child_profiles enable row level security;
alter table videos enable row level security;
alter table video_assignments enable row level security;
alter table quiz_questions enable row level security;
alter table activities enable row level security;
alter table badges enable row level security;
alter table vouchers enable row level security;
alter table redemptions enable row level security;
alter table parent_settings enable row level security;

-- Tablas con user_id directo
create policy own_profiles on child_profiles using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_videos on videos using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_vouchers on vouchers using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_settings on parent_settings using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Tablas que joinean a child_profiles del usuario
create policy own_assignments on video_assignments using (
  child_profile_id in (select id from child_profiles where user_id = auth.uid())
) with check (
  child_profile_id in (select id from child_profiles where user_id = auth.uid())
);
create policy own_activities on activities using (
  child_profile_id in (select id from child_profiles where user_id = auth.uid())
) with check (
  child_profile_id in (select id from child_profiles where user_id = auth.uid())
);
create policy own_badges on badges using (
  child_profile_id in (select id from child_profiles where user_id = auth.uid())
) with check (
  child_profile_id in (select id from child_profiles where user_id = auth.uid())
);
create policy own_redemptions on redemptions using (
  child_profile_id in (select id from child_profiles where user_id = auth.uid())
) with check (
  child_profile_id in (select id from child_profiles where user_id = auth.uid())
);

-- quiz_questions: legible si el video pertenece al usuario
create policy own_questions on quiz_questions using (
  video_id in (select id from videos where user_id = auth.uid())
) with check (
  video_id in (select id from videos where user_id = auth.uid())
);
