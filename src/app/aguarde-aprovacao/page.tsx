export default function AguardeAprovacaoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E3F7E9] px-4">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-md p-8 text-center">
        <h1 className="text-2xl font-semibold mb-4 text-gray-800">
          Cadastro recebido
        </h1>
        <p className="text-gray-600 mb-4">
          Seu cadastro foi enviado para análise do administrador do sistema.
        </p>
        <p className="text-gray-600 mb-4">
          Assim que sua conta for aprovada e vinculada a uma granja, você poderá
          acessar o painel normalmente.
        </p>
        <p className="text-sm text-gray-400">
          Em caso de dúvidas, entre em contato com o responsável pelo sistema.
        </p>
      </div>
    </div>
  );
}
