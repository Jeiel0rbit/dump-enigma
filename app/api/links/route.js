const reports = new Map();
const captchaSessions = new Map();
const rateLimitMap = new Map();

function generateCaptcha() {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  return { question: `${num1} + ${num2} = ?`, answer: num1 + num2 };
}

export async function GET(req) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();
  const url = new URL(req.url);
  const userAnswer = url.searchParams.get("captcha");

  // Rate Limit
  if (rateLimitMap.has(ip) && rateLimitMap.get(ip).count >= 50) {
    return new Response(
      JSON.stringify({ error: "Muitas requisições, tente mais tarde." }),
      { status: 429 }
    );
  }
  if (!rateLimitMap.has(ip) || now - rateLimitMap.get(ip).timestamp > 60000) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
  } else {
    rateLimitMap.get(ip).count++;
  }

  // Gera ou obtém sessão de captcha
  if (!captchaSessions.has(ip)) {
    captchaSessions.set(ip, { ...generateCaptcha(), solved: false, time: now });
  }

  const session = captchaSessions.get(ip);

  // Verifica a resposta do captcha
  if (userAnswer !== null) {
    const parsedAnswer = parseInt(userAnswer);
    if (parsedAnswer === session.answer) {
      // Atualiza a sessão imediatamente como resolvida
      captchaSessions.set(ip, { ...session, solved: true, time: now });
    } else {
      // Gera novo captcha se a resposta estiver errada
      captchaSessions.set(ip, { ...generateCaptcha(), solved: false, time: now });
      return new Response(
        JSON.stringify({
          error: "Captcha incorreto!",
          captcha: { question: captchaSessions.get(ip).question },
        }),
        { status: 400 }
      );
    }
  }

  // Retorna links e imagem se resolvido
  if (captchaSessions.get(ip).solved && now - captchaSessions.get(ip).time < 30000) {
    const links = [
      "https://t.me/EmonNullbot",
      "https://t.me/+nX2UZmort90wOGYx",
      "https://t.me/Puxadasdopedro1",
      "https://t.me/NeoBuscasS2",
      "https://t.me/ConsultasJackdivulgador2",
      "https://t.me/+jagEMxJty4Q3ZTIx",
      "https://t.me/+dwrUUHYlao1mNDI0",
    ];
    const bestLinks = [
      "https://t.me/EmonNullbot",
      "https://t.me/Puxadasdopedro1",
    ];
    // Usa a imagem local de public/
    const imageUrl = "/logo.png"; // Referencia diretamente a imagem em public/
    return new Response(
      JSON.stringify({ links, bestLinks, image: imageUrl }),
      { status: 200 }
    );
  }

  // Retorna captcha se ainda não resolvido
  return new Response(
    JSON.stringify({ captcha: { question: session.question } }),
    { status: 200 }
  );
}

export async function POST(req) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const { link } = await req.json();

  if (reports.has(ip)) {
    return new Response(
      JSON.stringify({
        error: "Você já reportou recentemente. Tente novamente após alguns minutos.",
      }),
      { status: 429 }
    );
  }
  reports.set(ip, Date.now());
  setTimeout(() => reports.delete(ip), 600000);

  await fetch("https://ntfy.sh/list-link", {
    method: "POST",
    body: `Reportado referente ao link ${link}`,
  });

  return new Response(
    JSON.stringify({ message: "Report enviado com sucesso." }),
    { status: 200 }
  );
}