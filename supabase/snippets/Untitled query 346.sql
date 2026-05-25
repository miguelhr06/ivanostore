alter policy "Gestión propia de direcciones"
on "public"."direcciones"
to authenticated, anon
using (
  true
)
with check (
  usuario_email = usuario_email
);