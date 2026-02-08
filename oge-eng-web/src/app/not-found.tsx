import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-screen items-center justify-center text-center">
      <div>
        <h1 className="m-0 text-[120px] text-white">404</h1>
        <p className="mb-[20px] text-[48px] text-white">
          Страница не найдена :(
        </p>
        <Link
          href="/"
          className="text-lg text-white underline decoration-[#42b983]"
        >
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
}
