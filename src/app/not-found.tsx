import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{background: '#fafaf8'}}>
      <div className="text-center max-w-md">
        <p style={{fontSize: 80, fontWeight: 300, color: '#d4d4d4', lineHeight: 1}}>404</p>
        <h1 style={{fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, fontWeight: 400, marginTop: 16, color: '#1c1917'}}>
          Pagina nao encontrada
        </h1>
        <p style={{marginTop: 12, fontSize: 15, color: '#78716c', lineHeight: 1.6}}>
          A pagina que procuras nao existe ou foi movida.
        </p>
        <div style={{marginTop: 28, display: 'flex', gap: 10, justifyContent: 'center'}}>
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '10px 20px', borderRadius: 10,
            background: '#1c1917', color: 'white',
            fontSize: 14, fontWeight: 600, textDecoration: 'none',
          }}>
            Voltar ao inicio
          </Link>
          <Link href="/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '10px 20px', borderRadius: 10,
            border: '1px solid #e7e5e4', color: '#1c1917',
            fontSize: 14, fontWeight: 600, textDecoration: 'none',
          }}>
            Entrar
          </Link>
        </div>
      </div>
    </div>
  );
}
