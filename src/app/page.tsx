/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/jsx-no-comment-textnodes */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(false);
      router.replace("/login");
    }, 2000); // tempo da splash (2s)

    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white gap-6">

      {/* ÍCONE DO EASYFARM */}


      <img src="favicon.ico" alt="EasyFarm" className="w-32 h-32 object-contain" />

      {/* NOME DO APLICATIVO */}
      <h1 className="text-2xl font-bold text-gray-800">EasyFarm</h1>
      <p className="text-gray-500">Gerenciador de Granja</p>

      {/* SPINNER DE CARREGAMENTO */}
      <div className="mt-6">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent"></div>
      </div>
    </div>
  );
}
