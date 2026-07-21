import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-screen items-center justify-center text-center">
      <div>
        <h1 className="text-ink m-0 text-[120px]">404</h1>
        <p className="text-ink mb-[20px] text-[48px]">Страница не найдена :(</p>
        <Link
          href="/"
          className="text-ink text-lg underline decoration-[#42b983]"
        >
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
}
