create or replace function redeem_voucher(
  p_child uuid, p_voucher uuid
) returns table(new_total_points int)
language plpgsql security invoker set search_path = public as $$
declare v_cost int; v_current int; v_total int;
begin
  if not exists (select 1 from child_profiles cp where cp.id = p_child and cp.user_id = auth.uid()) then
    raise exception 'not authorized';
  end if;

  select points_cost into v_cost
    from vouchers v
    where v.id = p_voucher and v.user_id = auth.uid() and v.is_active = true;

  if not found then
    raise exception 'voucher not found or inactive';
  end if;

  select total_points into v_current from child_profiles where id = p_child;

  if v_current < v_cost then
    raise exception 'insufficient points';
  end if;

  update child_profiles cp set total_points = cp.total_points - v_cost
    where cp.id = p_child returning cp.total_points into v_total;

  insert into redemptions(child_profile_id, voucher_id) values (p_child, p_voucher);

  return query select v_total;
end; $$;
