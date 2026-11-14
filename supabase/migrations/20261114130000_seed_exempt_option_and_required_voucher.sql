-- Marca la opción "Sin Paquete" como exenta: al elegirla, el comprobante es opcional.
UPDATE public.event_form_fields f
SET exempt_option = (
  SELECT o.value
  FROM jsonb_array_elements_text(f.options) AS o(value)
  WHERE lower(o.value) LIKE 'sin paquete%'
  LIMIT 1
)
WHERE f.name = 'package'
  AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements_text(f.options) AS o(value)
    WHERE lower(o.value) LIKE 'sin paquete%'
  );

-- El comprobante vuelve a ser obligatorio en devfest-26 (exento solo con "Sin Paquete").
UPDATE public.event_form_fields f
SET required = true
FROM public.events e
WHERE f.event_id = e.id
  AND e.slug = 'devfest-26'
  AND f.name = 'voucher'
  AND f.type = 'file';
