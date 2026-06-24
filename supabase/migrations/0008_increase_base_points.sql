create or replace function complete_activity(
  p_child uuid, p_video uuid, p_correct int, p_answers jsonb
) returns table(base_points int, bonus_points int, total_points int)
language plpgsql security invoker set search_path = public as $$
declare v_base int := 50; v_bonus int; v_total int;
begin
  if not exists (select 1 from child_profiles cp where cp.id = p_child and cp.user_id = auth.uid()) then
    raise exception 'not authorized';
  end if;
  v_bonus := p_correct * 5;
  insert into activities(child_profile_id, video_id, base_points, bonus_points, answers)
    values (p_child, p_video, v_base, v_bonus, p_answers);
  insert into badges(child_profile_id, video_id) values (p_child, p_video)
    on conflict (child_profile_id, video_id) do nothing;
  update child_profiles cp set total_points = cp.total_points + v_base + v_bonus
    where cp.id = p_child returning cp.total_points into v_total;
  return query select v_base, v_bonus, v_total;
end; $$;
