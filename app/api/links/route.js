// app/api/links/route.js
export async function GET() {
    const links = [
        "https://t.me/EmonNullbot",
        "https://t.me/+nX2UZmort90wOGYx",
        "https://t.me/Puxadasdopedro1",
        "https://t.me/NeoBuscasS2",
        "https://t.me/ConsultasJackdivulgador2",
        "https://t.me/+jagEMxJty4Q3ZTIx",
        "https://t.me/+dwrUUHYlao1mNDI0"
    ];

    const bestLinks = [
        "https://t.me/EmonNullbot",
        "https://t.me/Puxadasdopedro1"
    ];

    return Response.json(links.map(link => ({
        url: link,
        isBest: bestLinks.includes(link)
    })));
}
