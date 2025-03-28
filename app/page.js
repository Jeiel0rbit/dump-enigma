"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [links, setLinks] = useState(null);
  const [bestLinks, setBestLinks] = useState([]);
  const [reportedLinks, setReportedLinks] = useState([]);
  const [captcha, setCaptcha] = useState(null);
  const [captchaInput, setCaptchaInput] = useState("");
  const [image, setImage] = useState(null); // Estado para a imagem da API
  const [error, setError] = useState(null);

  const fetchData = async (answer = null) => {
    try {
      const url = answer ? `/api/links?captcha=${answer}` : "/api/links";
      const res = await fetch(url);

      if (res.status === 429) {
        setError("Você atingiu o limite de requisições. Tente novamente mais tarde.");
        return;
      }

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setCaptcha(data.captcha);
        setCaptchaInput("");
      } else if (data.captcha) {
        setCaptcha(data.captcha);
      } else {
        setLinks(data.links);
        setBestLinks(data.bestLinks);
        setImage(data.image); // Define a imagem retornada pela API
        setCaptcha(null);
      }
    } catch (err) {
      setError("Erro ao carregar os dados.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const verifyCaptcha = () => {
    if (!captchaInput || isNaN(captchaInput)) {
      setError("Digite um número válido no captcha.");
      return;
    }
    fetchData(captchaInput);
  };

  const reportLink = async (link) => {
    if (reportedLinks.includes(link)) {
      setError("Link já reportado!");
      return;
    }

    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link }),
      });

      const result = await res.json();

      if (res.status === 200) {
        setReportedLinks([...reportedLinks, link]);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Erro ao reportar o link.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen justify-between bg-gray-100">
      <div className="container mx-auto text-center mt-10">
        {/* Renderiza a imagem da API ou um placeholder enquanto não há resposta */}
        <img
          src={image || "/logo.png"} // Fallback para um placeholder
          alt="Imagem"
          className="rounded-full mx-auto mb-4"
          width="150"
          height="150" // Adicionado para consistência
          onError={(e) => (e.target.src = "https://via.placeholder.com/150")} // Fallback em caso de erro
        />
        <h3 className="font-bold text-2xl">Lista de Links</h3>

        {error && <p className="text-red-500 mt-2">{error}</p>}

        {captcha ? (
          <div className="mt-5">
            <p className="text-gray-600 text-sm">{captcha.question}</p>
            <input
              type="number"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              className="border rounded px-2 py-1 mt-2"
              placeholder="Digite a resposta"
            />
            <button
              onClick={verifyCaptcha}
              className="ml-3 px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white"
            >
              Verificar
            </button>
          </div>
        ) : links ? (
          <div className="mt-5 max-w-lg mx-auto">
            {links.map((link) => (
              <div
                key={link}
                className="bg-white shadow-md p-3 mb-3 rounded-lg flex justify-between items-center hover:scale-105 transition"
              >
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 font-semibold truncate"
                >
                  {link}
                </a>
                {bestLinks.includes(link) && (
                  <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold border-2 border-orange-500 animate-pulse">
                    Best
                  </span>
                )}
                <button
                  onClick={() => reportLink(link)}
                  className={`ml-3 px-3 py-1 rounded ${
                    reportedLinks.includes(link)
                      ? "bg-gray-400"
                      : "bg-red-500 hover:bg-red-600"
                  } text-white`}
                  disabled={reportedLinks.includes(link)}
                >
                  {reportedLinks.includes(link) ? "Reportado" : "Reportar"}
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <footer className="bg-gray-800 text-white text-center py-3 mt-auto">
        [Desde 2025] Me ajude a denunciar esses grupos de consulta. Botão de reportar serve para me notificar que o grupo está banido com sucesso.
      </footer>
    </div>
  );
}
