// api/pagar.ts
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { token, amount, email } = req.body;

  try {
    const response = await fetch('https://api.culqi.com/v2/charges', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CULQI_SK}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amount,
        currency_code: 'PEN',
        email: email,
        source_id: token,
        description: 'Compra en IvanoStore'
      })
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Error al procesar el cargo' });
  }
}