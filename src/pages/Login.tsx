import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e: any) {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Buscar empresa do usuário
      const userRef = doc(db, "users", uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        setError("Usuário sem empresa vinculada.");
        return;
      }

      const { companyId } = snap.data();

      // Colocar companyId no token
      await fetch("https://identitytoolkit.googleapis.com/v1/accounts:update?key=" + process.env.REACT_APP_FIREBASE_API_KEY, {
        method: "POST",
        body: JSON.stringify({
          idToken: userCredential.user.accessToken,
          customAttributes: JSON.stringify({ companyId })
        })
      });

      window.location.href = "/dashboard";

    } catch (err: any) {
      setError("Erro ao fazer login. Verifique as credenciais.");
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-md w-96 space-y-4"
      >
        <h1 className="text-xl font-bold">Login</h1>

        <input
          type="email"
          placeholder="E-mail"
          className="w-full px-3 py-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Senha"
          className="w-full px-3 py-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
