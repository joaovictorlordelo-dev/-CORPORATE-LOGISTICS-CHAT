import { Suspense } from "react";
import ChatCliente from "./ChatCliente";

async function Conteudo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ChatCliente id={id} />;
}

export default function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <Conteudo params={params} />
    </Suspense>
  );
}